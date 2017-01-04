'Use Strict';
angular.module('app.controllers', [])

// Parses an object, and pushes each value into an array    
 .filter("toArray", function () {
     return function(obj) {
         var result = [];
         angular.forEach(obj, function(val, key) {
             result.push(val);
         });
         return result;
     };
 })

// Removes Firebase internal object values from an array, and returns the other values to a new array
.filter('filterFirebaseInternals', function () {
    return function (data) {
        var output = [];

        for (var i = 0; i < data.length; i++) {
            if (data[i].slice(0, 1) !== '$') {
                output.push(data[i]);
            }
        }

        return output;    
    }
})

// Limits an array to 5 items, and places '...' as the last element. Used on List Home page.
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

// Loops through Recipes List, and filters using the stored value in timeStore. Returns a set of recipes that match the time selected.
.filter("timeFilter", function (timeStore) {
    return function (data) {

        var output = {};
        var time = timeStore.getTime();

        if (!isNaN(time)) {

            angular.forEach(data, function (recipe) {
                // If recipe.time is equal to or less than the stored value, add recipe to output
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

// Turns time value from SSSS to MM:SS
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

// Converts a decimal value to the HTML value for its fraction
.filter("DecimalToFraction", function () {
    return function (data) {
        var output = data;        

        // Find the value to turn into a fraction
        var excess = data % 1;

        // If the quantity is less than 1, replace the existing quantity with the fraction. 
        if (data < 1) {
            if (excess !== 0) {
                switch (excess) {
                    case 0.125:
                        output = '&#8539;';
                        break;
                    case 0.25:
                        output = '&frac14;';
                        break;
                    case 0.375:
                        output = '&#8540;';
                        break;
                    case 0.5:
                        output = '&frac12;';
                        break;
                    case 0.675:
                        output = '&#8541;';
                        break;
                    case 0.75:
                        output = '&frac34;';
                        break;
                    case 0.875:
                        output = '#8542;';
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
                    case 0.125:
                        output = num + '&#8539;';
                        break;
                    case 0.25:
                        output = num + '&frac14;';
                        break;
                    case 0.375:
                        output = num + '&#8540;';
                        break;
                    case 0.5:
                        output = num + '&frac12;';
                        break;
                    case 0.675:
                        output = num + '&#8541;';
                        break;
                    case 0.75:
                        output = num + '&frac34;';
                        break;
                    case 0.875:
                        output = num + '#8542;';
                        break;
                    default:
                        // do nothing
                }

            }
        }
        return output;
    }
})

// Used by the Shopping List service to clear items from the List Detail page
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
});