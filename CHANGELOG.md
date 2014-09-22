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