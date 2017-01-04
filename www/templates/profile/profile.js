// profileCtrl

angular.module('app.controllers').controller('profileCtrl', function ($scope, $state, $localStorage, Popup, Firebase, $firebaseObject, $rootScope, $timeout) {
    $scope.loading = true;

    $scope.$on('getAccountDetails', function () {
        // Gives the calendar time to load, then renders it to the DOM with ng-if
        $scope.loading = true;
        $timeout(function () {
            $scope.loading = false;
        }, 3000);
    });

    // Get the current day and pass it to the calendar
    $scope.day = moment();
});