### 2014.11.10, v0.3.0

> Full listing of [0.3.0 resolved issues](https://github.com/tonylukasavage/triple/issues?q=milestone%3A0.3.0+is%3Aclosed)

* Android emulator support ([#10](https://github.com/tonylukasavage/triple/issues/10))
* Added delay for '`.load` ([#24](https://github.com/tonylukasavage/triple/issues/24))
* Automcatically `.load` from folder via `app.js` or `index.js` file ([#51](https://github.com/tonylukasavage/triple/pull/52))
* triple app now housed in HOME folder ([#62](https://github.com/tonylukasavage/triple/issues/62))
* Specify platform at comand line ([#63](https://github.com/tonylukasavage/triple/issues/63))
* Clean the triple app ([#64](https://github.com/tonylukasavage/triple/issues/64))

### 2014.10.19, v0.2.3

* Fix crash when copy/pasting multiple lines into REPL ([#57](https://github.com/tonylukasavage/triple/issues/57))
* Fix automcomplete failure crash ([#59](https://github.com/tonylukasavage/triple/issues/59))
* Load single JS files via `triple ./path/to/file.js` or `> .load ./path/to/file.js`

### 2014.10.17, v0.2.2

* No longer default to iOS 7.1
* Add .help triple command
* Better documentation for triple commands

### 2014.09.22, v0.2.1

* Configurable iOS version with `-I, --ios-version`
* Better error messaging
* Fixed bug where build error doesn't abort triple

### 2014.08.02, v0.2.0

* Support triple dot commands
	* `.add` arbitrary file(s) to app ([#41](https://github.com/tonylukasavage/triple/issues/41))
	* `.break` a multi-line statement ([#16](https://github.com/tonylukasavage/triple/issues/16))
	* `.clear` the current execution context ([#19](https://github.com/tonylukasavage/triple/issues/19))
	* `.exit` repl ([#21](https://github.com/tonylukasavage/triple/issues/21))
	* `.load` Javascript a file into the repl ([#23](https://github.com/tonylukasavage/triple/issues/23))
	* `.save` the history of the current repl to a file ([#20](https://github.com/tonylukasavage/triple/issues/20))
* Tab completion for Titanium namespace ([#8](https://github.com/tonylukasavage/triple/issues/8))
* `require()` commonjs files from filesystem at runtime ([#42](https://github.com/tonylukasavage/triple/issues/42))
* Add native modules to app at creation time ([#39](https://github.com/tonylukasavage/triple/pull/39))
* iOS simulator won't steal focus from terminal, requires TiSDK 3.3.1+ ([#25](https://github.com/tonylukasavage/triple/issues/25))

### 2014.07.23, v0.1.1

* Remove unused platforms from project creation ([#22](https://github.com/tonylukasavage/triple/issues/22))

### 2014.07.22, v0.1.0

* Initial release