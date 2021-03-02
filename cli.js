#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v',
	]
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    announce-wifi-location-via-mdns <latitude> <longitude> [options]
Options:
    --altitude            -a  Altitude of your network, in meters.
                                Default: none
    --size                -s  Size of your network, in meters.
                                Default: 20
    --precision           -p  Horizontal precision of the coordinates, in meters.
                                Default: none
    --vertical-precision  -P  Vertical precision of the coordinates, in meters.
                                Default: none
Examples:
    announce-wifi-location-via-mdns 1.23 2.34 --altitude 800 -s 30
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const initMdns = require('multicast-dns')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const latitude = parseFloat(argv._[0])
if ('number' !== typeof latitude) {
	showError('Missing/invalid latitude argument.')
}
const longitude = parseFloat(argv._[0])
if ('number' !== typeof longitude) {
	showError('Missing/invalid longitude argument.')
}

const altitude = argv.altitude || argv.a
	? parseFloat(argv.altitude || argv.a)
	: null
if (altitude !== null && 'number' !== typeof altitude) {
	showError('Invalid altitude option.')
}

const size = argv.size || argv.s
	? parseFloat(argv.size || argv.s)
	: null
if (size !== null && 'number' !== typeof size) {
	showError('Invalid size option.')
}

const hPrecision = argv['horizontal-precision'] || argv.p
	? parseFloat(argv['horizontal-precision'] || argv.p)
	: null
if (hPrecision !== null && 'number' !== typeof hPrecision) {
	showError('Invalid hPrecision option.')
}
const vPrecision = argv['vertical-precision'] || argv.P
	? parseFloat(argv['vertical-precision'] || argv.P)
	: null
if (vPrecision !== null && 'number' !== typeof vPrecision) {
	showError('Invalid vPrecision option.')
}

const data = Buffer.alloc(0)

const mdns = initMdns()

mdns.on('query', (q) => {
	const question = q.questions.find(q => q.name === 'local' && q.type === 'LOC')
	if (!question) return;

	mdns.respond({
		answers: [{
			name: 'local',
			type: 'LOC',
			data,
		}],
	})
})
