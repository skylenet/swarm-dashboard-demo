var app = angular.module('app',[]);

app.controller('mainController', ['$scope','$http','$interval', function($scope,$http,$interval) {
  $scope.connected = false;

  $scope.websocketEndpoint = "ws://localhost:8546"
  $scope.kademliaInfo = {};
  $scope.bzzInfo = {};
  $scope.socket = null;


  $scope.connect = function(wsEndpoint){
    var jrpc = new simple_jsonrpc();
    $scope.socket = new WebSocket(wsEndpoint);

    $scope.socket.onmessage = function(event) {
      jrpc.messageHandler(event.data);
    };

    jrpc.toStream = function(_msg){
        $scope.socket.send(_msg);
    };

    $scope.socket.onerror = function(error) {
      console.error("Error: " + error.message);
    };

    $scope.socket.onclose = function(event) {
      if (event.wasClean) {
          console.info('Connection close was clean');
      } else {
          console.error('Connection suddenly close');
      }
      console.info('close code : ' + event.code + ' reason: ' + event.reason);
      $scope.connected = false;
    };

    var updateKademlia = function(){
      jrpc.call('bzz_kademliaInfo').then(function (result) {
        $scope.kademliaInfo = result;
        $scope.$apply();
      });
      jrpc.call('bzz_info').then(function (result) {
        $scope.bzzInfo = result;
        $scope.$apply();
      });

    }

    $scope.socket.onopen = function(){
      updateKademlia();
      $scope.intervalStop = $interval(updateKademlia, 5000);
      $scope.connected = true;
    };
  }

  $scope.disconnect = function(){
    if ($scope.socket != null) {
      $scope.socket.close();
      $interval.cancel($scope.intervalStop);
      $scope.socket = null;
      $scope.connected = false;
      $scope.kademliaInfo = {};
      $scope.bzzInfo = {};
    }
  }

}]);
