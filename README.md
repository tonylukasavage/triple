# triple [![Build Status](https://travis-ci.org/tonylukasavage/triple.svg?branch=master)](https://travis-ci.org/tonylukasavage/ti-repl)

[REPL](http://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) for Titanium.

## Support

Currently only tested on Mac OSX against iOS simulator with Titanium SDK 3.2.3+. All other platforms supported by Appcelerator are planned.

## Install [![NPM version](https://badge.fury.io/js/triple.svg)](http://badge.fury.io/js/triple)

```bash
$ npm install -g triple
```

## Testing [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

```bash
# run jshint and unit tests
$ grunt

# create coverage report in ./coverage/index.html
$ grunt coverage
```

## Known Issues

### `this.Kroll`

Trying to inspect `this.Kroll` on iOS will cause a fatal error. This is due to the fact that `this.Kroll` is not a genuine Javascript object. It will be skipped if your inspect `this`, and it will crash the app if you try to inspect it directly.
