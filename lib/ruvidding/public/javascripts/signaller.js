var Signaller = function (fayeUrl) {
  this.faye = new Faye.Client(fayeUrl);
  this.subscription = this.faye.subscribe(this.getRoomName(), this.onMessage);

  this.subscription.then(function () { console.log('Signalling connection established.')});

  this.connections = [];
};

Signaller.prototype.sendToRoom = function sendToRoom(message) {
  this.faye.publish(this.getRoomName(), message);
};

Signaller.prototype.onMessage = function onMessage(data) {
  var message = new Signaller.Messages[data.messageType](data);
  message.exec(this.connections);
};

Signaller.prototype.getRoomName = function getRoomName() {
  var pathparts = this.getPathname().split('/')
  return '/' + pathparts[pathparts.length - 1];
};

Signaller.prototype.getPathname = function getPathname() {
  return window.location.pathname;
};

Signaller.Messages = {};

Signaller.Messages.IceCandidate = function (data) {
  this.data = data;
};
Signaller.Messages.IceCandidate.prototype.exec = function exec(connections) {
  var that = this;
  connections.forEach(function (conn) {
    var iceCandidate = new RTCIceCandidate(that.data);
    conn.addIceCandidate(iceCandidate);
  });
};
