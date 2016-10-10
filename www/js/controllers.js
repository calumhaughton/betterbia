'Use Strict';
angular.module('app.controllers', [])


// tabs controller used to update shopping list count

.controller('tabsCtrl', function ($scope, ShoppingList) {
    //$scope.tabBadge = {
    //    count:0
    //}

    //$scope.list;

    //ShoppingList.items.$watch(function (event) {
    //    $scope.list = ShoppingList.names();
    //    $scope.tabBadge.count = $scope.list.length;
    //});    
})

//Pop up controller
  .controller('PopoverController', function ($scope, $ionicPopover, $localStorage, $state) {

      $ionicPopover.fromTemplateUrl('templates/profile/profile-menu.html', {
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

 .filter("toArray", function () {
     return function(obj) {
         var result = [];
         angular.forEach(obj, function(val, key) {
             result.push(val);
         });
         return result;
     };
 })

    // filter to limit the number of ingredients displayed on the listHome page
.filter("limitTo5", function () {
    return function (data) {       
        if (data != null) {
            var ingArray = [];
            var dataLength = Object.keys(data).length;

            angular.forEach(data, function (value, key) {
                ingArray.push(value.name);
            });

            if (ingArray.length > 5) {
                var output = ingArray.slice(0, 5);
                output.push('...');
            } else {
                var output = ingArray;
            }

            return output;
        } else {
            var output = ["There isn't anything on this list yet."];
            return output;
        }
            
    }
})

    // takes in a list of recipes, and filters using a time value. Returns a set of recipes that match the time selected.
.filter("timeFilter", function (timeStore) {
    return function (data) {
        var output = {};
        var time = timeStore.getTime();

        if (!isNaN(time)) {
            angular.forEach(data, function (recipe) {
                if (recipe.time <= time) {
                    output[recipe.id] = recipe;
                }
            });

            return output;
        } else {
            return data;
        }
    }
})

    // Takes in a seconds value, and outputs it as MM:SS format
.filter("SecondstoMinutes", function () {
    return function (data) {
        var minutes = data / 60;
        var seconds = data % 60;
        if (minutes < 1) {
            minutes = 0;
        }

        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        var output = minutes + ":" + seconds;
        return output;
    }
})

.filter("DecimalToFraction", function () {
    return function (data) {
        var output = data;
        // If the quantity value is in decimal, swap it out for a fraction
        var excess = data % 1;

        // If the quantity is less than 1, replace the existing quantity with the fraction. 
        if (data < 1) {
            if (excess !== 0) {
                switch (excess) {
                    case 0.25:
                        output = '&frac14;';
                        break;
                    case 0.5:
                        output = '&frac12;';
                        break;
                    case 0.75:
                        output = '&frac34;';
                        break;
                    default:
                        // do nothing
                }
            }
        }

        // if the quantity is more than 1, remove digits after the decimal and replace them with a fraction
        if (data > 1) {
            if (excess !== 0) {
                var num = Math.floor(data);
                switch (excess) {
                    case 0.25:
                        output = num + '&frac14;';
                        break;
                    case 0.5:
                        output = num + '&frac12;';
                        break;
                    case 0.75:
                        output = num + '&frac34;';
                        break;
                    default:
                        // do nothing
                }

            }
        }
        return output;
    }
})

.filter('spiceImg', function () {
    return function (data) {
        if (data === 0) {
            return "";
        } else if (data === 1) {
            return "img/mild.svg";
        } else if (data === 2) {
            return "img/medium.svg";
        } else if (data === 3) {
            return "img/hot.svg";
        }
    }
})

.filter('trash', function () {
    return function (data) {
        var output = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].checked) {
                output.push(data[i]);
            }
        }
        return output
    }
})
;