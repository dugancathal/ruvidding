angular.module('ruvidding.rtc', []).service('UserMedia', ['$q', function ($q) {
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
      console.log('Calling the generator!');
      return $.ajax({url: '/ice', method: 'GET', async: false, dataType: 'json'}).responseJSON;
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