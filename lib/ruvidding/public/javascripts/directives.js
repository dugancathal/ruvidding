angular.module('ruvidding.directives', []).directive('peerVideo', ['$sce', function ($sce) {
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
}]);