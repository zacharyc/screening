console.log('running lib code');

function postMessageReceiver(event) {
    console.log('got a message', event);
}

window.addEventListener("message", postMessageReceiver, false);