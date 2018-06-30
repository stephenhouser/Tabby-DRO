/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/
class Axis {
    var mode = 'abs';
    var 
    constructor() {

    }
};

var axis_defaults = {
    'mode': 'abs',  // abs, inc
    'units': 'in',   // (in, mm), (rpm, sfm), (deg, rad)
    'raw': 0.0,     // current reading (raw value)
    'zero': 0.0,    // raw value that is zero position
    'value': 0.0,   // current reading (relative to zero)
};

var app = {
    chars: "",
    macAddress: "20:17:12:05:01:59",

    auto_connect: "20:17:12:05:01:59",     // or null if no auto-connect

    touch_probe: false,

    axis = {
        'x': Object.assign({}, axis_defaults),
        'y': Object.assign({}, axis_defaults),
        'z': Object.assign({}, axis_defaults),
        'w': Object.assign({}, axis_defaults),
        't': Object.assign({}, axis_defaults),
    },

    points = [
        [0.0, 0.0, 0.0, 0.0],
        [1.0, 1.0, 0.0, 0.0],
        [2.0, 2.0, 2.0, 0.0]
    ],

    tools = {
        '1/8" mill': { 'name': '1/8" 4-flute mill', 'diameter': 0.125, 'units': 'in' },
        '1/4" mill' : { 'name': '1/4" 4-flute mill', 'diameter': 0.25, 'units': 'in'},
        '1/2" mill': { 'name': '1/2" 4-flute mill', 'diameter': 0.5, 'units': 'in' },
    },

    /* Application constructor */
    initialize: function () {
        this.bindEvents();
        console.log("Starting Tabby DRO");
    },

    /* bind any events that are required on startup to listeners */
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
    },

    /* this runs when the device is ready for user interaction: */
    onDeviceReady: function () {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function () {
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
        var notEnabled = function () {
            app.clear();
            app.notify("Bluetooth is not enabled.")
        }

        // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
    /* Connects if not connected, and disconnects if connected */
    manageConnection: function () {
        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
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
            app.clear();
            app.notify("Attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
    /* subscribes to a Bluetooth serial listener for newline and changes the button */
    openPort: function () {
        // if you get a good Bluetooth serial connection:
        app.clear();
        app.notify("Connected to: " + app.macAddress);

        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        
        // set up a listener to listen for value terminators
        bluetoothSerial.subscribe(';', function (data) {
            app.update(data);
        });
    },

    /*
        unsubscribes from any Bluetooth serial listener and changes the button:
    */
    closePort: function () {
        // if you get a good Bluetooth serial connection:
        app.notify("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
            function (data) {
                app.notify(data);
            },
            app.showError
        );
    },

    /* Show error */
    showError: function (error) {
        app.notify(error);
    },

    /* Show notifications */
    notify: function(message) { 
        var message_div = document.getElementById('messages'),
            label = document.createTextNode(message),
            lineBreak = document.createElement("br");     // a line break

        message_div.appendChild(lineBreak);          // add a line break
        message_div.appendChild(label);
    },

    /* Update data from Remote */
    update: function (raw_data) {
        console.log(raw_data);

        var sensor_div_id = raw_data[0].toLowerCase() + '-value';
        var sensor_div = document.getElementById(sensor_div_id);
        if (sensor_div) {
            var message_value = message.substr(1, raw_data.length - 2);
            var display_value = null;

            if (sensor_div_id == 't-value') {
                display_value = this.formatAxis(message_value, 5, 0);
            } else if (sensor_div_id == 'p-value') {
                display_value = message_value == 0 ? 'Off' : 'On';
            } else {
                display_value = this.formatAxis(message_value, 6, 4);
            }

            if (display_value) {
                sensor_div.innerHTML = '';
                sensor_div.appendChild(document.createTextNode(display_value));
            }
        }
    },
    /* clears the message div: */
    clear: function () {
        var message_div = document.getElementById("messages");
        message_div.innerHTML = "";
    },

    formatAxis: function(value, width, precision) {
        var padChar = '!';
        var sign = value < 0 ? '-' : padChar;
        var fixed_number = Number(Math.abs(value)).toFixed(precision);
        return sign + fixed_number.padStart(width+1, padChar);
    }
};      // end of app
