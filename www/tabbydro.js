/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/
function formatDisplayNumber(value, width, precision) {
    var padChar = '!';
    var sign = value < 0 ? '-' : padChar;
    var fixed_number = Number(Math.abs(value)).toFixed(precision);
    return sign + fixed_number.padStart(width + 1, padChar);
}
class Axis {
    constructor(prefix) {
        this.prefix = prefix;       // the prefix character sent by remote
        this.mode = 'abs';          // displaying abs(solute) or inc(remental)
        this.units = 'in';          // in(ches) or mm(millimeters)
                                    // rpm, sfm
                                    // (deg)rees or rad(ians)
        this.rawReading = 0.0;     // last raw reading from remote
        this.zeroSetting = 0.0;    // current zero set-point in raw values
        this.currentValue = 0.0;   // current offset from zero

        this.indicators = {};       // the display indicators, by tabby-dro-indicator
    }

    setRawValue(rawReading) {
        this.rawReading = rawReading;
        this.currentValue = this.rawReading - this.zeroSetting;

        if ('value-current' in this.indicators) {
            var indicator = this.indicators['value-current'];

            var displayValue = '';
            if (this.units == 'rpm' || this.units == 'sfm') {
                displayValue = formatDisplayNumber(this.currentValue, 5, 0);
            } else {
                displayValue = formatDisplayNumber(this.currentValue, 6, 4);
            }

            if (displayValue) {
                indicator.innerHTML = '';
                indicator.appendChild(document.createTextNode(displayValue));
            }
        }
    }

    setZero() {
        console.log(this.prefix + ": set zero at " + this.rawReading);
        this.zeroSetting = this.rawReading;
        this.currentRalue = this.zeroSetting - this.rawReading;
        // TODO: update interface current_value
    }

    addIndicator(indicatorName, indicator) {
        var name = indicatorName.toLowerCase();
        this.indicators[name] = indicator

        // set current state based on "on" class in HTML
        if (indicator.classList.contains('on')) {
            console.log(name + " is ON")
            var [prefix, key] = name.split('-')
            if (prefix === 'units') {
                this.units = key;
            }
            if (prefix === 'mode') {
                this.mode = key;
            }
        }
    }

    turnOnIndicator(indicatorName) {
        if (indicatorName in this.indicators) {
            this.indicators[indicatorName].classList.remove('off');
            this.indicators[indicatorName].classList.add('on');
        }
    }

    turnOffIndicator(indicatorName) {
        if (indicatorName in this.indicators) {
            this.indicators[indicatorName].classList.remove('on');
            this.indicators[indicatorName].classList.add('off');
        }
    }

    toggleMode() {
        console.log(this.prefix + ": toggle mode " + this.mode);
        this.turnOffIndicator('mode-' + this.mode);
        this.mode = (this.mode === 'abs') ? 'inc' : 'abs';
        this.turnOnIndicator('mode-' + this.mode);
    }

    toggleUnits() {
        console.log(this.prefix + ": toggle units " + this.units);
        this.turnOffIndicator('units-' + this.units);
        if (this.units === 'in' || this.units === 'mm') {
            this.mode = (this.mode === 'inch') ? 'mm' : 'in';
        }

        if (this.units === 'rpm' || this.units === 'sfm') {
            this.mode = (this.mode === 'rpm') ? 'sfm' : 'rpm';
            // TODO: update interface units
        }

        if (this.units === 'deg' || this.units === 'rad') {
            this.mode = (this.mode === 'deg') ? 'rad' : 'deg';
            // TODO: update interface units
        }
        this.turnOnIndicator('units-' + this.units);
    }
}

class TabbyDROApplication {
    constructor() {
        this.connected = false;
        //this.macAddress = "20:17:12:05:01:59";
        //this.macAddress = "9C2CED71-E4F4-59D6-9D61-35C47C4C8437";
        this.macAddress = "ABB86C67-ABDD-1E31-BA97-B00B52D6CFBB";

        this.axes = {}; // hash of axes, indexed by prefix

        this.points = [
            [0.0, 0.0, 0.0, 0.0],
            [1.0, 1.0, 0.0, 0.0],
            [2.0, 2.0, 2.0, 0.0]
        ];

        this.tools = {
            '1/8" mill': { 'name': '1/8" 4-flute mill', 'diameter': 0.125, 'units': 'in' },
            '1/4" mill': { 'name': '1/4" 4-flute mill', 'diameter': 0.25, 'units': 'in' },
            '1/2" mill': { 'name': '1/2" 4-flute mill', 'diameter': 0.5, 'units': 'in' },
        }
    }

    initialize() {
        console.log("TabbyDRO::initlaize()");
        document.addEventListener('deviceready', this.onDeviceReady, false);

        //var connectButton = document.getElementById('connectButton');
        connectButton.addEventListener('click', this.manageConnection);
        connectButton.classList.add('disabled');

        var displayAxes = document.querySelectorAll('[tabby-dro-axis]');
        displayAxes.forEach(this.setupAxis, this);

        var controlButtons = document.querySelectorAll('[tabby-dro-control]');
        controlButtons.forEach(this.setupControlButton, this);
    }

    setupControlButton(button) {
        //var controlFunctionName = axisIndicator.getAttribute('tabby-dro-control');
    }

    setupAxisIndicator(axis, axisIndicator) {
        var indicatorName = axisIndicator.getAttribute('tabby-dro-indicator');        
        axis.addIndicator(indicatorName, axisIndicator);

        //     case 'axisValue':
        //         axis.indicatorValue = axisIndicator;
        //         break;
        //     case 'axisProbe':
        //         break;
    }

    setupAxisButton(axis, axisButton) {
        console.log("setup axis button: " + axis.prefix);
        var buttonType = axisButton.getAttribute('tabby-dro-button');
        switch (buttonType) {
            case 'zeroButton':
                axisButton.addEventListener('click', function () {axis.setZero()});
                //axisButton.addEventListener('ontouchend', function () { axis.setZero() }, false);
                break;

            case 'absIncButton':
                axisButton.addEventListener('click', function () { 
                    axis.toggleMode(); 
                    this.classList.remove('active'); 
                });
                //axisButton.addEventListener('ontouchend', function () { axis.toggleMode() }, false);
                break;

            case 'unitsButton':
                axisButton.addEventListener('click', function () { axis.toggleUnits() });
                //axisButton.addEventListener('ontouchend', function () { axis.toggleUnits() }, false);
                break;

            default:
                console.log('Unknow button:' + buttonType);
                break;
        }
    }

    setupAxis(axisDiv) {
        console.log(axisDiv);
        var self = this;
        var axisPrefix = axisDiv.getAttribute('tabby-dro-axis');
        var axis = new Axis(axisPrefix);

        var axisButtons = axisDiv.querySelectorAll('[tabby-dro-button]');
        axisButtons.forEach(function(axisButton) {
           self.setupAxisButton(axis, axisButton);
       });

        var axisIndicators = axisDiv.querySelectorAll('[tabby-dro-indicator]');
        axisIndicators.forEach(function(axisIndicator) {
            self.setupAxisIndicator(axis, axisIndicator);
        });

        this.axes[axisPrefix] = axis;
    }

    zeroAllAxes() {

    }

    setAllUnits() {

    }

    alert(event) {
        alert(event);
    }

    /* this runs when the device is ready for user interaction: */
    onDeviceReady() {
        console.log('TabbyDRO::onDeviceReady');
        if (typeof bluetoothSerial === 'undefined') {
            app.clear();
            app.notify("Bluetooth is not available.")
            return;
        }
        console.log('TabbyDRO::onDeviceReady');

        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var bluetoothIsEnabled = function () {
            // Enable connect button when Bluetooth is enabled
            connectButton.classList.remove('disabled');

            // list the available BT ports:
            bluetoothSerial.list(
                function (results) {
                    app.notify(JSON.stringify(results));
                },
                function (error) {
                    app.notify(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var bluetoothIsDisabled = function () {
            app.clear();
            app.notify("Bluetooth is not enabled.")
        }

        // check if Bluetooth is on:
        bluetoothSerial.isEnabled(bluetoothIsEnabled, bluetoothIsDisabled);
    }

    /* Connects if not connected, and disconnects if connected */
    manageConnection() {
        console.log('TabbyDRO::manageConnection');
        if (typeof bluetoothSerial === 'undefined') {
            app.clear();
            app.notify("Bluetooth is not available.")
            return;
        }

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            console.log('TabbyDRO::connect');
            // if not connected, do this:
            app.notify("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            console.log('TabbyDRO::disconnect');
            app.clear();
            app.notify("Attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        connectButton.innerHTML = "Connecting...";
        connectButton.classList.remove('btn-success');
        connectButton.classList.add('disabled');
        connectButton.classList.add('btn-outline-success');
        bluetoothSerial.isConnected(disconnect, connect);
    }

    /* subscribes to a Bluetooth serial listener for newline and changes the button */
    openPort() {
        console.log('TabbyDRO::openPort');
        // if you get a good Bluetooth serial connection:
        app.clear();
        app.notify("Connected to: " + app.macAddress);

        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        connectButton.classList.remove('disabled');

        // set up a listener to listen for value terminators
        bluetoothSerial.subscribe(';', function (data) {
            app.update(data);
        });
    }

    /*
        unsubscribes from any Bluetooth serial listener and changes the button:
    */
    closePort() {
        console.log('TabbyDRO::closePort');
        // if you get a good Bluetooth serial connection:
        app.notify("Disconnected from: " + app.macAddress);
        // change the button's name:

        connectButton.innerHTML = "Connect";
        connectButton.classList.remove('disabled');
        connectButton.classList.remove('btn-outline-success');
        connectButton.classList.add('btn-success');

        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
            function (data) {
                app.notify(data);
            },
            app.showError
        );
    }

    /* Show error */
    showError(error) {
        console.log('TabbyDRO::showError ' + error);
        app.notify(error);
    }

    /* Show notifications */
    notify(message) { 
        console.log('TabbyDRO::notify ' + message);
        var message_div = document.getElementById('messages'),
            label = document.createTextNode(message),
            lineBreak = document.createElement("br");     // a line break

        message_div.appendChild(lineBreak);          // add a line break
        message_div.appendChild(label);
    }

    /* Update data from Remote */
    update(rawData) {
        var axisPrefix = rawData[0].toLowerCase();
        var rawReading = rawData.substr(1, rawData.length - 2);
        //console.log('TabbyDRO::update ' + rawData + " => " + rawReading);
        if (!Number.isNaN(Number.parseFloat(rawReading))) {
            if (axisPrefix in app.axes) {
                var axis = app.axes[axisPrefix];
                axis.setRawValue(Number.parseFloat(rawReading));
            }
        }
    }

    /* clears the message div: */
    clear() {
        console.log('TabbyDRO::clear');
        var message_div = document.getElementById("messages");
        message_div.innerHTML = "";
    }
} 
