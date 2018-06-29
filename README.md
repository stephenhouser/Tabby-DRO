# TabbyDRO

Tablet DRO that connects over Bluetooth to Andriod DRO or similar to display location of cheap machine scales for machine equipment (lathe, mill, cnc, etc.)


## Setup

```
	cordova create TabbyDRO
	cd TabbyDRO
	cordova platform add ios
	cordova platform add android
	cordova platform add browser

	# Add bluetooth serial (https://github.com/don/BluetoothSerial)
	cordova plugin add cordova-plugin-bluetooth-serial