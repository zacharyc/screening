/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */

var fs = require("fs"),
    path = require("path"),
    vm = require("vm"),
    agentTypes = require('../agents/agent-pool.js').agentTypes,

    Sync = require('../sync.js').Sync, // TODOz: sync is used for keeping track of stacks, we don't need this client side
    ScriptClass = require('./script.js').Script,
    Result = require('./result.js').Result,

    // Promises
    Q = require("q"),
    when = Q.when,

    // Webdriver Agent
    WebDriverAgent = require('../agents/agents-webdriver/agent.js').WebDriverAgent,
    createWebdriverSession = require('../agents/agents-webdriver/util.js').createWebdriverSession,
    mouseEnum = require('../agents/agents-webdriver/util.js').Mouse,
    keyEnum = require('../agents/agents-webdriver/util.js').Key,
    Session = require('../webdriver/session.js').Session,

    // Actually we just import the assert.js, to generate the mapping code further down, that we inject in the test script,
    // no idea how to otherwise map methods to the inside-function scope, so we generate them.
    assertDecorator = require('./assert-decorator.js'),
    asserts = require('./assert.js'),
    getStackTraceByErrorStack = require("../util.js").getStackTraceByErrorStack,
    TMP_TEST_FILE_NAME = require("../consts.js").TMP_TEST_FILE_NAME;

/**
 * Test TestcaseRunner is able to execute tests. With it we can trigger
 * which tests should be executed where.
 *
 * @constructor
 * @param {Object} agentPool a management pool of agents where we can select from
 * @param {Boolean} isDebugMode defines if we run in debug-mode
 */
var TestcaseRunner = exports.TestcaseRunner = function(agentPool, isDebugMode, testcaseResultsProvider) {
    this.browsers = [];
    this.agentPool = agentPool;
    this.isDebugMode = !!isDebugMode;
    this.resultsProv = testcaseResultsProvider;
};

/**
 * Executes a test file that is accessible by this node instance.
 *
 * @param {String} testFile full path to a file on disk
 * @param {Object} desiredCaps which capabilities should the agent support
 * @return void
 */
// TODOz: looks unused, do we need it?
// TestcaseRunner.prototype.executeTestFile = function(testFile, desiredCaps) {
//     var self = this;

//     fs.readFile(testFile, "utf8", function(err, data) {
//         self.executeTest(data, desiredCaps);
//     });
// };

/**
 * Executes a script string.
 *
 * @param {String} testScript a complete test script object, contains the code and name
 * @param {Object} desiredCaps which capabilities should the agent support
 * @param {Object} options will describe preferences during this run of the code (they do not persist)
 * @return void
 */
TestcaseRunner.prototype.executeTest = function(testScript, desiredCapabilities, options, serverIp) {
    // TODO: extract the agents from the testscript
    var agent = this.agentPool.getAgentByCaps(desiredCapabilities);
    agent.startTest();

    var result;

    var session = new Session({url: agent.url});
    session.init = function(capabilities, callback){
        capabilities = capabilities ? capabilities : {};
        this.startSession(capabilities).then(callback, function(error) {
            console.error("**** WEBDRIVER START SESSION REJECTED! *****", error);
            callback(error);
        });
    };

    session.init(agent.capabilities, function() {
        // Read the recording script
        session.get('http://localhost:8081/director/index.html').then(function() {
            fs.readFile(__dirname + "/../../client/connect.js", 'utf8', function(err, connect) {
                var serverParams = "var sessionId = " + session.session.sessionId + ";";
                serverParams = serverParams + "var serverIp = '" + serverIp + "';";
                connect = serverParams + connect;

                Q.when(session.executeScript(connect), function() {
                    console.log("connect script launched");
                    // When the socket is instantiated it recorderReady will be called.
                }, function(err) {
                    console.log("Record Script Failed", err.value.message);
                });
            });
        });

        // fs.readFile(__dirname + "/../../client/webdriver.js", 'utf8', function(err, webDriverScript) {
        //     // TODOz: remove? console.log(err, webDriverScript);
        //     if(err) { console.log(err); return; }

        //     // Inject the recording script into the page
        //     Q.when(session.executeScript(webDriverScript), function() {
        //         console.log("webdriver script loaded");
        //         // When the socket is instantiated it recorderReady will be called.
        //     }, function(err) {
        //         console.log("Record Script Failed", err.value.message);
        //     }).then(function() {
        //         // session.executeScript('alert("foo");', []);
        //         console.log(session.session.sessionId);

        //         fs.readFile(__dirname + "/../../client/connect.js", 'utf8', function(err, connect) {
        //             var serverParams = "var sessionId = " + session.session.sessionId + ";";
        //             serverParams = serverParams + "var serverIp = '" + serverIp + "';";
        //             connect = serverParams + connect;

        //             Q.when(session.executeScript(connect), function() {
        //                 console.log("connect script launched");
        //                 // When the socket is instantiated it recorderReady will be called.
        //             }, function(err) {
        //                 console.log("Record Script Failed", err.value.message);
        //             });
        //         });
        //     }).then(function() {
        //         fs.readFile(__dirname + "/../../client/loadSocketio.js", 'utf8', function(err, socketIo) {
        //             console.log('socket io', socketIo);
        //             var serverParams = "var serverIp = '" + serverIp + "';";
        //             socketIo = serverParams + socketIo;
        //             Q.when(session.executeScript(socketIo), function() {
        //                 console.log('socket.io launched');
        //             }, function(err) {
        //                 console.log('socket.io failed', err.value);
        //             });
        //         });
        //     });
        // });

        console.log(__dirname);
        //
    });
    return 12; // TODOz: clean this up

    // // If we are a webdriver agent, use the new backend
    // if(agent.type == agentTypes.WEBDRIVER) {
    //     result = this._executeWebdriverTest(testScript, agent, options);
    // }

    // // add the result to our central repository
    // this.resultsProv.upsert(result.get(), function(err, object) {
    //     if (err) throw err;
    // });
    // return result.testcase.id;
};

TestcaseRunner.prototype._executeWebdriverTest = function(testScript, agent, options) {
    var self = this;
    var session = createWebdriverSession(agent.url);
    var sync = Object.create(Sync).init();

    // Validate that the passed testScript object contains code and name
    if(!testScript.code || !testScript.name) throw new Error("testScript must be an object with code and name properties.");

    // Create the result object
    var result = new Result(agent, {
        id: this.resultsProv.generateId(),
        code: testScript.code,
        name: testScript.name
    });

    // the options object can be manipulated in the test script
    var scriptObject = new ScriptClass();
    scriptObject.sync = sync;
    for(var i in testScript.preferences) {
        var pref = testScript.preferences[i];
        scriptObject.setOption(pref.shortName, pref.value);
    }
    for(var j in options){
        scriptObject.setOption(i, options[i]);
    }

    var agentConstructor = function() { return new WebDriverAgent(session, sync, scriptObject, result); };

    var writeResultsAndShowNotification = function() {
        // Write the results to the DB
        result.finalize();

        self.resultsProv.upsert(result.get(), function(err, object) {
            if (err) throw err;
        });

        // Show the notification to the control room
        agent.endTest(result.get());
    };

    // Start the webdriver session
    session.init(agent.capabilities, function(err) {
        if(!err.sessionId) {
            // Wrap error message inside Error object if required
            if (!(err instanceof Error)) {
                if (err.value && err.value.message) {
                    err = new Error(err.value.message);
                } else {
                    err = new Error(err);
                }
            }

            // If we have a valid session quit, if not simply display the results
            if (session.sessionUrl) {
                session.quit().then(function successCb() {
                    result.reportException(err);
                    writeResultsAndShowNotification();
                });
            } else {
                result.reportException(err);
                writeResultsAndShowNotification();
            }
        } else {
            // Execute the test, using our code synchronization system
            when(self._executeTestInVm(testScript.code, result, agentConstructor, scriptObject, sync), function() {
                // kill the webdriver session
                session.quit().then(function() {
                    writeResultsAndShowNotification();
                });
            });
        }
    });

    return result;
};

/**
 * Execute the given testcase source code on a given agent.
 */
TestcaseRunner.prototype._executeTestInVm = function(source, result, agent, scriptObject, sync){
    var self = this;
    // We have to execute test-scripts from the filesystem to get line-numbers.
    var decoratedAsserts = assertDecorator.initSync(result, scriptObject, sync);
    
    var defer = Q.defer();

    try {
        var script = vm.createScript(source, TMP_TEST_FILE_NAME);
        var scriptContext = {
            __result: result,
            script: scriptObject,
            Agent: agent,
            Mouse: mouseEnum,
            Key: keyEnum,
            console: console
        };

        scriptObject.globalObjects = {Agent: agent, script: scriptObject};
        // Add all asserts to the script context that we are passing into the test scripts env.
        for (var f in decoratedAsserts) {
            if (f.substr(0, 6)=="assert") { // We ONLY want the assert functions.
                scriptObject.globalObjects[f] = scriptContext[f] = decoratedAsserts[f];
            }
        }
    } catch(ex) {
        ex.message = "Error parsing script: " + ex.message;
        ex.lineNumber = "Unknown";
        ex.columnNumber = "Unknown";
        result.reportException(ex);
        defer.resolve();
        return defer.promise;
    }

    sync.runSync(function() {
        script.runInNewContext(scriptContext);
    }).then(function() {
        defer.resolve();
    }, function(ex) {
        var lineCol = getStackTraceByErrorStack(ex.stack, TMP_TEST_FILE_NAME);
        ex.lineNumber = lineCol[0]-1;
        ex.columnNumber = lineCol[1];
        result.reportException(ex);
        defer.resolve();
    });

    return defer.promise;
};
