angular.module('ruvidding.messages', []).factory('MessageFactory', ['$injector', 'Logger', function ($injector, Logger) {
  var logger = new Logger('MessageFactory');
  var injector = $injector;
  return function (data) {
    if (data.messageType.match(/Message$/)) {
      return new (injector.get(data.messageType))(data);
    } else {
      logger.error('Unable to work with ' + data.messageType);
    }
  };
}
])
.factory('IceCandidateMessage', ['PeerConnector', function (PeerConnector) {
  var IceCandidateMessage = function (data) {
    this.data = data;
    this.to = data.to;
    this.from = data.from;
  };
  IceCandidateMessage.prototype.exec = function () {
    PeerConnector.addIceCandidateTo(this.from, this.data);
  };
  return IceCandidateMessage;

}])
.factory('ProclamationMessage', ['PeerConnector', function (PeerConnector) {
  var ProclamationMessage = function (data) {
    this.data = data;
    this.to = data.to;
    this.from = data.from;
  };
  ProclamationMessage.prototype.exec = function () {
    PeerConnector.createOffer(this.from, {});
  };
  return ProclamationMessage;
}])
.factory('AnswerSessionDescriptionMessage', ['PeerConnector', function (PeerConnector) {
  var AnswerSessionDescriptionMessage = function (data) {
    this.data = data;
    this.to = data.to;
    this.from = data.from;
  };
  AnswerSessionDescriptionMessage.prototype.exec = function () {
    PeerConnector.connect(this.from, this.data.description);
  };
  return AnswerSessionDescriptionMessage;
}])
.factory('OfferSessionDescriptionMessage', ['PeerConnector', function (PeerConnector) {
  var OfferSessionDescriptionMessage = function (data) {
    this.data = data;
    this.to = data.to;
    this.from = data.from;
  };
  OfferSessionDescriptionMessage.prototype.exec = function () {
    PeerConnector.createAnswer(this.from, this.data.description, {});
  };
  return OfferSessionDescriptionMessage;
}]);
