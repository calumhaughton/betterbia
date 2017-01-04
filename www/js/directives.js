angular.module('app.directives', [])

// Relays error messages to the user throughout the login process
.directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {

            scope.$watch(function () {
                return attrs['ngSrc'];
            }, function (value) {
                if (!value) {
                    element.attr('src', attrs.errSrc);
                }
            });

            element.bind('error', function () {
                element.attr('src', attrs.errSrc);
            });
        }
    }
})


// Ingredient selector for the Recipes List
.directive('ingSelector', function ($timeout, ingTypeStore) {
    return {
        restrict: 'E',
        templateUrl: 'templates/ing-selector.html',
        controller: function ($scope) {

            // Set the selected ingredient in the Ingredient Store service
            $scope.selectIngredient = function (ingredient) {
                ingTypeStore.setType(ingredient);
                $scope.selector.ingredient = ingredient;
            }

            // Controls for transitioning between opening/closing the menu
            $scope.selector = {
                open: false,
                link: false,
                text: false,
                overlay: false,
                ingredient: 'All'
            }

            // Triggers selector object at intervals, displaying transitions for open/close
            $scope.toggleFabMenu = function () {
                if (!$scope.selector.open) {
                    $scope.selector.overlay = true;
                    StatusBar.backgroundColorByHexString("#314506");
                    $timeout(function () {
                        $scope.selector.link = true;
                    }, 150);
                    $timeout(function () {
                        $scope.selector.text = true;
                    }, 350);
                    $timeout(function () {
                        $scope.selector.open = true;
                    }, 500);
                } else {
                    $scope.selector.text = false;
                    $timeout(function () {
                        $scope.selector.link = false;
                    }, 250);
                    $timeout(function () {
                        $scope.selector.overlay = false;
                        StatusBar.backgroundColorByHexString("#5b800d");
                    }, 500);
                    $timeout(function () {
                        $scope.selector.open = false;
                    }, 600);
                }

            }
        }
    }
})

// Time selector for Recipes List
.directive('timeSelector', function ($timeout, $rootScope, timeStore) {
    return {
        restrict: 'E',
        templateUrl: 'templates/time-selector.html',
        controller: function ($scope) {

            // Set the time value in the Time Store service
            $scope.setTime = function (time) {
                timeStore.setTime(time);
                $scope.timeSelector.time = time;
            }

            // Controls for transitioning between opening/closing the menu
            $scope.timeSelector = {
                open: false,
                link: false,
                text: false,
                overlay: false,
                time: '60'
            }

            // Triggers selector object at intervals, displaying transitions for open/close
            $scope.toggleTimeMenu = function () {
                if (!$scope.timeSelector.open) {
                    $scope.timeSelector.overlay = true;
                    StatusBar.backgroundColorByHexString("#314506");
                    $timeout(function () {
                        $scope.timeSelector.link = true;
                    }, 150);
                    $timeout(function () {
                        $scope.timeSelector.text = true;
                    }, 350);
                    $timeout(function () {
                        $scope.timeSelector.open = true;
                    }, 500);
                } else {
                    $scope.timeSelector.text = false;
                    $timeout(function () {
                        $scope.timeSelector.link = false;
                    }, 250);
                    $timeout(function () {
                        $scope.timeSelector.overlay = false;
                        StatusBar.backgroundColorByHexString("#5b800d");
                    }, 500);
                    $timeout(function () {
                        $scope.timeSelector.open = false;
                    }, 600);
                }

            }
        }
    }
})

// Application top navigation bar
.directive('betterbiaNav', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/betterbia-nav.html',
        transclude: true,
        replace: true,
        scope: {
            title: '='
        },
        controller: function ($scope, $rootScope, $ionicPopover, $localStorage, $state, ShoppingList, searchStore) {

            // Show/hide the Search button at the top of the nav
            $scope.showSearch = false;
            $rootScope.$on('showSearchIcon', function () {
                $scope.showSearch = true;
            });
            $rootScope.$on('hideSearchIcon', function () {
                $scope.showSearch = false;
                $scope.filterSearchBar = false;
            });


            // Controls for the top navigation menu
            $ionicPopover.fromTemplateUrl('templates/profileMenu/profile-menu.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.popover = popover;
            });

            // Functions for the popup menu
            $scope.openPopover = function ($event) {
                $scope.popover.show($event);
                console.log('open popup');
            };
            $scope.closePopover = function () {
                $scope.popover.hide();
            };
            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.popover.remove();
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

            // Controls for the Search Bar over the Recipe List
            $scope.filterSearchBar = false;

            $scope.showFilterSearchBar = function () {
                $scope.filterSearchBar = true;
            }

            $scope.filterRecipes = function (item) {
                searchStore.setFilter(item);
                $rootScope.$broadcast('newSearchFilter');
            }

            $scope.search = {};

            $scope.clearSearchInput = function () {
                $scope.search.item = "";
                searchStore.setFilter("");
                $rootScope.$broadcast('newSearchFilter');
            }

            $scope.toggleSearchInput = function () {
                $scope.search.item = "";
                searchStore.setFilter("");
                $rootScope.$broadcast('newSearchFilter');
                $scope.filterSearchBar = !$scope.filterSearchBar;
            }

        }
    };
})

// Sliding Tabs
.directive('ionSlideTabs', ['$timeout', '$compile', '$interval', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicGesture', function ($timeout, $compile, $interval, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicGesture) {
    return {
        require: "^ionSlideBox",
        restrict: 'A',
        link: function (scope, element, attrs, parent) {

            var ionicSlideBoxDelegate;
            var ionicScrollDelegate;
            var ionicScrollDelegateID;

            var slideTabs;
            var indicator;

            var slider;
            var tabsBar;

            var options = {
                "slideTabsScrollable": true
            }


            var init = function () {

                if (angular.isDefined(attrs.slideTabsScrollable) && attrs.slideTabsScrollable === "false") {
                    options.slideTabsScrollable = false;
                }

                var tabItems = '<li ng-repeat="(key, value) in tabs" ng-click="onTabTabbed($event, {{key}})" class="slider-slide-tab" ng-bind-html="value"></li>';

                if (options.slideTabsScrollable) {

                    ionicScrollDelegateID = "ion-slide-tabs-handle-" + Math.floor((Math.random() * 10000) + 1);
                    tabsBar = angular.element('<ion-scroll delegate-handle="' + ionicScrollDelegateID + '" class="slidingTabs" direction="x" scrollbar-x="false"><ul>' + tabItems + '</ul> <div class="tab-indicator-wrapper"><div class="tab-indicator"></div></div> </ion-scroll>');

                }
                else {

                    tabsBar = angular.element('<div class="slidingTabs"><ul>' + tabItems + '</ul> <div class="tab-indicator-wrapper"><div class="tab-indicator"></div></div> </div>');

                }


                slider = angular.element(element);

                var compiled = $compile(tabsBar);
                slider.parent().prepend(tabsBar);
                compiled(scope);

                //get Tabs DOM Elements
                indicator = angular.element(tabsBar[0].querySelector(".tab-indicator"));

                //get the slideBoxHandle
                var slideHandle = slider.attr('delegate-handle');
                var scrollHandle = tabsBar.attr('delegate-handle');

                ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
                if (slideHandle) {
                    ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(slideHandle);
                }


                if (options.slideTabsScrollable) {

                    ionicScrollDelegate = $ionicScrollDelegate;
                    if (scrollHandle) {
                        ionicScrollDelegate = ionicScrollDelegate.$getByHandle(scrollHandle);
                    }

                }


                addEvents();
                setTabBarWidth();
                slideToCurrentPosition();
            };

            var addEvents = function () {

                ionic.onGesture("dragleft", scope.onSlideMove, slider[0]);
                ionic.onGesture("dragright", scope.onSlideMove, slider[0]);
                ionic.onGesture("release", scope.onSlideChange, slider[0]);

            }

            var setTabBarWidth = function () {

                if (!angular.isDefined(slideTabs) || slideTabs.length == 0) {
                    return false;
                }

                tabsList = tabsBar.find("ul");
                var tabsWidth = 0;

                angular.forEach(slideTabs, function (currentElement, index) {

                    var currentLi = angular.element(currentElement);
                    tabsWidth += currentLi[0].offsetWidth;
                });

                if (options.slideTabsScrollable) {

                    angular.element(tabsBar[0].querySelector(".scroll")).css("width", tabsWidth + 1 + "px");

                }
                else {

                    slideTabs.css("width", tabsList[0].offsetWidth / slideTabs.length + "px");
                }

                slideToCurrentPosition();

            };

            var addTabTouchAnimation = function (event, currentElement) {

                var ink = angular.element(currentElement[0].querySelector(".ink"));

                if (!angular.isDefined(ink) || ink.length == 0) {
                    ink = angular.element("<span class='ink'></span>");
                    currentElement.prepend(ink);
                }


                ink.removeClass("animate");

                if (!ink.offsetHeight && !ink.offsetWidth) {

                    d = Math.max(currentElement[0].offsetWidth, currentElement[0].offsetHeight);
                    ink.css("height", d + "px");
                    ink.css("width", d + "px");
                }

                x = event.offsetX - ink[0].offsetWidth / 2;
                y = event.offsetY - ink[0].offsetHeight / 2;


                ink.css("top", y + 'px');
                ink.css("left", x + 'px');
                ink.addClass("animate");
            }

            var slideToCurrentPosition = function () {

                if (!angular.isDefined(slideTabs) || slideTabs.length == 0) {
                    return false;
                }

                var targetSlideIndex = ionicSlideBoxDelegate.currentIndex();

                var targetTab = angular.element(slideTabs[targetSlideIndex]);
                var targetLeftOffset = targetTab.prop("offsetLeft");
                var targetWidth = targetTab[0].offsetWidth;



                indicator.css({
                    "-webkit-transition-duration": "300ms",
                    "-webkit-transform": "translate(" + targetLeftOffset + "px,0px)",
                    "width": targetWidth + "px"
                });

                if (options.slideTabsScrollable && ionicScrollDelegate) {
                    var scrollOffset = 40;
                    ionicScrollDelegate.scrollTo(targetLeftOffset - scrollOffset, 0, true);
                }

                slideTabs.removeClass("tab-active");
                targetTab.addClass("tab-active");

            }


            var setIndicatorPosition = function (currentSlideIndex, targetSlideIndex, position, slideDirection) {

                var targetTab = angular.element(slideTabs[targetSlideIndex]);

                var currentTab = angular.element(slideTabs[currentSlideIndex]);
                var targetLeftOffset = targetTab.prop("offsetLeft");

                var currentLeftOffset = currentTab.prop("offsetLeft");
                var offsetLeftDiff = Math.abs(targetLeftOffset - currentLeftOffset);


                if (currentSlideIndex == 0 && targetSlideIndex == ionicSlideBoxDelegate.slidesCount() - 1 && slideDirection == "right" ||
                    targetSlideIndex == 0 && currentSlideIndex == ionicSlideBoxDelegate.slidesCount() - 1 && slideDirection == "left") {
                    return;
                }

                var targetWidth = targetTab[0].offsetWidth;
                var currentWidth = currentTab[0].offsetWidth;
                var widthDiff = targetWidth - currentWidth;

                var indicatorPos = 0;
                var indicatorWidth = 0;

                if (currentSlideIndex > targetSlideIndex) {

                    indicatorPos = targetLeftOffset - (offsetLeftDiff * (position - 1));
                    indicatorWidth = targetWidth - ((widthDiff * (1 - position)));

                }
                else if (targetSlideIndex > currentSlideIndex) {

                    indicatorPos = targetLeftOffset + (offsetLeftDiff * (position - 1));
                    indicatorWidth = targetWidth + ((widthDiff * (position - 1)));

                }


                indicator.css({
                    "-webkit-transition-duration": "0ms",
                    "-webkit-transform": "translate(" + indicatorPos + "px,0px)",
                    "width": indicatorWidth + "px"
                });


                if (options.slideTabsScrollable && ionicScrollDelegate) {
                    var scrollOffset = 40;
                    ionicScrollDelegate.scrollTo(indicatorPos - scrollOffset, 0, false);
                }

            }

            scope.onTabTabbed = function (event, index) {
                addTabTouchAnimation(event, angular.element(event.currentTarget));
                ionicSlideBoxDelegate.slide(index);
                slideToCurrentPosition();
            }

            scope.tabs = [];

            scope.addTabContent = function ($content) {

                scope.tabs.push($content);
                scope.$apply();

                $timeout(function () {
                    slideTabs = angular.element(tabsBar[0].querySelector("ul").querySelectorAll(".slider-slide-tab"));
                    slideToCurrentPosition();
                    setTabBarWidth()
                })

            }

            scope.onSlideChange = function (slideIndex) {
                slideToCurrentPosition();
            };

            scope.onSlideMove = function () {
                var scrollDiv = slider[0].getElementsByClassName("slider-slide");

                var currentSlideIndex = ionicSlideBoxDelegate.currentIndex();
                var currentSlide = angular.element(scrollDiv[currentSlideIndex]);
                var currentSlideLeftOffset = currentSlide.css('-webkit-transform').replace(/[^0-9\-.,]/g, '').split(',')[0];

                var targetSlideIndex = (currentSlideIndex + 1) % scrollDiv.length;
                if (currentSlideLeftOffset > slider.prop("offsetLeft")) {
                    targetSlideIndex = currentSlideIndex - 1;
                    if (targetSlideIndex < 0) {
                        targetSlideIndex = scrollDiv.length - 1;
                    }
                }
                var targetSlide = angular.element(scrollDiv[targetSlideIndex]);

                var position = currentSlideLeftOffset / slider[0].offsetWidth;
                var slideDirection = position > 0 ? "right" : "left";
                position = Math.abs(position);

                setIndicatorPosition(currentSlideIndex, targetSlideIndex, position, slideDirection);
            };

            init();
        },
        controller: ['$scope', function ($scope) {
            this.addTab = function ($content) {
                $timeout(function () {
                    if ($scope.addTabContent) {
                        $scope.addTabContent($content);
                    }
                });
            }
        }]
    };
}])

.directive('ionSlideTabLabel', [function () {
    return {
        require: "^ionSlideTabs",
        link: function ($scope, $element, $attrs, $parent) {
            $parent.addTab($attrs.ionSlideTabLabel);
        }
    }
}])

// Calendar for the Profile page
.directive("calendar", function () {

    return {
        restrict: "E",
        templateUrl: "calendar-temp.html",
        scope: {
            selected:'='
        },
        controller: function ($scope, $localStorage, $firebaseObject, $rootScope) {
            $scope.accountId = $localStorage.accountId;
            $scope.calendar = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/calendar'));

            $scope.$on('getAccountDetails', function () {
                $scope.username = $localStorage.username;
                $scope.imageURL = $localStorage.imageURL;
                $scope.accountId = $localStorage.accountId;
                $scope.calendar = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/calendar'));
                $scope.calendar.$loaded().then(function () {
                    // Update the user data in the calendar once it has loaded
                    $rootScope.$broadcast('update calendar');
                    // Set the calendar to today when the data has loaded
                    var today = {
                        date: moment(),
                        isSelectable:true
                    }
                    $scope.select(today);
                    
                });
            });


            $scope.selected = _removeTime($scope.selected || moment());
            $scope.month = $scope.selected.clone();

            var start = $scope.selected.clone();
            start.date(1);
            _removeTime(start.day(0));

            _buildMonth($scope, start, $scope.month);

            // Function to select the day when it is clicked on
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

            // Go to the next month
            $scope.next = function () {
                var next = $scope.month.clone();
                _removeTime(next.month(next.month() + 1).date(1));
                $scope.month.month($scope.month.month() + 1);
                console.log(next);
                console.log($scope.month);
                    
                _buildMonth($scope, next, $scope.month);
            };

            // Go to the previous month
            $scope.previous = function () {
                var previous = $scope.month.clone();
                _removeTime(previous.month(previous.month() - 1).date(1));
                $scope.month.month($scope.month.month() - 1);
                _buildMonth($scope, previous, $scope.month);
            };

            // Add points to a user's profile, and update display + database
            $scope.recalcPoints = function (type, boolean) {
                //retrieve the selected date, and add it the database
                var date = $scope.selected._d.toString();

                var year = date.substr(11, 4);
                var month = date.substr(4, 3);
                var day = date.substr(8, 2);


                $scope.calendar.$loaded().then(function () {
                    // Add points
                    if (boolean) {
                        $scope.calendar.points += 1;
                    } else {
                        $scope.calendar.points -= 1;
                    }

                    // Check if the current date exists in the database, and if it does not, add it and set it to true/false
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
                    // Redraw the calendar with updated points
                    $rootScope.$broadcast('update calendar');
                });
            };


        }// end of controller
    };// end of Return

    // Functions to build the calendar
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

// Used on each day in the calendar to set the colour if user's have points
.directive('calendarDay', function ($localStorage, $firebaseObject, $rootScope) {
    return {
        restrict: 'EA',
        scope: {
            custom: "=",
            calendar: "="
        },
        link: function (scope, element, attrs) {
            scope.fullDay = (scope.custom.date._d).toString();

            // Extract seperate strings from the combined date
            scope.year = scope.fullDay.substr(11, 4);
            scope.month = scope.fullDay.substr(4, 3);
            scope.day = scope.fullDay.substr(8, 2);

            // Update the colour of the day depending on user's points
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
                                    element.removeClass('twoOptions');
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

// Shows and manages timer steps on the Recipe Steps workflow
.directive('timerDisplay', function ($timeout, $rootScope, scrollableTimerStore, timerDetailsStore, $ionicSlideBoxDelegate) {
    return function (scope, element, attrs) {
        scope.index = timerDetailsStore.getDetails().count;
        timerDetailsStore.addCount();

        // Onload, display standard slide
        scope.standardSlide = true;
        scope.timerSlide = false;
        scope.fixedTimer = false;
        scope.scrollTimer = false;

        // If a step has a timer, update the display
        if (scope.step.timer != 0) {
            scope.standardSlide = false;
            scope.timerSlide = true;

            if (scope.step.timer.fixedPageTimer) {
                scope.fixedTimer = true;
            } else if (scope.step.timer.scrollableTimer) {
                scope.scrollTimer = true;
            }
        }

        // Set time on the timer
        scope.currentTime = scope.step.timer.time;

        // Controls for swapping to the second image/text when a fixed timer is started
        scope.scrollTimerRunning = false;
        scope.timerRunning = false;
        scope.slideOutVanish = false;
        scope.imageVanish = false;

        scope.startFixedTimer = function (i) {
            scope.$broadcast('timer-start');
            scope.timerRunning = true;

            // Slide text out, fade image out - enter new text/image
            $timeout(function () {
                scope.slideOutVanish = true;
            }, 600);
            $timeout(function () {
                scope.imageVanish = true;
            }, 300);
        }

        // Starts a scrollableTimer by emitting an event to the scrollTimerCtrl
        scope.startScrollableTimer = function (i) {
            scope.scrollTimerRunning = true;
            scrollableTimerStore.setTime(scope.step.timer.time);
            $rootScope.$emit('start-scrollable-timer');
        }

        // Ticks down the current time so the round-progress-bar shrinks
        scope.$on('timer-tick', function (event, args) {
            $timeout(function () {
                scope.currentTime -= 1;
            });
        });

        $rootScope.$on('begin-timer', function (event, args) {
            var details = timerDetailsStore.getDetails();

            if (scope.index === details.index) {
                if (details.timerType === "fixed") {
                    scope.startFixedTimer(scope.index);
                } else if (details.timerType === 'scroll') {
                    scope.startScrollableTimer(scope.index);
                }
            }
        });

        $rootScope.$on('timer-reset', function () {
            timerDetailsStore.resetCount();
        });
    }
})


// Calculate the number of ingredients on the shopping list to show a counter on the listHome page
.directive('ingredientCounter', function () {
    return function (scope, element, attrs) {
        if ('ingredients' in scope.list) {
            scope.listIngs = scope.list.ingredients;
            scope.listLength = Object.keys(scope.listIngs).length;
        } else {
            scope.listLength = "0";
        }
    }
})



// Sort through the ingredients on the recipe detail and shopping list pages, and alters display based on each ingredient
.directive('ingredientDisplay', function () {
    return function (scope, element, attrs) {
        // Set whether measurements should be displayed
        scope.measureDisplay = true;
        scope.checkboxFilled = true;

        // If an ingredient is a 'Main', preselect the checkbox
        if (scope.ingredient.main === true) {
            scope.checkboxFilled = true;
            scope.ingredientsToAdd.push(angular.copy(scope.ingredient));
        } else {
            scope.checkboxFilled = false; 
        }

        if (scope.ingredient.measure === "") {
            scope.measureDisplay = false;
        } else {
            scope.measureDisplay = true;
        }


        // add/remove an ingredient from/to the ingredientsToAdd array when a user toggles a checkbox
        scope.addRemoveIng = function () {
            if (scope.checkboxFilled === false) {
                scope.checkboxFilled = true;
                scope.ingredientsToAdd.push(angular.copy(scope.ingredient));
            } else if (scope.checkboxFilled === true) {
                scope.checkboxFilled = false;
                
                for (var i = 0; i < scope.ingredientsToAdd.length; i++) {
                    if (scope.ingredient.name === scope.ingredientsToAdd[i].name) {
                        scope.ingredientsToAdd.splice(i, 1);
                    }
                }   
            }
        }

        // if the quantity is larger than 1, add an 's' to the measure
        if ((scope.ingredient.quantity * scope.servingSize) > 1) {
            if (scope.ingredient.measure !== "ml" && scope.ingredient.measure !== "" && scope.ingredient.measure !== "g") {
                var lastLetter = scope.ingredient.measure.slice(-1);
                if (lastLetter !== "s") {
                    scope.ingredient.measure = scope.ingredient.measure + "s";
                }
            }
        }

        // When serving size changes, adjust display of quantities to singular/plurals
        scope.$on('change-serving', function () {
            if ((scope.ingredient.quantity * scope.servingSize) > 1) {
                if (scope.ingredient.measure !== "ml" && scope.ingredient.measure !== "" && scope.ingredient.measure !== "g") {
                    var lastLetter = scope.ingredient.measure.slice(-1);
                    if (lastLetter !== "s") {
                        scope.ingredient.measure = scope.ingredient.measure + "s";
                    }
                }
            } else {
                var lastLetter = scope.ingredient.measure.slice(-1);
                if (lastLetter === "s") {
                    var length = scope.ingredient.measure.length;
                    var sliced = scope.ingredient.measure.slice(0, (length - 1));
                    scope.ingredient.measure = sliced;
                }
            }
        })
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

// allows button on the Recipe Detail page to flash green for 3 seconds when clicked
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

// Preselects the default list in the ing-added-modal
.directive('checkDefault', function($firebaseObject, $localStorage, $compile) {
    return {
        restrict:'A',
        scope:{
            list:'@'
        },
        link: function (scope, element, attrs) {
            scope.defaultList = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/defaultList/name'));

            scope.defaultList.$loaded().then(function () {
                if (scope.defaultList.$value === scope.list) {
                    element.attr('checked', 'checked');
                    $compile(element);
                } else {
                    
                }
            });
        }
    }

})

// Controls the animation for when an item leaves the shopping list
.directive('listExitAnimation', function ($timeout) {
    return function (scope, element, attrs) {
        scope.trash;

        if (scope.ingredient.checked) {
            scope.trash = true;
        } else {
            scope.trash = false;
        }

        // Function to add item to the trash list
        scope.setTrash = function () {
            scope.trash = !scope.trash;
            $timeout(function () {
                scope.ingredient.checked = !scope.ingredient.checked;
                scope.items.$save(scope.ingredient);
            }, 500);
        }
    }
})

// Popup that displays on screen when ingredients are added from Recipe Detail page to a shopping list
.directive("ingAddedModal", function ($rootScope, $timeout, ShoppingList) {
    return {
        restrict: "E",
        templateUrl: "templates/modals/ing-added-modal.html",
        replace: true,
        transclude: true,
        controller: function ($rootScope, $scope, $timeout, ShoppingList, $firebaseObject, $localStorage) {
            var hideModalProm;
            var clearDataProm;
            var addItemsProm;

            // Get shopping lists from personal and shared lists, and combine them into a single array
            $scope.myLists = ShoppingList.lists();
            $scope.sharedLists = ShoppingList.sharedLists();
            $scope.myLists.$loaded().then(function () {
                $scope.lists = Object.keys($scope.myLists).concat(Object.keys($scope.sharedLists));
            });

            // Stores ingredients to be added
            $scope.multipleIngredients = [];

            // Controls display of different onscreen mechanisms
            $scope.ingredient = "";
            $scope.chosenList = "";
            $scope.timeoutRunning = false;

            $scope.moreThanOneItem = false;
            $scope.showModal = false;
            $scope.menuHidden = false;
            $scope.updateList = false;
            $scope.addedToList = false;

            // If a user changes list, cancel timeouts so they can choose which list to add to
            $scope.changeList = function () {
                $scope.updateList = true;
                $timeout.cancel(hideModalProm);
                $timeout.cancel(clearDataProm);
                $timeout.cancel(addItemsProm);
            }

            $scope.hideModal = function () {
                $scope.showModal = false;
                $scope.timeoutRunning = false;
            }

            $scope.clearModalData = function () {
                $scope.multipleIngredients = [];
                $scope.moreThanOneItem = false;
                $scope.ingredient = "";
                $scope.chosenList = "";
                $scope.timeoutRunning = false;
                $scope.updateList = false;
                $scope.addedToList = false;
            }

            // Sets the default list, so when users add ingredients again they will go to this list
            $scope.setDefaultList = function (boolean) {
                if (boolean) {

                    var listLocation = ShoppingList.checkListLocation($scope.chosenList).then(function(data) {

                        var defaultList = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/defaultList'));

                        defaultList.$loaded().then(function () {
                            defaultList.group = data;
                            defaultList.name = $scope.chosenList;
                            defaultList.$save();
                        });

                    });     

                }
            }

            // Adds ingredients to a chosen list after a user has input the new list via radio btn
            $scope.addIngtoList = function () {
                for (var i = 0; i < $scope.multipleIngredients.length; i++) {
                    ShoppingList.addToList($scope.multipleIngredients[i], $scope.chosenList);
                }
                $scope.updateList = false;
                $scope.addedToList = true;

                $timeout(function () {
                    $scope.hideModal();
                }, 2000);
                $timeout(function () {
                    $scope.clearModalData();
                }, 3000);
            }

            $scope.setChosenList = function (list) {
                $scope.chosenList = list;
            }

            // Adds an ingredient to default list with the ShoppingList service, allowing user to interrupt and change list
            $scope.ingAddedEvent = function () {
                $scope.ingredient = ShoppingList.addedIngredient;
                $scope.chosenList = ShoppingList.addedIngredient.list;

                $scope.multipleIngredients.push($scope.ingredient);

                if ($scope.multipleIngredients.length > 1) {
                    $scope.moreThanOneItem = true;
                }

                $scope.showModal = true;

                if ($scope.timeoutRunning === false) {
                    $scope.timeoutRunning = true;
                    hideModalProm = $timeout($scope.hideModal, 5000);
                    clearDataProm = $timeout($scope.clearModalData, 6000);
                    addItemsProm = $timeout(function () {
                        for (var i = 0; i < $scope.multipleIngredients.length; i++) {
                            ShoppingList.addToList($scope.multipleIngredients[i], $scope.chosenList);
                        }
                        $scope.addedToList = true;
                    }, 3000);
                } else {
                    // When adding multiple ingredients, cancel running timeouts so there are no overlaps and timeouts can be interrupted
                    $timeout.cancel(addItemsProm);
                    $timeout.cancel(hideModalProm);
                    $timeout.cancel(clearDataProm);
                    hideModalProm = $timeout($scope.hideModal, 5000);
                    clearDataProm = $timeout($scope.clearModalData, 6000);
                    addItemsProm = $timeout(function () {
                        for (var i = 0; i < $scope.multipleIngredients.length; i++) {
                            ShoppingList.addToList($scope.multipleIngredients[i], $scope.chosenList);
                        }
                        $scope.addedToList = true;
                    }, 3000);
                }

            }

            // Listens for a $broadcast from the ShoppingList service, telling function to add ingredients
            $scope.$on('ingredientAdded', $scope.ingAddedEvent);

        }
    }
})

// Compare two inputs and make sure they match, used to check if password and confirm password matches each other.
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
})

// Manages editing items on the shopping list, broadcasting events to hide/show low opacity cover layer
.directive('editListItem', function ($rootScope, $timeout) {
    return function (scope, element, attrs) {
        scope.editingThisItem = false;

        scope.editing = function () {
            scope.editingThisItem = true;
            $rootScope.$broadcast('editingItem');
        }

        scope.doneEditing = function () {
            scope.editingThisItem = false;

            $timeout(function () {
                scope.items.$save(scope.ingredient);
            }, 500);
            
            $rootScope.$broadcast('doneEditingItem');
        }
    }
})

// Autofocus on an input element, used mostly in popups with input elements
.directive('focusMe', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            $timeout(function () {
                element[0].focus();
            }, 150);
        }
    };
})

;