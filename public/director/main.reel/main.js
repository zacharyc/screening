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

    templateDidLoad: {
        value: function() {
            this.init();
        }
    },

    init: {
        enumerable: false,
        value: function() {
            var self = this;

            this.socket = io.connect("http://" + document.domain + ":" + document.location.port, { resource: "socket.io" });

            this._initDirector();

            this.socket.on("reconnect", function() {
                self._initDriver();
            });
        }
    },

    _initDirector: {
        value: function() {
            var self = this;
            this.socket.emit("initDirector", function() {
                // TODOz: code needs to be here

            });
        }
    },

    handlePingAction: {
        value: function() {
            console.log('foo');
            this.socket.emit("serverPing");
        }
    }
});
