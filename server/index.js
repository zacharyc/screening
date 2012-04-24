/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

/**
 * index.js
 *
 * This file starts the director server. The main server that lives on the host machine. It is a node process and is
 * responsible for managing the agent pool, database, and restful interactions
 */


/**
 * Starts up the server defined in server.js
 */

var PORT = 8081; // Default Port

var path = require("path");
var optimist = require('optimist');
var argv = optimist
    .usage('Usage: $0')
    .describe('debug', 'Run server with debug output enabled')
    .describe('production', 'Run server in production mode')
    .describe('port', 'Override listen port')
    .argv;

if(argv.help) {
    optimist.showHelp();
    process.exit();
}

if(argv.production) {
    process.env.NODE_ENV = "production";
} else {
    process.env.NODE_ENV = "development";
}

if(argv.port) {
    PORT = argv.port;
}

var express = require('express');
var app = express.createServer();
var director = require('./director/director.js');
director.configureServer();
var socketApi = require("./lib/sockets.js");

app.configure(function() {
    app.use("/screening", director.app);
    
    // Socket.io Initialization
    socketApi.init(app, director.agentPool, director.SCREENING_VERSION);
});

app.configure('development', function() {
    var MONTAGE_PATH = path.join(__dirname, "../../node_modules/montage");

    app.use("/node_modules/montage", express.static(MONTAGE_PATH));
    app.use("/node_modules/montage", express.directory(MONTAGE_PATH));
});

app.listen(PORT);
console.log("Environment: Node.js -", process.version, "Platform -", process.platform);
console.log("Screening Server running on port " + PORT + " [" + process.env.NODE_ENV + "]");
console.log("Screening Control Room: http://localhost:" + PORT + "/screening/control-room/index.html");
