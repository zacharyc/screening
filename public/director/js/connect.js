console.log('Session Id: ', sessionId);

// Not sure why it doesn't come over with it's own session, but we pass it in as part
// of the connect script. This allows us to connect to the current session
webdriver.process.setEnv(webdriver.Builder.SESSION_ID_ENV, sessionId);

var driver = new webdriver.Builder().build();

var testWindow = window.open('', 'slave');
driver.switchTo().window('slave');

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click().then(function() {
    driver.getTitle().then(function(title) {
        if (title !== 'webdriver - Google Search') {
            throw new Error(
                'Expected "webdriver - Google Search", but was "' + title + '"');
        }
    });
});