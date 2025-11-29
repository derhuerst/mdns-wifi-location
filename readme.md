# mdns-wifi-location

**Announce a WiFi's geolocation via [mDNS](https://en.wikipedia.org/wiki/Multicast_DNS).**

[![npm version](https://img.shields.io/npm/v/mdns-wifi-location.svg)](https://www.npmjs.com/package/mdns-wifi-location)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/mdns-wifi-location.svg)
![minimum Node.js version](https://img.shields.io/node/v/mdns-wifi-location.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installation

```shell
npm install -g mdns-wifi-location
```


## Usage

```
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
```


## Related

- [`LOC` record – Wikipedia](https://en.wikipedia.org/wiki/LOC_record)
- [RFC 1876: A Means for Expressing Location Information in the Domain Name System](https://tools.ietf.org/rfc/rfc1876) (defines `LOC` DNS entries)
- [*The weird and wonderful world of DNS LOC records* – The Cloudflare Blog](https://blog.cloudflare.com/the-weird-and-wonderful-world-of-dns-loc-records/) (a story about Cloudflare adding `LOC` support)


## Contributing

If you have a question or need support using `mdns-wifi-location`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, use [the issues page](https://github.com/derhuerst/mdns-wifi-location/issues).
