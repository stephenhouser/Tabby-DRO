/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/
var app = {
    macAddress: "20:17:12:05:01:59",  // get your mac address from bluetoothSerial.list
    chars: "",

    /* Application constructor */
    initialize: function () {
        this.bindEvents();
        console.log("Starting SimpleSerial app");
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
                    app.display(JSON.stringify(results));
                },
                function (error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function () {
            app.display("Bluetooth is not enabled.")
        }

        // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
    /*
        Connects if not connected, and disconnects if connected:
    */
    manageConnection: function () {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
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
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
    /*
        subscribes to a Bluetooth serial listener for newline
        and changes the button:
    */
    openPort: function () {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe(';', function (data) {
            app.clear();
            app.display(data);
        });
    },

    /*
        unsubscribes from any Bluetooth serial listener and changes the button:
    */
    closePort: function () {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
            function (data) {
                app.display(data);
            },
            app.showError
        );
    },
    /*
        appends @error to the message div:
    */
    showError: function (error) {
        app.display(error);
    },

    /*
        appends @message to the message div:
    */
    display: function (message) {
        console.log(message);

        var sensor_div_id = message[0].toLowerCase() + '-value';
        var sensor_div = document.getElementById(sensor_div_id);
        if (!sensor_div) {
            var message_div = document.getElementById('messages'),
                label = document.createTextNode(message),
                lineBreak = document.createElement("br");     // a line break

            message_div.appendChild(lineBreak);          // add a line break
            message_div.appendChild(label);
        } else {
            var message_value = message.substr(1, message.length - 2);
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
    /*
        clears the message div:
    */
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
