# @flitz/body

## 3.0.0

* [BREAKING CHANGE]: `form()` parses input binary as ASCII now

## 2.0.0

* add [YAML](https://www.npmjs.com/package/js-yaml) support
* [BREAKING CHANGE]: when parsing wrong JSON or YAML, 400 is returned by default
* can handle parse errors now
* `options` of parsers can also be `(null)` now

## 1.1.0

* cleanup package

## 1.0.1

* first stable release

## 0.6.2

* [BREAKING CHANGE]: `maxLength` => `max`

## 0.5.1

* plugin requires at least [flitz 0.8.0+](https://github.com/flitz-js/flitz) now
* can define `maxLength` property for parsers now
* add `form()` middleware
* `body` property is of type `any` now

## 0.4.0

* update donation links to [open collective](https://opencollective.com/flitz) and [PayPal](https://paypal.me/MarcelKloubert)

## 0.3.1

* update to [flitz 0.4.1](https://github.com/flitz-js/flitz)

## 0.2.5

* add `string()` parser

## 0.1.1

initial release
