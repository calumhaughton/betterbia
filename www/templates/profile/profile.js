// profileCtrl

angular.module('app.controllers').controller('profileCtrl', function ($scope, $state, $localStorage, Popup, Firebase, $firebaseObject) {

    $scope.$on('$ionicView.enter', function () {
        StatusBar.backgroundColorByHexString("#5b800d");

        //Retrieve Account details using AngularFire.
        var account = Firebase.getById('accounts', $localStorage.accountId);
        account.$loaded().then(function () {
            //Set the variables to be shown on home.html
            $scope.email = account.email;
            $scope.provider = account.provider;
        });
    })



    $scope.day = moment();
});