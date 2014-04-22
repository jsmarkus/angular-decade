angular
  .module('demo', ['ngDecade'])
  .controller('DemoCtrl', ['$scope',
    function($scope) {
      angular.extend($scope, {
        maxDate: new Date(),
        minDate: new Date(new Date() - 10 * 365 * 24 * 3600 * 1000)
      });
    }
  ]);