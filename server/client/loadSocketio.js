console.log('loadsocketio.js working', serverIp);
var req = new XMLHttpRequest();
// serverIp has been previously defined
req.open("GET", "http://" + serverIp + ":8081/socket.io/socket.io.js", true);
req.setRequestHeader("Content-Type", "application/javascript");
console.log(req);
req.onreadystatechange = function(aEvt) {
    if(req.readyState == 4 && req.status >= 300) {
        console.log(req.response);
        //var resp = JSON.parse(req.response);
        //Alert.show(resp.error);
    } else {
        console.log(aEvt.value, req.status, req.readyState);
    }
};
req.send();