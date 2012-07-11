console.log('initializing director');
console.log('Session Id: ', sessionId);

// Not sure why it doesn't come over with it's own session, but we pass it in as part
// of the connect script. This allows us to connect to the current session
webdriver.process.setEnv(webdriver.Builder.SESSION_ID_ENV, sessionId);

window.driver = new webdriver.Builder().build();