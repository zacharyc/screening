/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

/**
 * index.js
 *
 * This file is a redirect. It simply starts up the screening server
 */

var screening = require("./screening/screening.js");

// var PORT = 8081; // Default Port

// var settings = require("./settings.js"),
//     express = require("express"),
//     fs = require("fs"),
//     path = require("path"),
//     argv = require("optimist").argv,
//     TestcaseRunner = require("./lib/testcase-runner.js").TestcaseRunner,
//     agentPool = require("./lib/agent-pool.js").agentPool,
//     agentTypes = require("./lib/agent-pool.js").agentTypes,
//     simpleRequest = require("request"),
//     MongoDbProvider = require("./lib/database/mongo-provider.js"),
//     TestcaseResultsProvider = require("./lib/database/testcase-results-provider.js"),
//     ScriptsProvider = require("./lib/database/scripts-provider.js");

// var path = require("path");
// var optimist = require('optimist');
// var argv = optimist
//     .usage('Usage: $0')
//     .describe('port', 'Override listen port')
//     .argv;
// // TODO: include server options for starting with a different db provider (host and port)

// if(argv.help) {
//     optimist.showHelp();
//     process.exit();
// }

// if(argv.port) {
//     PORT = argv.port;
// }

// var express = require('express');

// // Set up the Server : TODOz: clean up
// var mongoDbProvider = new MongoDbProvider(settings.mongoDB.host, settings.mongoDB.port);
// mongoDbProvider.ensureIndexes();
// var testcaseResultsProvider = new TestcaseResultsProvider(mongoDbProvider);
// var scriptsProvider = new ScriptsProvider(mongoDbProvider);

// var testcaseRunner = new TestcaseRunner(agentPool, argv.debug, testcaseResultsProvider);
// // instantiate the singleton of our testrunner
// // runner will output more details by passing --debug

// var routingConfig = require("./rest-api/routing-config.js");
// var agentsApi = require("./rest-api/agents.js")(agentPool, testcaseRunner, scriptsProvider);
// var scriptsApi = require("./rest-api/scripts.js")(scriptsProvider);
// var testResultsApi = require("./rest-api/test-results.js")(testcaseResultsProvider);

// const SCREENING_PATH = path.join(__dirname, "../public");

// // Manually adding a new text/plain parser that will add the body verbatim to req.body
// var bodyParser = express.bodyParser;
// bodyParser.parse["application/javascript"] = bodyParser.parse["text/plain"] = function(req, options, callback) {
//     var buf = '';
//     req.setEncoding('utf8');
//     req.on('data', function(chunk) { buf += chunk; });
//     req.on('end', function(){
//         req.body = buf;
//         callback();
//     });
// };

// app.configure(function() {
//     /* Express Middleware: ORDER MATTERS! */
//     app.use(bodyParser());
//     app.use(express.cookieParser());
//     app.use(express.session({ secret: "hellomoto" }));
//     app.use(app.router);

//     app.use("/", express.directory(SCREENING_PATH));
//     app.use("/", express.static(SCREENING_PATH));
// });

// // REST-API wiring
// routingConfig.apiKeyAuth(app);
// app.use(routingConfig.apiRoot + "/agents", agentsApi);
// app.use(routingConfig.apiRoot + "/scripts", scriptsApi);
// app.use(routingConfig.apiRoot + "/test_results", testResultsApi);
// routingConfig.init(app);

// // Check to see if a local Webdriver agent is available on the default port
// // when the server starts up. If we get a response, add it as an agent automatically.
// var url = "http://localhost:9515"
// simpleRequest(url + "/status", function (error, response, body) {
//     if (error || response.statusCode != 200) {
//         // Fail silently, this isn't really a problem.
//     } else {
//         agentPool.addAgent({browserName: "chrome"}, {
//             url: url,
//             type: agentTypes.WEBDRIVER
//         });
//         console.log("Found a webdriver instance running at " + url + ". Added it as an Agent by default.");
//     }
// });
// //var app = express.createServer();
// var screening = require('./screening/screening.js');
// screening.configureServer();
// var socketApi = require("./lib/sockets.js");

// app.configure(function() {
//     app.use("/screening", screening.app);
    
//     // Socket.io Initialization
//     socketApi.init(app, screening.agentPool, screening.SCREENING_VERSION);
// });

// var MONTAGE_PATH = path.join(__dirname, "../../node_modules/montage");

// app.use("/node_modules/montage", express.static(MONTAGE_PATH));
// app.use("/node_modules/montage", express.directory(MONTAGE_PATH));

// app.listen(PORT);
// console.log("Environment: Node.js -", process.version, "Platform -", process.platform);
// console.log("Screening Server running on port " + PORT + " [" + process.env.NODE_ENV + "]");
// console.log("Screening Control Room: http://localhost:" + PORT + "/screening/control-room/index.html");
