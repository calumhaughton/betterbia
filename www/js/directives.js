angular.module('app.directives', [])


//calendar directive
.directive("calendar", function () {

    return {
        restrict: "E",
        templateUrl: "calendar-temp.html",
        controller: function ($scope, $localStorage, $firebaseObject, $rootScope) {
            
            $scope.calendar = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/calendar'));

            $scope.accountId = $localStorage.accountId;


            $scope.selected = $scope.selected || moment().startOf('day');
            $scope.month = $scope.selected.clone();

            var start = $scope.selected.clone();
            start.date(1);
            _removeTime(start.day(0));
            _buildMonth($scope, start, $scope.month);

            $scope.select = function (day) {
                if (day.isSelectable) {
                    $scope.selected = day.date;

                    var date = $scope.selected._d.toString();

                    var year = date.substr(11, 4);
                    var month = date.substr(4, 3);
                    var day = date.substr(8, 2);

                    var dayRef = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/calendar/' + year + '/' + month + '/' + day));
                    dayRef.$loaded().then(function () {
                        if (dayRef.ateHealthy) {
                            $scope.healthy = true;
                        } else {
                            $scope.healthy = false;
                        }

                        if (dayRef.exercised) {
                            $scope.exercise = true;
                        } else {
                            $scope.exercise = false;
                        }
                    });
                }
            };

            $scope.next = function () {
                var next = $scope.month.clone();
                _removeTime(next.month(next.month() + 1)).date(1);
                $scope.month.month($scope.month.month() + 1);
                _buildMonth($scope, next, $scope.month);
            };
            $scope.previous = function () {
                var previous = $scope.month.clone();
                _removeTime(previous.month(previous.month() - 1).date(1));
                $scope.month.month($scope.month.month() - 1);
                _buildMonth($scope, previous, $scope.month);
            };

            $scope.recalcPoints = function (type, boolean) {

                //retrieve the selected date, and add it the database
                var date = $scope.selected._d.toString();
                
                var year = date.substr(11, 4);
                var month = date.substr(4, 3);
                var day = date.substr(8, 2);


                $scope.calendar.$loaded().then(function () {
                    if (boolean) {
                        $scope.calendar.points += 1;
                    } else {
                        $scope.calendar.points -= 1;
                    }
                    

                    if (!(year in $scope.calendar)) {
                        $scope.calendar[year] = {};
                        $scope.calendar[year][month] = {};
                        $scope.calendar[year][month][day] = {};
                        $scope.calendar[year][month][day][type] = boolean;
                    } else if (!(month in $scope.calendar[year])) {
                        $scope.calendar[year][month] = {};
                        $scope.calendar[year][month][day] = {};
                        $scope.calendar[year][month][day][type] = boolean;
                    } else if (!(day in $scope.calendar[year][month])) {
                        $scope.calendar[year][month][day] = {};
                        $scope.calendar[year][month][day][type] = boolean;
                    } else {
                        $scope.calendar[year][month][day][type] = boolean;
                    }

                    $scope.calendar.$save();
                    $rootScope.$broadcast('update calendar');
                });
            };


        }// end of controller
    };// end of Return

    function _removeTime(date) {
        return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }
    function _buildMonth(scope, start, month) {
        scope.weeks = [];
        var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
        while (!done) {
            scope.weeks.push({ days: _buildWeek(date.clone(), month) });
            date.add(1, "w");
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }
    }
    function _buildWeek(date, month) {
        var days = [];
        for (var i = 0; i < 7; i++) {
            days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(moment(), "day"),
                isSelectable: date.isSameOrBefore(moment()),
                date: date
            });
            date = date.clone();
            date.add(1, "d");
        }
        return days;
    }
})

    .directive('calendarDay', function ($localStorage, $firebaseObject, $rootScope) {
        return {
            restrict: 'EA',
            scope: {
                custom: "=",
                calendar: "=",
            },
            link: function (scope, element, attrs) {
                scope.fullDay = (scope.custom.date._d).toString();
                
                scope.year = scope.fullDay.substr(11, 4);
                scope.month = scope.fullDay.substr(4, 3);
                scope.day = scope.fullDay.substr(8, 2);

                scope.updateDayColour = function (year, month, day, calendar) {
                    if (year in calendar) {
                        if (month in calendar[year]) {
                            if (day in calendar[year][month]) {
                                var dayRef = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/calendar/' + year + '/' + month + '/' + day));
                                dayRef.$loaded().then(function () {
                                    if (dayRef.ateHealthy && dayRef.exercised) {
                                        element.addClass('twoOptions');
                                    } else if (dayRef.ateHealthy || dayRef.exercised) {
                                        element.removeClass('twoOptions');
                                        element.addClass('oneOption');
                                    } else {
                                        element.removeClass('oneOption');
                                    }
                                });
                            }
                        }
                    }
                }

                scope.calendar.$loaded().then(function () {
                    scope.updateDayColour(scope.year, scope.month, scope.day, scope.calendar);
                });

                $rootScope.$on('update calendar', function () {
                    scope.updateDayColour(scope.year, scope.month, scope.day, scope.calendar);
                });
            }
        }
})

    // Recipe Steps page, shows and manages and timer steps in recipe methods
.directive('timerDisplay', function ($timeout) {
    return function (scope, element, attrs) {
        // this block differentiates between the old array style and the new object style, and adjust the page accordingly. Should be removed when array style is removed. 
        scope.oldStyle = "";
        scope.newStyle = "";

        if (Array.isArray(scope.step.timer) || scope.step.timer == 0) {
            scope.oldStyle = true;
            scope.newStyle = false;
        } else if (scope.step.timer === Object(scope.step.timer)) {
            scope.oldStyle = false;
            scope.newStyle = true;
        }


        scope.showTimer = false;
        scope.upcomingTimer = false;

        // This code block is for the old timer setup, and should be removed in favor of the object style in later versions.
        if (Array.isArray(scope.step.timer)) {
            if (scope.step.timer[0] === 0) {
                scope.showTimer = false;
                scope.upcomingTimer = true;
            } else if (scope.step.timer[0] === 1) {
                scope.showTimer = true;
                scope.upcomingTimer = false;
            }
        } else {
            scope.showTimer = false;
            scope.upcomingTimer = false;
        }

        scope.startUpcomingTimer = function (i) {
            document.getElementsByTagName('timer')[i + 1].start();
        }

        //This code works with the new object style timer, for fixedPage and scrollable timers
        scope.showFixedPageTimer = scope.step.timer.fixedPageTimer;
        scope.showScrollableTimer = scope.step.timer.scrollableTimer;

        scope.currentTime = scope.step.timer.time;

        scope.timerRunning = false;
        scope.slideOutVanish = false;
        scope.imageVanish = false;

        scope.startFixedTimer = function (i) {
            var timerIndex = document.getElementsByTagName('timer');
            document.getElementsByTagName('timer')[i + 1].start();
            scope.timerRunning = true;

            $timeout(function () {
                scope.slideOutVanish = true;
            }, 600);
            $timeout(function () {
                scope.imageVanish = true;
            }, 300);
        }

        scope.$on('timer-tick', function (event, args) {
            scope.currentTime -= 1;
            scope.$digest();
        });

    }
})


// Sort through the ingredients on the recipe detail and shopping list page, and alters display based on each ingredient
.directive('ingredientDisplay', function () {
    return function (scope, element, attrs) {
        // Switches between which ingredient ion-item to display
        scope.measureDisplay = true;
        scope.prepDisplay = true;

        if (scope.ingredient.prep === "") {
            scope.prepDisplay = false;
        } else {
            scope.prepDisplay = true;
        }

        if (scope.ingredient.measure === "") {
            scope.measureDisplay = false;
        } else {
            scope.measureDisplay = true;
        }

        // if the quantity is larger than 1, add an 's' to the measure
        if (scope.ingredient.quantity > 1) {
            if (scope.ingredient.measure !== "ml" && scope.ingredient.measure !== "") {
                var lastLetter = scope.ingredient.measure.slice(-1);
                if (lastLetter !== "s") {
                    scope.ingredient.measure = scope.ingredient.measure + "s";
                }
            }
        }
    }
})

// Directives for the sliding ingredients menu on recipeSteps
.directive('menu', function () {
    return {
        restrict: 'E',
        template: "<div ng-class='{ show: visible, left: alignment === \"left\", right: alignment === \"right\" }' ng-transclude></div>",
        transclude: true,
        scope: {
            visible: '=',
            alignment: '@'
        }
    };
})

.directive('menuItem', function () {
    return {
        restrict: 'E',
        template: "<div ng-transclude></div>",
        transclude: true,

        link: function ($scope) {

        }
    }
})

    // allows shopping list buttons to flash green for 3 seconds when they are clicked
.directive('buttonFlash', function ($timeout) {
    return function (scope, element, attrs) {
        scope.trigger = false;

        scope.reset = function () {
            scope.trigger = true;
            $timeout(function () {
                scope.trigger = false;
            }, 3000);
        }
    }
})

// shows options when an item edit button is clicked on the shopping list

.directive('optionsDisplay', function ($timeout) {
    return function (scope, element, attrs) {

        scope.shift = false;
        scope.showButtons = false;

        scope.shiftOptions = function () {
            if (scope.shift) {
                scope.showButtons = false;
                $timeout(function () {
                    scope.shift = false;
                }, 300);
            } else {
                scope.shift = true;
                $timeout(function () {
                    scope.showButtons = true;
                }, 300);
            }
        }

        scope.addQuantity = function () {
            scope.ingredient.quantity += 1;
            scope.items.$save(scope.ingredient).then(function (ref) {});
        }

        scope.removeQuantity = function () {
            scope.ingredient.quantity -= 1;
            scope.items.$save(scope.ingredient).then(function (ref) {});
        }
    }
})

.directive('timeSelect', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/recipesList/timeSelect.html',
        replace: true,
        transclude:true,
        controller: function ($scope, $log, $rootScope, $timeout, timeStore) {
            $scope.menuOpen = false;
            $scope.sliderOn = false;

            $scope.slider = {
                value: 60,
                options: {
                    id: 'slider-id',
                    floor: 20,
                    ceil: 60,
                    step:5,
                    showSelectionBar: true,
                    hideLimitLabels: true,
                    hidePointerLabels:true,
                    vertical: true,
                    onEnd: function (id) {
                        $scope.open();
                        timeStore.setTime($scope.slider.value);
                    }
                }
            }

            $scope.open = function () {
                if ($scope.menuOpen) {
                    $scope.sliderOn = false;
                    $rootScope.$broadcast('rzSliderForceRender');
                    $timeout(function () {
                        $scope.menuOpen = false;
                    }, 300);
                } else {
                    $scope.menuOpen = true;
                    $timeout(function () {
                        $scope.sliderOn = true;
                        $rootScope.$broadcast('rzSliderForceRender');
                    }, 300);
                }
            }
        }
    }
})

.directive("ingAddedModal", function () {
    return {
        restrict: "E",
        templateUrl: "templates/ing-added-modal.html",
        replace: true,
        link:function($scope) {
            if ($scope.page === "Recipe Detail") {
                $scope.menuHidden = true;
            } else {
                $scope.menuHidden = false;
            }
        },
        controller: function ($rootScope, $scope, $timeout, ShoppingList) {
            $scope.multipleIngredients = [];

            $scope.ingredient = "";
            $scope.list = "";

            $scope.moreThanOneItem = false;
            $scope.showModal = false;
            $scope.menuHidden = false;

            $rootScope.$on('ingredientAdded', function () {
                
                $scope.ingredient = ShoppingList.addedIngredient.name;
                $scope.list = ShoppingList.addedIngredient.list;

                $scope.multipleIngredients.push($scope.ingredient);

                if ($scope.multipleIngredients.length > 1) {
                    $scope.moreThanOneItem = true;
                }

                $scope.showModal = true;

                $timeout(function () {
                    $scope.showModal = false;
                }, 3000);

                $timeout(function () {
                    $scope.multipleIngredients = [];
                    $scope.moreThanOneItem = false;
                    $scope.ingredient = "";
                    $scope.list = "";
                }, 4000);
            });
        }
    }
})


// Compare two inputs together, used to check if password and confirm password matches each other.
.directive('compareTo', function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});
