/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var Montage = require("montage/core/core").Montage,
    Component = require("montage/ui/component").Component;

exports.Main = Montage.create(Component, {
    socket: {
        value: null
    },

    prepareForDraw: {
        value: function() {
            var self = this;
            // Add Event Listeners
            window.addEventListener("message", self._receiveMessage, false);
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
            this._getFileFromServer("connect.js", false);

            this.socket.emit("initDirector", function() {
                // TODOz: code needs to be here
            });
            window.connectDirector();
        }
    },

    handlePingAction: {
        value: function() {
            console.log('foo');
            this.socket.emit("serverPing");
        }
    },

    _getFileFromServer: {
        value: function(filename, root, callback) {
            var req = new XMLHttpRequest();
            // serverIp has been previously defined
            if(root) {
                req.open("GET", this._documentAddress + filename, true);
            } else {
                req.open("GET", this._documentAddress + "/director/js/" + filename, true);
            }

            req.setRequestHeader("Content-Type", "application/javascript");
            console.log(req);
            req.onreadystatechange = function(aEvt) {
                if(req.readyState == 4 && req.status >= 300) {
                    console.log(req.response);
                    if(callback) {
                        callback(req.response);
                    }
                    //var resp = JSON.parse(req.response);
                    //Alert.show(resp.error);
                } else {
                    console.log(aEvt.value, req.status, req.readyState);
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
