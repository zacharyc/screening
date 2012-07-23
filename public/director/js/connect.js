console.log('running connect.js', a);

var testWindow = window.open('', 'slave');
driver.switchTo().window('slave');

console.log(Screening);
driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click().then(function() {
    driver.getTitle().then(function(title) {
        if (title !== 'webdriver - Google Search') {
            console.log('attemtping to send out a message');
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("serverMessage", true, false);
            event.screeningType = "error";
            event.screeningContent = "Titles did not match";
            document.dispatchEvent(event);

            // throw new Error(
            //     'Expected "webdriver - Google Search", but was "' + title + '"');
        }
    });
});