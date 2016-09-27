angular.module('app.controllers').controller('masterCtrl', function ($scope, $rootScope) {
    $scope.title = 'Profile';

    $scope.updateTitle = function (i) {
        if (i === 0) {
            $rootScope.$broadcast('hideSearchIcon');
            $scope.title = 'Profile';
        } else if (i === 1) {
            $rootScope.$broadcast('showSearchIcon');
            $scope.title = 'Recipes';
        } else if (i === 2) {
            $rootScope.$broadcast('hideSearchIcon');
            $scope.title = 'Shopping Lists';
        }
    }
});
