var Signaller = function (fayeUrl) {
  this.faye = new Faye.Client(fayeUrl);
  this.subscription = this.faye.subscribe('/' + this.getRoomName(), this.messageHandler);

  this.subscription.then(function () { console.log('Signalling connection established.')});
};

Signaller.prototype.getRoomName = function () {
  var pathparts = this.getPathname().split('/')
  return pathparts[pathparts.length - 1];
};

Signaller.prototype.getPathname = function () {
  return window.location.pathname;
};

Signaller.prototype.messageHandler = function (data) {
  console.log('message received:', data);
};
