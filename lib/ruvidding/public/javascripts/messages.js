angular.module('ruvidding.messages', []).factory('MessageFactory', ['$injector', 'Logger',
  function ($injector, Logger) {
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
.factory('Message', [function () {
  return function (data) {
    this.data = data;
    this.to = data.to;
    this.from = data.from;
  };
}])
.factory('IceCandidateMessage', ['Message', 'PeerConnector', function (Message, PeerConnector) {
  var IceCandidateMessage = function (data) {
    Message.call(this, data);
  };
  IceCandidateMessage.prototype.exec = function () {
    PeerConnector.addIceCandidateTo(this.from, this.data);
  };
  return IceCandidateMessage;
}])
.factory('ProclamationMessage', ['Message', 'PeerConnector', function (Message, PeerConnector) {
  var ProclamationMessage = function (data) {
    Message.call(this, data);
  };
  ProclamationMessage.prototype.exec = function () {
    PeerConnector.createOffer(this.from, {});
  };
  return ProclamationMessage;
}])
.factory('AnswerSessionDescriptionMessage', ['Message', 'PeerConnector', function (Message, PeerConnector) {
  var AnswerSessionDescriptionMessage = function (data) {
    Message.call(this, data);
  };
  AnswerSessionDescriptionMessage.prototype.exec = function () {
    PeerConnector.connect(this.from, this.data.description);
  };
  return AnswerSessionDescriptionMessage;
}])
.factory('OfferSessionDescriptionMessage', ['Message', 'PeerConnector', function (Message, PeerConnector) {
  var OfferSessionDescriptionMessage = function (data) {
    Message.call(this, data);
  };
  OfferSessionDescriptionMessage.prototype.exec = function () {
    PeerConnector.createAnswer(this.from, this.data.description, {});
  };
  return OfferSessionDescriptionMessage;
}]);
