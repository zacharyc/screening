/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
var settings = require("./settings.js"),
    express = require("express"),
    fs = require("fs"),
    path = require("path"),
    argv = require("optimist").argv,
    TestcaseRunner = require("./lib/testcase-runner.js").TestcaseRunner,
    agentPool = require("./lib/agent-pool.js").agentPool,
    agentTypes = require("./lib/agent-pool.js").agentTypes,
    simpleRequest = require("request"),
    MongoDbProvider = require("./lib/database/mongo-provider.js"),
    TestcaseResultsProvider = require("./lib/database/testcase-results-provider.js"),
    BatchesProvider = require("./lib/database/batches-provider.js"),
    ScriptsProvider = require("./lib/database/scripts-provider.js");

// Get the Screening Version from package.json
var packageJsonContents = fs.readFileSync(__dirname + "/package.json", "utf8");
var packageJson = JSON.parse(packageJsonContents);
const SCREENING_VERSION = packageJson.version;

// Define the exports
var app = exports.app = express.createServer();
exports.agentPool = agentPool;
exports.SCREENING_VERSION = SCREENING_VERSION;

/**
 * Configures the Screening server, sets up the middleware wiring.
 * @param {MongoDbProvider} customMongoDbProvider optional MongoDbProvider used for unit testing
 */
exports.configureServer = function(customMongoDbProvider) {
    var mongoDbProvider = customMongoDbProvider || new MongoDbProvider(settings.mongoDB.host, settings.mongoDB.port);
    mongoDbProvider.ensureIndexes();
    var testcaseResultsProvider = new TestcaseResultsProvider(mongoDbProvider.db);
    var scriptsProvider = new ScriptsProvider(mongoDbProvider.db);
    var batchesProvider = new BatchesProvider(mongoDbProvider.db);

    var testcaseRunner = new TestcaseRunner(agentPool, argv.debug, testcaseResultsProvider);
    // instantiate the singleton of our testrunner
    // runner will output more details by passing --debug

    var routingConfig = require("./rest-api/routing-config.js");
    var agentsApi = require("./rest-api/agents.js")(agentPool, testcaseRunner, scriptsProvider, batchesProvider);
    var scriptsApi = require("./rest-api/scripts.js")(scriptsProvider);
    var testResultsApi = require("./rest-api/test-results.js")(testcaseResultsProvider);
    var batchesApi = require("./rest-api/batches.js")(batchesProvider);

    const SCREENING_PATH = path.join(__dirname, "../public");

    // Manually adding a new text/plain parser that will add the body verbatim to req.body
    var bodyParser = express.bodyParser;
    bodyParser.parse["application/javascript"] = bodyParser.parse["text/plain"] = function(req, options, callback) {
        var buf = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) { buf += chunk; });
        req.on('end', function(){
            req.body = buf;
            callback();
        });
    };

    app.configure(function() {
        /* Express Middleware: ORDER MATTERS! */
        app.use(bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({ secret: "hellomoto" }));
        app.use(app.router);

        app.use("/", express.directory(SCREENING_PATH));
        app.use("/", express.static(SCREENING_PATH));
    });

    // REST-API wiring
    routingConfig.apiKeyAuth(app);
    app.use(routingConfig.apiRoot + "/agents", agentsApi);
    app.use(routingConfig.apiRoot + "/scripts", scriptsApi);
    app.use(routingConfig.apiRoot + "/test_results", testResultsApi);
    app.use(routingConfig.apiRoot + "/batches", batchesApi);
    routingConfig.init(app);

    // Check to see if a local Webdriver agent is available on the default port
    // when the server starts up. If we get a response, add it as an agent automatically.
    var url = "http://localhost:9515"
    simpleRequest(url + "/status", function (error, response, body) {
        if (error || response.statusCode != 200) {
            // Fail silently, this isn't really a problem.
        } else {
            agentPool.addAgent({browserName: "chrome"}, {
                url: url,
                type: agentTypes.WEBDRIVER
            });
            console.log("Found a webdriver instance running at " + url + ". Added it as an Agent by default.");
        }
    });
}
