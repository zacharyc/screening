

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