angular.module('ruvidding', [])
  .factory('Logger', ['$log', function ($log) {
    return function (service) {
      this.$log = $log;
      var loggerService = this;
      ['debug', 'error', 'info', 'log'].forEach(function (loggerMethod) {
        loggerService[loggerMethod] = function () {
          var args = [].slice.call(arguments);
          args.unshift(service);
          $log[loggerMethod].apply(this, args);
        };
      });
    };
  }])
  .service('Socket', function () {
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
  ])
  .service('UserMedia', ['$q', function ($q) {
    var defaultConstraints = {video: true, audio: true};
    return {
      get: function (constraints) {
        constraints = constraints || defaultConstraints;
        var userMediaDeferred = $q.defer();
        var UserMedia = this;
        getUserMedia(constraints, function (stream) {
          UserMedia.stream = stream;
          userMediaDeferred.resolve(stream);
        }, userMediaDeferred.reject);
        return userMediaDeferred.promise;
      },
      localStream: function () {
        return this.stream;
      }
    };
  }])
  .factory('PeerConnection', ['$rootScope', 'Logger', 'Signaller',
    function ($rootScope, Logger, Signaller) {
      var logger = new Logger('PeerConnection');
      var Connection = RTCPeerConnection;
      return function (config, peerId) {
        var connection = new Connection(config);
        ['connecting', 'open', 'addstream', 'removestream', 'iceconnectionstatechange'].forEach(function (e) {
          connection['on' + e] = function (event) {
            logger.info(e, event);
            $rootScope.$broadcast(e, event, connection);
          };
        });

        connection.onicecandidate = function (e) {
          if(!e.candidate) { return; }
          Signaller.sendToPeer(peerId, {
            messageType: 'IceCandidateMessage',
            label: e.candidate.sdpMLineIndex,
            id: e.candidate.sdpMid,
            candidate: e.candidate.candidate
          })
        };
        return connection;
      };
    }
  ])
  .service('PeerConnector', ['$q', 'Logger', 'PeerConnection', 'Signaller', 'UserMedia',
    function ($q, Logger, PeerConnection, Signaller, UserMedia) {
      var logger = new Logger('PeerConnector');
      var iceServerGenerator = function () {
        return [ {urls: 'stun:stun.l.google.com:19302'} ];
      };
      var configParser = function configParser(config) {
        iceServerGenerator = config.iceServerGenerator || iceServerGenerator;
        var newConfig = $.extend({}, config);

        delete newConfig.iceServerGenerator;

        newConfig.iceServers = iceServerGenerator();
        return newConfig;
      };

      var peers = {};

      return {
        createOffer: function (peer, config) {
          var offerDeferred = $q.defer();
          var connection = new PeerConnection(configParser(config), peer);
          peers[peer] = connection;

          connection.addStream(UserMedia.localStream());
          connection.createOffer(function (descr) {
            connection.setLocalDescription(descr,
              function () { logger.debug('successfully set local description'); offerDeferred.resolve(); },
              function (e) { logger.error('unable to set local description because', e); offerDeferred.reject(); }
            );
            Signaller.sendToPeer(peer, {messageType: 'OfferSessionDescriptionMessage', description: descr});
          });
          return offerDeferred.promise;
        },
        createAnswer: function (peer, remoteDescr, config) {
          var answerDeferred = $q.defer();
          var connection = new PeerConnection(configParser(config), peer);
          peers[peer] = connection;

          connection.addStream(UserMedia.localStream());

          var remoteDescription = new RTCSessionDescription(remoteDescr);
          connection.setRemoteDescription(remoteDescription, function () {
            logger.debug('succesfully set remote description');
            connection.createAnswer(function (localDescr) {
              connection.setLocalDescription(localDescr);
              Signaller.sendToPeer(peer, {messageType: 'AnswerSessionDescriptionMessage', description: localDescr});
              answerDeferred.resolve();
            }, answerDeferred.reject);
          }, function (e) { logger.error('failed to set remote description', e); });
          return answerDeferred.promise;
        },
        connect: function (peer, remoteDescr) {
          var description = new RTCSessionDescription(remoteDescr);
          peers[peer].setRemoteDescription(description);
        },
        addIceCandidateTo: function (peer, candidateData) {
          var candidate = new RTCIceCandidate(candidateData);
          peers[peer].addIceCandidate(candidate);
        },
        peers: peers
      };
    }
  ])
  .factory('MessageFactory', ['$injector', 'Logger', function ($injector, Logger) {
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
  }])
  .directive('peerVideo', ['$sce', function ($sce) {
    return {
      restrict: 'E',
      scope: {
        stream: '='
      },
      link: function ($scope, $el, attrs) {
        $scope.url = $sce.trustAsResourceUrl(window.URL.createObjectURL($scope.stream));
      },
      template: "<video muted='muted' autoplay='autoplay' controls='controls' ng-src='{{url}}'></video>"
    }
  }])
  .controller('MainCtrl', ['$scope', '$sce', 'UserMedia', 'Logger', 'Signaller', 'PeerConnector',
    function ($scope, $sce, UserMedia, Logger, Signaller, PeerConnector) {
      var logger = new Logger('MainCtrl');
      $scope.streams = [];
      $scope.peers = PeerConnector.peers;

      UserMedia.get()
        .then(function (stream) { $scope.streams.push(stream); })
        .then(function () { logger.info('got user media'); }, function (e) { logger.error('Failed to get user media', e)})
        .then(function () { Signaller.sendToRoom({messageType: 'ProclamationMessage'}); });


      $scope.$on('addstream', function (e, remoteMedia) {
        $scope.streams.push(remoteMedia.stream);
        $scope.$digest();
      });

      $scope.$on('iceconnectionstatechange', function (e, event, connection) {
        if(connection.iceConnectionState == 'disconnected') {
          var index = $scope.streams.indexOf(connection.getRemoteStreams()[0]);
          $scope.streams.splice(index, 1);
          $scope.$digest();
        }
      });
    }
  ]);
