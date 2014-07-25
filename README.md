# triple

[REPL](http://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) for Titanium. Inspired heavily by node.js's own [repl](http://nodejs.org/api/repl.html).

![demo](http://cl.ly/image/0a0z1F2N342H/triple3.gif)

## Features

* Full access to [Titanium API](http://docs.appcelerator.com/titanium/latest/#!/api)
* Command history (&uarr;,&darr;)
* Multi-line statements
* Color-coded return values, by type
* Much more coming (see [enhancements](https://github.com/tonylukasavage/triple/issues?labels=enhancement&milestone=&page=1&state=open))

## Install [![NPM version](https://badge.fury.io/js/triple.svg)](http://badge.fury.io/js/triple)

```bash
$ npm install -g triple
```

## Usage

```bash
$ triple
[creating app]
[loading app]
> alert('hello, world!');
```

You can also load in Javascript files from the command line, either locally or from a URL:

```bash
$ triple ./app.js
```

```bash
$ triple http://bit.ly/1zc7Nvo
```
You can also load with a delay which will load each command line-by-line in the console so you can see the return value of each line of code.

```bash
$ triple http://bit.ly/1zc7Nvo 2000
```
### Triple commands

Triple includes a few commands to control its operations. These must be preceded by the dot (.) to be recognized as commands.

 * `.exit` -- exits the REPL
 * `.load` -- load a JavaScript file from local path or URL
 * `.save filespec` -- saves your history
 * `.clear` -- clear memory and reset the simulator/emulator

#### .load 

Load a series of Titanium JavaScript statements from a local file or URL:

```
.load filespec [delay]
```

where `filespec` is a local path or URL and `delay` is an optional delay (milliseconds) to add between the execution of each command.

Example:

```bash
$ triple
[creating app]
[loading app]
> .load myDemo.js 1000
```

#### .save

Save your history to a file:

```
.save filespec
```
where `filespec` is a path and file name. If the path is omitted, the current directory is assumed. For example:

```bash
$ triple
[creating app]
[loading app]
> var w = Ti.UI.createWindow();
undefined
> w.open();
undefined
> w.backgroundColor = 'red';
'red'
> .save ./myTripleLog.js
```

## Support

The following is the only configuration for which this has been tested so far:

* Mac OSX 10.9.4
* iOS 7.1 + simulator
* Titanium SDK 3.2.3+

Support for all of Appcelerator's supported platforms is planned. Windows OS support is planned as well.

## Known Issues

### `this.Kroll`

Trying to inspect `this.Kroll` on iOS will cause a fatal error. This is due to the fact that `this.Kroll` is not a genuine Javascript object. It will be skipped if your inspect `this`, and it will crash the app if you try to inspect it directly.
