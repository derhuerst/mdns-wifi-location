'use strict'

const {strictEqual: eql} = require('assert')

// Version number of the representation. This must be zero.
// Implementations are required to check this field and make
// no assumptions about the format of unrecognized versions.
const VERSION = '0'

// If omitted, minutes and seconds default to zero, size defaults
// to 1m, horizontal precision defaults to 10000m, and vertical
// precision defaults to 10m.
const DEFAULT_SIZE = 1
const DEFAULT_H_PREC = 10000
const DEFAULT_V_PREC = 10

// […] expressed as a pair of four-bit unsigned
// integers, each ranging from zero to nine, with the most
// significant four bits representing the base and the second
// number representing the power of ten by which to multiply
// the base. This allows sizes from 0e0 (<1cm) to 9e9
// (90,000km) to be expressed. This representation was chosen
// such that the hexadecimal representation can be read by
// eye; 0x15 = 1e5. Four-bit values greater than 9 are
// undefined, as are values with a base of zero and a non-zero
// exponent.
const encSizePrec = (buf, sizeOrPrecision, offset) => {
	const exponent = Math.floor(Math.log10(sizeOrPrecision))
	const mantissa = Math.round(sizeOrPrecision / Math.pow(10, exponent))
	return buf.writeUInt8((mantissa << 4) + exponent, offset)
}

const assertEnc = (input, expected) => {
	const buf = Buffer.alloc(1)
	encSizePrec(buf, input, 0)
	eql(
		buf.toString('hex'),
		expected,
		`enc(${input}) should be 0x${expected}`,
	)
}
assertEnc(100, '12')
assertEnc(101, '12')
assertEnc(123456, '15')
assertEnc(9000000000, '99')
assertEnc(9000000001, '99')

const encodeLOCAnswer = (_) => {
	eql(typeof _.latitude, 'number', 'latitude')
	eql(typeof _.longitude, 'number', 'longitude')
	eql(typeof _.altitude, 'number', 'altitude')
	if ('size' in _) eql(typeof _.size, 'number', 'size')
	if ('hPrecision' in _) eql(typeof _.hPrecision, 'number', 'hPrecision')
	if ('vPrecision' in _) eql(typeof _.vPrecision, 'number', 'vPrecision')

	const buf = Buffer.alloc(
		1 // VERSION
		+ 1 // _.size
		+ 1 + 1 // _.hPrecision & _.vPrecision
		+ 4 + 4 + 4 // _.latitude, _.longitude & _.altitude
	)
	let offset = 0

	// VERSION
	// Version number of the representation. This must be zero.
	// Implementations are required to check this field and make
	// no assumptions about the format of unrecognized versions.
	offset = buf.writeUInt8(VERSION, offset)

	// SIZE
	// The diameter of a sphere enclosing the described entity, in
	// centimeters, […].
	// Since 20000000m (represented by the value 0x29) is greater
	// than the equatorial diameter of the WGS 84 ellipsoid
	// (12756274m), it is therefore suitable for use as a
	// "worldwide" size.
	const size = 'size' in _ ? _.size : DEFAULT_SIZE
	offset = encSizePrec(buf, size * 100, offset)

	// HORIZ PRE
	// The horizontal precision of the data, in centimeters,
	// expressed using the same representation as SIZE. This is
	// the diameter of the horizontal "circle of error", rather
	// than a "plus or minus" value. (This was chosen to match
	// the interpretation of SIZE; to get a "plus or minus" value,
	// divide by 2.)
	const hPrecision = 'hPrecision' in _ ? _.hPrecision : DEFAULT_H_PREC
	offset = encSizePrec(buf, hPrecision * 100, offset)

	// VERT PRE
	// The vertical precision of the data, in centimeters,
	// expressed using the sane representation as for SIZE. This
	// is the total potential vertical error, rather than a "plus
	// or minus" value. (This was chosen to match the
	// interpretation of SIZE; to get a "plus or minus" value,
	// divide by 2.)  Note that if altitude above or below sea
	// level is used as an approximation for altitude relative to
	// the [WGS 84] ellipsoid, the precision value should be
	// adjusted.
	const vPrecision = 'vPrecision' in _ ? _.vPrecision : DEFAULT_V_PREC
	offset = encSizePrec(buf, vPrecision * 100, offset)

	// LATITUDE
	// The latitude of the center of the sphere described by the
	// SIZE field, expressed as a 32-bit integer, most significant
	// octet first (network standard byte order), in thousandths
	// of a second of arc. 2^31 represents the equator; numbers
	// above that are north latitude.
	// todo: convert to arc seconds / 1000
	offset = buf.writeUInt32BE(_.latitude, offset)

	// LONGITUDE
	// The longitude of the center of the sphere described by the
	// SIZE field, expressed as a 32-bit integer, most significant
	// octet first (network standard byte order), in thousandths
	// of a second of arc, rounded away from the prime meridian.
	// 2^31 represents the prime meridian; numbers above that are
	// east longitude.
	// todo: convert to arc seconds / 1000
	offset = buf.writeUInt32BE(_.longitude, offset)

	// ALTITUDE
	// The altitude of the center of the sphere described by the
	// SIZE field, expressed as a 32-bit integer, most significant
	// octet first (network standard byte order), in centimeters,
	// from a base of 100,000m below the [WGS 84] reference
	// spheroid used by GPS (semimajor axis a=6378137.0,
	// reciprocal flattening rf=298.257223563).  Altitude above
	// (or below) sea level may be used as an approximation of
	// altitude relative to the the [WGS 84] spheroid, though due
	// to the Earth's surface not being a perfect spheroid, there
	// will be differences.  (For example, the geoid (which sea
	// level approximates) for the continental US ranges from 10
	// meters to 50 meters below the [WGS 84] spheroid.
	// Adjustments to ALTITUDE and/or VERT PRE will be necessary
	// in most cases.  The Defense Mapping Agency publishes geoid
	// height values relative to the [WGS 84] ellipsoid.
	// todo: convert to centimeters?
	offset = buf.writeUInt32BE(_.altitude, offset)

	return buf
}

module.exports = encodeLOCAnswer
