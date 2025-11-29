#!/usr/bin/env node

import mri from 'mri'
import pkg from './package.json' with {type: 'json'}

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v',
	]
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    announce-wifi-location-via-mdns <latitude> <longitude> <altitude> [options]
Options:
    --size                -s  Size of your network, in meters.
                                Default: 20
    --precision           -p  Horizontal precision of the coordinates, in meters.
                                Default: none
    --vertical-precision  -P  Vertical precision of the coordinates, in meters.
                                Default: none
    --json-via-stdin      -j  Read newline-delimited JSON from stdin. Each line may
                                may have the these fields:
                                - latitude
                                - lonitude
                                - altitude
                                - size
                                - hPrecision
                                - vPrecision
                                If a line does not have a field, its previous value
                                is used.
Examples:
    announce-wifi-location-via-mdns 1.23 2.34 --altitude 800 -s 30
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

import initMdns from 'multicast-dns'
import {createInterface as createReadlineInterface} from 'node:readline'
import {encodeLOCAnswer} from './lib/encode-loc-answer.js'

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

let latitude = parseFloat(argv._[0])
if ('number' !== typeof latitude) {
	showError('Missing/invalid latitude argument.')
}
let longitude = parseFloat(argv._[1])
if ('number' !== typeof longitude) {
	showError('Missing/invalid longitude argument.')
}
let altitude = parseFloat(argv._[2])
if ('number' !== typeof altitude) {
	showError('Missing/invalid altitude argument.')
}

let size = argv.size || argv.s
	? parseFloat(argv.size || argv.s)
	: null
if (size !== null && 'number' !== typeof size) {
	showError('Invalid size option.')
}

let hPrecision = argv['horizontal-precision'] || argv.p
	? parseFloat(argv['horizontal-precision'] || argv.p)
	: null
if (hPrecision !== null && 'number' !== typeof hPrecision) {
	showError('Invalid hPrecision option.')
}
let vPrecision = argv['vertical-precision'] || argv.P
	? parseFloat(argv['vertical-precision'] || argv.P)
	: null
if (vPrecision !== null && 'number' !== typeof vPrecision) {
	showError('Invalid vPrecision option.')
}

let recordData
const recomputeRecordData = () => {
	recordData = encodeLOCAnswer({
		latitude, longitude, altitude,
		size,
		hPrecision, vPrecision,
	})
}
recomputeRecordData()

const mdns = initMdns()

mdns.on('query', (q) => {
	const question = q.questions.find(q => q.name === 'local' && q.type === 'LOC' && q.class === 'IN')
	if (!question) return;

	mdns.respond({
		answers: [{
			name: 'local',
			type: 'LOC',
			class: 'IN',
			data: recordData,
		}],
	})
})

if (argv['json-via-stdin'] || argv.j) {
	const lines = createReadlineInterface({
		input: process.stdin,
		crlfDelay: Infinity,
	})
	for await (const line of lines) {
		const _ = JSON.parse(line)
		if ('latitude' in _) latitude = _.latitude
		if ('longitude' in _) longitude = _.longitude
		if ('altitude' in _) altitude = _.altitude
		if ('size' in _) size = _.size
		if ('hPrecision' in _) hPrecision = _.hPrecision
		if ('vPrecision' in _) vPrecision = _.vPrecision
		recomputeRecordData()
	}
}
