console.log('loading director');

// Called sometime after postMessage is called
// function receiveMessage(event)
// {
//     // TODOz: add some safety checks in here for sender (need testing url)
//     // Do we trust the sender of this message?
//     // if (event.origin !== "http://localhost") {
//     //     console.log(event.origin);
//     //     return;
//     // }

//     console.log('got a message', event);

//   // event.source is window.opener
//   // event.data is "hello there!"

//   // Assuming you've verified the origin of the received message (which
//   // you must do in any case), a convenient idiom for replying to a
//   // message is to call postMessage on event.source and provide
//   // event.origin as the targetOrigin.
//   // event.source.postMessage("hi there yourself!  the secret response " +
//                            // "is: rheeeeet!",
//                            // event.origin);
// }

//window.addEventListener("message", receiveMessage, false);

// TODOz: remove this file? do everything in montage?

function connectDirector() {

}

window.addEventListener("message", function(event) {
    console.log('in director listener');
});

// window.Screening = Object.create(Object, {
//     launchApp: {
//         value: function(url) {
//             console.log(url);
//         }
//     },

//     version: {
//         value: "1.2.0"
//     }
// });

console.log(Screening);