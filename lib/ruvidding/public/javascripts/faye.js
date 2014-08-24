angular.module('ruvidding.faye', []).service('Socket', function () {
  return {
    init: function (url, room) {
      this.room = room;
      this.faye = new Faye.Client(url);
    },
    subscribe: function (onMessage, onSubscribeComplete) {
      return this.faye.subscribe(this.room, onMessage);
    },
    publish: function (message) {
      return this.faye.publish(this.room, message);
    },
    clientId: function () {
      return this.faye._clientId;
    }
  }
})
.service('Signaller', ['Socket', 'Logger', 'MessageFactory',
  function (Socket, Logger, MessageFactory) {
    var logger = new Logger('Signaller');
    var getRoomName = function getRoomName() {
      var pathparts = location.pathname.split('/')
      return '/' + pathparts[pathparts.length - 1];
    };

    var onMessage = function (data) {
      var message = new MessageFactory(data);
      if (data.from === Socket.clientId() || (data.to && data.to !== Socket.clientId())) {
        logger.debug('ignoring ->', message);
      } else {
        logger.debug('->', message);
        message.exec(this);
      }
    };

    Socket.init('/faye/faye', getRoomName());
    var subscription = Socket.subscribe(onMessage.bind(this)).then(function () {
      logger.debug('client id:', Socket.clientId());
    });
    return {
      sendToRoom: function (message) {
        subscription.then(function () {
          message.from = Socket.clientId();
          logger.debug('<-', message);
          Socket.publish(message);
        });
      },
      sendToPeer: function (peerId, message) {
        message.to = peerId;
        this.sendToRoom(message);
      }
    };
  }
]);