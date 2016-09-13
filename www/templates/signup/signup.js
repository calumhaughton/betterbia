// signupCtrl

angular.module('app.controllers').controller('signupCtrl', function ($scope, $state, $localStorage, Utils, Popup, Firebase) {
    $scope.$on('$ionicView.enter', function () {
        //Clear the Registration Form.
        $scope.user = {
            email: '',
            password: ''
        };
    })

    
});