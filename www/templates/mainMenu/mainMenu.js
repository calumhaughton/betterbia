
angular.module('app.controllers').controller('mainMenuCtrl', function ($scope, $ionicPopover, $localStorage, $state) {
    
        
        $ionicPopover.fromTemplateUrl('templates/mainMenu/mainMenu.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
        // Execute action on hide popover
        $scope.$on('popover.hidden', function () {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function () {
            // Execute action
        });

      


        //function to sign out the user 
        $scope.logout = function () {
            if (firebase.auth()) {
                firebase.auth().signOut().then(function () {
                    //Close the popover menu
                  $scope.closePopover();
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
