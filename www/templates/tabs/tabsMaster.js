angular.module('app.controllers').controller('masterCtrl', function ($firebaseObject, $scope, $rootScope, $timeout, $localStorage) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#5b800d");
        $timeout(function () {
            $rootScope.$broadcast('getAccountDetails');
        }, 150);
    });

    $scope.title = 'Profile';

    // When the slide changes, update the main header title
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


    // Manage and display onboarding messages when a user first logs in
    $scope.onboarding = {};

    $scope.$on('getAccountDetails', function () {
        $scope.onboarding = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/onboarding'));
    });

    // Saves to user account when they have been onboarded
    $scope.profileOnboarded = function () {
        $scope.onboarding.profile = true;
        $scope.onboarding.$save();
    }

    $scope.recipesOnboarded = function () {
        $scope.onboarding.recipes = true;
        $scope.onboarding.$save();
    }

    $scope.listsOnboarded = function () {
        $scope.onboarding.shoppingLists = true;
        $scope.onboarding.$save();
    }
});
