/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component,
    Screening = require('/director/js/screening.js');

exports.Main = Montage.create(Component, {
    socket: {
        value: null
    },

    prepareForDraw: {
        value: function() {
            var self = this;
            // Add Event Listeners
            window.addEventListener("message", self._receiveMessage, false);
            window.addEventListener("message", function(event) {console.log('boo');});

            document.addEventListener("serverMessage", this, false);
        }
    },

    templateDidLoad: {
        value: function() {
            this.init();
        }
    },

    _documentAddress: {
        value: "http://" + document.domain + ":" + document.location.port
    },

    init: {
        enumerable: false,
        value: function() {
            var self = this;

            this.socket = io.connect(self._documentAddress, { resource: "socket.io" });

            this._initDirector();

            this.socket.on("reconnect", function() {
                self._initDriver();
            });
        }
    },

    _initDirector: {
        value: function() {
            var self = this;
            // this._getFileFromServer("connect.js", false);

            this.socket.emit("initDirector", function() {
                // TODOz: code needs to be here
            });
            window.connectDirector();

            console.log("Director, serverIp is:", serverIp);
            console.log("Director, sessionId is:", sessionId);
            console.log("Director, script name is: TODOz");

            window.a = 'foo';
            console.log('outside eval', Screening, a);
            // Get the script
            this._getFileFromServer("connect.js", false, function(script) {
                console.log('right before eval', Screening, a);
                eval(script);
            });
        }
    },

    handlePingAction: {
        value: function() {
            console.log('foo');
            this.socket.emit("serverPing");
        }
    },

    handleServerMessage: {
        value: function(event) {
            console.log('got a server message', event, event.screeningType, event.screeningContent);
            var msg = {};
            msg.type = event.screeningType;
            msg.content = event.screeningContent;
            this.socket.emit("screeningReport", JSON.stringify(msg));
        }
    },

    _getFileFromServer: {
        value: function(filename, root, callback) {
            console.log('retreiving server file: ', filename);
            var req = new XMLHttpRequest();
            // serverIp has been previously defined
            if(root) {
                req.open("GET", this._documentAddress + filename, true);
            } else {
                req.open("GET", this._documentAddress + "/director/js/" + filename, true);
            }

            req.setRequestHeader("Content-Type", "application/javascript");
            req.onreadystatechange = function(aEvt) {
                if(req.readyState == 4 && req.status >= 200) {
                    if(callback) {
                        callback(req.response);
                    } else {
                        console.log('no callback');
                    }
                    req.onreadystatechange = null;
                }
            };
            req.send();
        }
    },

    _receiveMessage: {
        value: function(event) {
            console.log('got a message', event);
        }
    }
});
