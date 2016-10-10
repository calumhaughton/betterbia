angular.module('app.directives', [])


//ingredient selector directive

.directive('ingSelector', function ($timeout, ingTypeStore) {
    return {
        restrict: 'E',
        templateUrl: 'templates/ing-selector.html',
        controller: function ($scope) {
            
            $scope.selectIngredient = function (ingredient) {
                ingTypeStore.setType(ingredient);
                $scope.selector.ingredient = ingredient;
            }

            $scope.selector = {
                open:false,
                link: false,
                text: false,
                overlay: false,
                ingredient: 'All'
            }

            $scope.toggleFabMenu = function () {
                if (!$scope.selector.open) {
                    $scope.selector.overlay = true;
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
                    }, 500);
                    $timeout(function () {
                        $scope.selector.open = false;
                    }, 600);
                }
                
            }
        }
    }
})

//ingredient selector directive

.directive('timeSelector', function ($timeout, $rootScope, timeStore) {
    return {
        restrict: 'E',
        templateUrl: 'templates/time-selector.html',
        controller: function ($scope) {
            $scope.setTime = function (time) {
                timeStore.setTime(time);
                $scope.timeSelector.time = time;
            }

            $scope.timeSelector = {
                open:false,
                link: false,
                text: false,
                overlay: false,
                time: '60'
            }

            $scope.toggleTimeMenu = function () {
                if (!$scope.timeSelector.open) {
                    $scope.timeSelector.overlay = true;
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
                    }, 500);
                    $timeout(function () {
                        $scope.timeSelector.open = false;
                    }, 600);
                }
                
            }
        }
    }
})

// navbar directive 
.directive('betterbiaNav', function () {
    return {
        restrict: 'E',
        template: '<div class="app-header"> \n\
                        <h5 style="font-size:18px;color:white;margin:8px;display:inline-block">{{title}}</h5> \n\
                        <a class="waves-effect waves-light waves-circle right"><i class="material-icons" style="margin-top:5px;color:white;">more_vert</i></a> \n\
                        <a class="waves-effect waves-light waves-circle right search-icon-transition" ng-show="showSearch"><i class="material-icons" style="margin-top:5px;color:white;">search</i></a> \n\
                    </div>',
        transclude: true,
        replace:true,
        scope: {
            title: '='
        },
        controller: function ($scope, $rootScope) {
            $scope.showSearch = false;
            $rootScope.$on('showSearchIcon', function () {
                $scope.showSearch = true;
            });
            $rootScope.$on('hideSearchIcon', function () {
                $scope.showSearch = false;
            });
        }
    };
})

// sliding tabs directive
.directive('ionSlideTabs', ['$timeout', '$compile', '$interval', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicGesture', function($timeout, $compile, $interval, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicGesture) {
    return {
        require: "^ionSlideBox",
        restrict: 'A',
        link: function(scope, element, attrs, parent) {

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

                if(angular.isDefined( attrs.slideTabsScrollable ) && attrs.slideTabsScrollable === "false" ) {
                    options.slideTabsScrollable = false;
                }

                var tabItems = '<li ng-repeat="(key, value) in tabs" ng-click="onTabTabbed($event, {{key}})" class="slider-slide-tab" ng-bind-html="value"></li>';

                if(options.slideTabsScrollable) {

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


                if(options.slideTabsScrollable) {

                    ionicScrollDelegate = $ionicScrollDelegate;
                    if (scrollHandle) {
                        ionicScrollDelegate = ionicScrollDelegate.$getByHandle(scrollHandle);
                    }

                }


                addEvents();
                setTabBarWidth();
                slideToCurrentPosition();
            };

            var addEvents = function() {

                ionic.onGesture("dragleft", scope.onSlideMove ,slider[0]);
                ionic.onGesture("dragright", scope.onSlideMove ,slider[0]);
                ionic.onGesture("release", scope.onSlideChange ,slider[0]);

            }

            var setTabBarWidth = function() {

                if( !angular.isDefined(slideTabs) || slideTabs.length == 0 ) {
                    return false;
                }

                tabsList = tabsBar.find("ul");
                var tabsWidth = 0;

                angular.forEach(slideTabs, function (currentElement,index) {

                    var currentLi = angular.element(currentElement);
                    tabsWidth += currentLi[0].offsetWidth;
                });

                if(options.slideTabsScrollable) {

                    angular.element(tabsBar[0].querySelector(".scroll")).css("width", tabsWidth + 1 + "px");

                }
                else {

                    slideTabs.css("width",tabsList[0].offsetWidth / slideTabs.length + "px");
                }

                slideToCurrentPosition();

            };

            var addTabTouchAnimation = function(event,currentElement) {

                var ink = angular.element(currentElement[0].querySelector(".ink"));

                if( !angular.isDefined(ink) || ink.length == 0 ) {
                    ink = angular.element("<span class='ink'></span>");
                    currentElement.prepend(ink);
                }


                ink.removeClass("animate");

                if(!ink.offsetHeight && !ink.offsetWidth)
                {

                    d = Math.max(currentElement[0].offsetWidth, currentElement[0].offsetHeight);
                    ink.css("height", d + "px");
                    ink.css("width", d + "px");
                }

                x = event.offsetX - ink[0].offsetWidth / 2;
                y = event.offsetY - ink[0].offsetHeight / 2;


                ink.css("top", y +'px');
                ink.css("left", x +'px');
                ink.addClass("animate");
            }

            var slideToCurrentPosition = function() {

                if( !angular.isDefined(slideTabs) || slideTabs.length == 0 ) {
                    return false;
                }

                var targetSlideIndex = ionicSlideBoxDelegate.currentIndex();

                var targetTab = angular.element(slideTabs[targetSlideIndex]);
                var targetLeftOffset = targetTab.prop("offsetLeft");
                var targetWidth = targetTab[0].offsetWidth;



                indicator.css({
                    "-webkit-transition-duration": "300ms",
                    "-webkit-transform":"translate(" + targetLeftOffset + "px,0px)",
                    "width": targetWidth + "px"
                });

                if (options.slideTabsScrollable && ionicScrollDelegate) {
                    var scrollOffset = 40;
                    ionicScrollDelegate.scrollTo(targetLeftOffset - scrollOffset,0,true);
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


                if( currentSlideIndex == 0 && targetSlideIndex == ionicSlideBoxDelegate.slidesCount() - 1 && slideDirection == "right" ||
                    targetSlideIndex == 0 && currentSlideIndex == ionicSlideBoxDelegate.slidesCount() - 1 && slideDirection == "left" ) {
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
                    "-webkit-transition-duration":"0ms",
                    "-webkit-transform":"translate(" + indicatorPos + "px,0px)",
                    "width": indicatorWidth + "px"
                });


                if (options.slideTabsScrollable && ionicScrollDelegate) {
                    var scrollOffset = 40;
                    ionicScrollDelegate.scrollTo(indicatorPos - scrollOffset,0,false);
                }

            }

            scope.onTabTabbed = function(event, index) {
                addTabTouchAnimation(event, angular.element(event.currentTarget) );
                ionicSlideBoxDelegate.slide(index);
                slideToCurrentPosition();
            }

            scope.tabs = [];

            scope.addTabContent = function ($content) {

                scope.tabs.push($content);
                scope.$apply();

                $timeout(function() {
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
                var slideDirection = position > 0 ? "right":"left";
                position = Math.abs(position);

                setIndicatorPosition(currentSlideIndex, targetSlideIndex, position, slideDirection);
            };

            init();
        },
        controller: ['$scope',function($scope) {
            this.addTab = function($content) {
                $timeout(function() {
                    if($scope.addTabContent) {
                        $scope.addTabContent($content);
                    }
                });
            }
        }]
    };
}])

.directive('ionSlideTabLabel', [ function() {
    return {
        require: "^ionSlideTabs",
        link: function ($scope, $element, $attrs, $parent) {
            $parent.addTab($attrs.ionSlideTabLabel);
        }
    }
}])

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
.directive('timerDisplay', function ($timeout, $rootScope, scrollableTimerStore) {
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
            scope.$broadcast('timer-start');
            scope.timerRunning = true;

            $timeout(function () {
                scope.slideOutVanish = true;
            }, 600);
            $timeout(function () {
                scope.imageVanish = true;
            }, 300);
        }

        scope.startScrollableTimer = function (i) {
            scrollableTimerStore.setTime(scope.step.timer.time);
            $rootScope.$emit('start-scrollable-timer');
        }

        scope.$on('timer-tick', function (event, args) {
            $timeout(function () {
                scope.currentTime -= 1;
            });
        });

    }
})


// calculate the number of ingredients on the shopping list to show a counter on the listHome page
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

// calculate the number of ingredients for a shared shopping list on the listHome page
.directive('ingredientCounterSharedlist', function ($firebaseObject) {
    return function (scope, element, attrs) {
        scope.fullSharedList = $firebaseObject(firebase.database().ref('accounts/' + scope.sharedList.accountId + '/shoppingList/myLists/' + scope.sharedList.name));
        scope.fullSharedList.$loaded().then(function () {
            if ('ingredients' in scope.fullSharedList) {
                scope.listIngs = scope.fullSharedList.ingredients;
                scope.listLength = Object.keys(scope.listIngs).length;
            } else {
                scope.listLength = "0";
            }
        })
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

    // controls the animation for when an item leaves the shopping list

.directive('listExitAnimation', function ($timeout) {
    return function (scope, element, attrs) {
        scope.trash;

        if (scope.ingredient.checked) {
            scope.trash = true;
        } else {
            scope.trash = false;
        }
        
        scope.setTrash = function () {
            $timeout(function () {
                scope.ingredient.checked = !scope.ingredient.checked;
                scope.items.$save(scope.ingredient);
            }, 500);            
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
        templateUrl: "templates/modals/ing-added-modal.html",
        replace: true,
        transclude:true,
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

.directive("ingAddedDetailModal", function () {
    return {
        restrict: "E",
        templateUrl: "templates/modals/ing-added-detail-modal.html",
        replace: true,
        transclude: true,
        link: function ($scope) {
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
