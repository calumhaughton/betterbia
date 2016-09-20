angular.module('app.controllers').controller('accountOptionsCtrl', function ($scope, $state, $localStorage, $cordovaCamera, $cordovaFile) {

    //function to sign out the user 
    $scope.logout = function () {
        if (firebase.auth()) {
            firebase.auth().signOut().then(function () {              
                //Clear the saved credentials.
                $localStorage.$reset();
                //Proceed to login screen.
                $state.go('login');
            }, function (error) {
                //Show error message.
                Utils.message(Popup.errorIcon, Popup.errorLogout);
            });
        }
    };

  

})