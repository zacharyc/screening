//alert('connect');

console.log(webdriver);

setTimeout(function() {
    debugger;
    console.log('timeout');
    //webdriver.chrome.driver = true; TODOz: seems to be from Java
    var client = new webdriver.http.CorsClient('http://localhost:4444/wd/hub');
    var executor = new webdriver.http.Executor(client);

    // Launches a new browser, which can be controlled by this script.
    var driver = webdriver.WebDriver.createSession(executor, {
        'browserName': 'chrome',
        'version': '',
        'platform': 'ANY',
        'javascriptEnabled': true
    });

    //driver.setWindowSize(20,20);
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
    

    driver.quit();

}, 4000);
