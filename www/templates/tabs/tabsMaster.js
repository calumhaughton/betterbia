angular.module('app.controllers').controller('masterCtrl', function ($scope, $rootScope) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#5b800d");
    });

    $scope.title = 'Profile';

    $scope.updateTitle = function (i) {
        if (i === 0) {
            $rootScope.$broadcast('hideSearchIcon');
            $scope.title = 'Profile';
            $scope.showInputs = false;
        } else if (i === 1) {
            $rootScope.$broadcast('showSearchIcon');
            $scope.title = 'Recipes';
            $scope.showInputs = true;
        } else if (i === 2) {
            $rootScope.$broadcast('hideSearchIcon');
            $scope.title = 'Shopping Lists';
            $scope.showInputs = false;
        }
    }

    $scope.showInputs = false;
});
