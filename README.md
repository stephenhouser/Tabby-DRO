# TabbyDRO

Tablet-based Digital Readout (DRO) for precision tools (e.g. lathes and mills).

This application is only the display part of a complete system. It requires a data provider like [Andriod-DRO](https://github.com/stephenhouser/Arduino-DRO) that reads values from "cheap" machine scales attached to precision equipment (lathes, mills, CNCs, etc.) and reports to this application via Bluetooth (classic or LE).

The design based on [TouchDRO](http://www.yuriystoys.com/p/android-dro.html)'s layout. It is written to be "wire-compatible", so that controllers used for his system will work with this one.

## Why write another dispaly when TouchDRO already exists?

* TouchDRO is Android only, I'm mostly and iOS guy.
* I like to write code and wanted to do something this past weekend.

## What's in play here?

* The entire app is written in JavaScript/HTML5/CSS4
* Apache Cordova is used to package it as a native app on Android and iOS
* [BluetoothSerial](https://github.com/don/BluetoothSerial) plugin from [Don Coleman](https://github.com/don) for working with Bluetooth communications.
* [Bootstrap 4](https://getbootstrap.com) for nice buttons and navbars.
* [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
* [CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox)

## The future

* My architecture is a mess. Actaully it's non-existant at this point. I've been just trying to make it work.
* Perhaps [React Native](https://facebook.github.io/react-native/), [Redux](https://facebook.github.io/react-native/), and [Flux](https://facebook.github.io/flux/) are in my future. I've written a few small apps with it and it's data model sure would work with this app. (Will it work on old devices? e.g. iOS9 on an iPad 3rd generation?).
	* There's a [BluetoothSerial for React Native](https://github.com/rusel1989/react-native-bluetooth-serial)
	* There's a lot more tooling to get set up and debugging is wierd. It all feels shaky.

## Setup

```
	cordova create TabbyDRO
	cd TabbyDRO
	cordova platform add ios
	cordova platform add android
	cordova platform add browser

	# Add bluetooth serial (https://github.com/don/BluetoothSerial)
	cordova plugin add cordova-plugin-bluetooth-serial
	cordova plugin add cordova-plugin-splashscreen
	cordova plugin add cordova-plugin-statusbar
	cordova plugin add https://github.com/chemerisuk/cordova-plugin-fastclick.git
	cordova plugin add cordova-plugin-vibrate
```

## Build

```
	cordova build
	cordova run ios
	cordova run android
	...
```