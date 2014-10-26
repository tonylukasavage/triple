# triple

[REPL](http://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) for Titanium. Inspired heavily by node.js's own [repl](http://nodejs.org/api/repl.html).

![demo](http://cl.ly/image/0a0z1F2N342H/triple3.gif)

## Features

* Full access to [Titanium API](http://docs.appcelerator.com/titanium/latest/#!/api), including tab completion for Titanium namespaces
* Command history (&uarr;,&darr;)
* Save and load REPL sessions
* Add files and native Titanium modules to REPL
* `require()` commonjs modules at runtime straight from the filesystem
* Multi-line statements
* Color-coded return values, by type
* Much more coming (see [enhancements](https://github.com/tonylukasavage/triple/issues?labels=enhancement&milestone=&page=1&state=open))

## Install [![NPM version](https://badge.fury.io/js/triple.svg)](http://badge.fury.io/js/triple)

```bash
$ npm install -g triple
```

## Usage

```
≫ triple -h

  Usage: triple [options] [file [delay]]

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -m, --module <ids>              Add native module(s) to REPL
    -I, --ios-version <iosVersion>  select the ios version to use
    -v, --verbose                   Enable verbose output

  Examples:

    basic REPL
    $ triple
    [creating app]
    [loading app]
    > alert('hello, world!');

    load by file or url, with optional delay between lines
    $ triple /path/to/file.js
    $ triple http://bit.ly/1zc7Nvo
    $ triple /path/to/file.js 2000

    add native module(s) to REPL by id
    $ triple --module ti.paint
    $ triple --module some.module,another.module
```

## triple commands

triple includes a few commands to control its operations. These must be preceded by the dot (.) to be recognized as commands.

### .add [file ...]

Add file(s) to REPL at runtime.

```bash
$ triple
> .add /path/to/image.png
> var image = Ti.UI.createImageView({image:'image.png'});
```

### .break

Abort a multi-line statement.

```bash
$ triple
> for (var i = 0; i < 100; i++) {
... // i want to stop this statement
... .break
>
```

### .clear

Create a new execution context for the current REPL.

```bash
$ triple
> var foo = 123;
undefined
> foo
123
> .clear
> foo
ReferenceError: Can't find variable: foo
>
```

### .exit

Exits the REPL.

```bash
$ triple
> .exit
$
```

### .help

Shows command help in the REPL.

### .load <file> [delay]

Load a local or remote Javascript file line by line in to the REPL. A `delay` between each line of code's execution can be specified in milliseconds. If `<file>` is a directory, triple will attempt to load `app.js` then `index.js` from the directory.

```bash
$ triple
> .load ./app.js
> .load http://bit.ly/1zc7Nvo
> .load http://bit.ly/1zc7Nvo 2000
```

### .save <file>

Saves the current REPL session to a file. This file can be loaded in triple later with `.load`.

```bash
$ triple
> Ti.UI.createWindow({backgroundColor:'#a00'}).open();
undefined
> .save ./test.js
```

## Support

The following is the only configuration for which this has been tested so far:

* Mac OSX 10.9.4+
* iOS 7.1+ simulator
* Titanium SDK 3.2.3+

Support for all of Appcelerator's supported platforms is planned. Windows OS support is planned as well.

### Android support

Basic Android support is available (`--plaform android`). Currently all of triple's features are being implemented and/or tested against Android. Check issue[#10](https://github.com/tonylukasavage/triple/issues/10) for details.

## Known Issues

Aside from the [issues](https://github.com/tonylukasavage/triple/issues) in this repo, here's some other known issues with Titanium that you might encounter when using triple.

* \[[TIMOB-17449](https://jira.appcelerator.org/browse/TIMOB-17449)\] - iOS: this.Kroll cannot be inspected, and throws errors when you try
* \[[~~TIMOB-17448~~](https://jira.appcelerator.org/browse/TIMOB-17448)\] - iOS: error when commonjs module exports certain types (anything other than function, object, or string). _**Fixed in Titanium 3.4.0**_.
