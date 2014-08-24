angular.module('ruvidding.main', []).factory('Logger', ['$log', function ($log) {
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
.controller('MainCtrl', ['$scope', '$sce', 'UserMedia', 'Logger', 'Signaller', 'PeerConnector',
  function ($scope, $sce, UserMedia, Logger, Signaller, PeerConnector) {
    var logger = new Logger('MainCtrl');
    $scope.streams = [];
    $scope.peers = PeerConnector.peers;

    UserMedia.get()
      .then(function (stream) {
        logger.info('got user media');
        $scope.streams.push(stream);
        Signaller.sendToRoom({messageType: 'ProclamationMessage'});
      }, function (e) {
        logger.error('Failed to get user media', e);
      });

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
