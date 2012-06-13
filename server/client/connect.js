// var client = new webdriver.http.CorsClient('http://localhost:4444/wd/hub');
// var executor = new webdriver.http.Executor(client);

// Launches a new browser, which can be controlled by this script.
// var driver = webdriver.WebDriver.createSession(executor, {
//     'browserName': 'chrome',
//     'version': '',
//     'platform': 'ANY',
//     'javascriptEnabled': true
// });

//driver.setWindowSize(300,300);
// driver.get('http://localhost:8081/samples/sample.html');
//driver.get('http://www.google.com');
// driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
// driver.findElement(webdriver.By.name('btnG')).click().then(function() {
//     driver.getTitle().then(function(title) {
//         if (title !== 'webdriver - Google Search') {
//             throw new Error(
//                 'Expected "webdriver - Google Search", but was "' + title + '"');
//         }
//     });
// });


//driver.quit();

console.log(sessionId);
webdriver.process.setEnv(webdriver.Builder.SESSION_ID_ENV, sessionId);
setTimeout(function() {

    var driver = new webdriver.Builder().build();
    driver.get('http://www.google.com');
}, 4000);
  // var input = driver.findElement(webdriver.By.tagName('input'));
  // input.sendKeys('foo bar baz').then(function() {
  //   assertEquals('foo bar baz',
  //       document.getElementById('input').value);
  // });