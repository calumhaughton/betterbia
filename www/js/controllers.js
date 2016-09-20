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


  

    // takes in a list of recipes, and filters using a time value. Returns a set of recipes that match the time selected.
.filter("timeFilter", function (timeStore) {
    return function (data) {
        var output = {};
        var time = timeStore.getTime();

        if (!isNaN(time)) {
            angular.forEach(data, function (recipe) {
                if (recipe.time == time || (recipe.time + 5) == time || (recipe.time - 5) == time) {
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