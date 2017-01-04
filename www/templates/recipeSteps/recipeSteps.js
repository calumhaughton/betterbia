// Manages and controls any scrollable timers
angular.module('app.controllers').controller('scrollTimerCtrl', function ($ionicPlatform, $interval, $scope, $timeout, $rootScope, scrollableTimerStore, $cordovaLocalNotification) {
    $scope.displayScrollableTimer = false;

    $scope.scrollTime = {
        max: 0,
        current: 0
    }

    $scope.timeUp = false;

    // Start the timer
    $rootScope.$on('start-scrollable-timer', function () {
        $scope.scrollTime.max = scrollableTimerStore.getTime();
        $scope.scrollTime.current = scrollableTimerStore.getTime();
        $scope.displayScrollableTimer = true;
        $timeout(function () {
            $scope.$broadcast('timer-start');
        }, 1000);
    });

    $scope.buttonStore = {};

    // Cancels the timer alarm from beeping
    $scope.stopAlarm = function () {
        if ($scope.alarm != null) {
            $interval.cancel($scope.vibrationInterval);
            $scope.alarm.stop();
            $scope.alarm.release();

            $cordovaLocalNotification.clear(1);
        }
    }

    // Function to call when timer hits 0:00
    $scope.scrollTimerUp = function () {
        $scope.timeUp = true;

        $scope.buttonStore.prev = $scope.$parent.buttonStatus.prev;
        $scope.buttonStore.next = $scope.$parent.buttonStatus.next;
        $scope.buttonStore.timer = $scope.$parent.buttonStatus.timer;

        $scope.$parent.buttonStatus.prev = false;
        $scope.$parent.buttonStatus.next = false;
        $scope.$parent.buttonStatus.timer = false;

        $timeout(function () {
            $cordovaLocalNotification.schedule({
                id: 1,
                title: "betterbia",
                text: "Time's up! On to the next step...",
                icon: 'res://icon',
                smallIcon: 'res://icon_trans',
                sound:''
            });
        }, 0);

        $scope.alarm = new Media('/android_asset/www/sounds/alarm.wav',
            function () {
                console.log('play');
            }, function (err) {
                console.log(err);
            });

        $scope.alarm.play();

        navigator.vibrate([500, 500]);

        $scope.vibrationInterval = $interval(function () {
            navigator.vibrate([500, 500]);
        }, 1000, 30);
    }

    // If a push notification is clicked, cancel the alarm
    $ionicPlatform.ready(function () {
        $rootScope.$on('$cordovaLocalNotification:click', function (event, notification, state) {
            if ($scope.alarm != null) {
                $interval.cancel($scope.vibrationInterval);
                $scope.alarm.stop();
                $scope.alarm.release();
                $cordovaLocalNotification.clear(1);
            }
        });
    })

    // When step is complete, returns the user to the regular steps
    $scope.scrollStepDone = function () {
        if ($scope.alarm != null) {
            $interval.cancel($scope.vibrationInterval);
            $scope.alarm.stop();
            $scope.alarm.release();

            $cordovaLocalNotification.clear(1);
        }

        $scope.displayScrollableTimer = false;
        $scope.timeUp = false;

        $scope.$parent.buttonStatus.prev = $scope.buttonStore.prev;
        $scope.$parent.buttonStatus.next = $scope.buttonStore.next;
        $scope.$parent.buttonStatus.timer = $scope.buttonStore.timer;
    }

    $scope.$on('timer-tick', function (event, args) {
        $timeout(function () {
            $scope.scrollTime.current -= 1;
        });
    });
});

// Recipe Steps Controller
angular.module('app.controllers').controller('recipeStepsCtrl', function ($state, $ionicPopup, $ionicPlatform, $interval, $cordovaLocalNotification, $scope, $rootScope, $log, $timeout, $ionicSlideBoxDelegate, $ionicNativeTransitions, $document, detailStore, scrollableTimerStore, timerDetailsStore) {
    $scope.steps = {};
    $scope.allSteps = {};
    $scope.recipeData = {};
    $scope.ingredients = [];
    $scope.cooking = false;
    $scope.ingredientsToAdd = [];

    $scope.scrollTimerExists = "";

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        viewData.enableBack = true;

        // Load recipe steps data
        $scope.ingredientsToAdd = [];
        $scope.cooking = true;
        $scope.allSteps = detailStore.getSteps();
        $scope.recipeData = detailStore.getID();
        $scope.servingSize = detailStore.getServingSize();
        $scope.recipeData.$loaded().then(function () {
            $scope.ingredients = $scope.recipeData.ingredients;
        });

        // When loaded, update the slidebox with the new slides
        $scope.allSteps.$loaded().then(function () {
            $scope.steps = $scope.allSteps.steps;
            $scope.scrollStep = $scope.allSteps.scrollTimerUp;

            if ($scope.scrollStep === false) {
                $scope.scrollTimerExists = false;
            } else {
                $scope.scrollTimerExists = true;
            }

            $ionicSlideBoxDelegate.update();
            $ionicSlideBoxDelegate.slide(0);
            $scope.buttonStatus = {
                "prev": false,
                "next": true,
                "done": false,
                "timer": false
            };
            // Update buttons to show timer button if there is one to display
            $scope.stepTimer = $scope.steps.step01.timer;
            
            // Sets the type of timer to be displayed
            if ($scope.stepTimer != 0) {
                if ($scope.stepTimer.fixedPageTimer) {
                    timerDetailsStore.setDetails('fixed', 0);
                } else if ($scope.stepTimer.scrollableTimer) {
                    timerDetailsStore.setDetails('scroll', 0);
                }
                $scope.buttonStatus.timer = true;
                $scope.buttonStatus.prev = false;
                $scope.buttonStatus.next = false;

            } else if ($scope.stepTimer === 0) {
                $scope.buttonStatus.timer = false;

                timerDetailsStore.setDetails('none', 0);
            }
        });
    });

    // Manages which buttons should display at the bottom of the page
    $scope.buttonStatus = {
        "prev": false,
        "next": true,
        "done": false,
        "timer": false
    };

    $scope.timerRunning = false;

    // Called on slide change, updates the DOM with relevant UI components/buttons
    $scope.slideChange = function (index) {
        // update what buttons are displayed on the page
        if (index === 0) {
            $scope.buttonStatus.prev = false;
            $scope.buttonStatus.next = true;
        } else if (Object.keys($scope.steps).length === (index + 1) && index > 0) {
            $scope.buttonStatus.prev = false;
            $scope.buttonStatus.next = false;
            $scope.buttonStatus.done = true;
 
        } else if (Object.keys($scope.steps).length > index && index > 0) {
            $scope.buttonStatus.prev = true;
            $scope.buttonStatus.next = true;
            $scope.buttonStatus.done = false;
        }

        // Update buttons to show timer button if there is one to display
        $scope.stepTimer = "";
        // check if the step# is below 10
        if (index < 9) {
            $scope.stepTimer = $scope.steps["step0" + (index + 1)].timer;
        } else {
            $scope.stepTimer = $scope.steps["step" + (index + 1)].timer;
        }

        // Sets the type of timer to be displayed
        console.log($scope.timerRunning);
        if ($scope.stepTimer !== 0) {
            
            if (!$scope.timerRunning) {
                if ($scope.stepTimer.fixedPageTimer) {
                    timerDetailsStore.setDetails('fixed', index);
                } else if ($scope.stepTimer.scrollableTimer) {
                    timerDetailsStore.setDetails('scroll', index);
                }
                $scope.buttonStatus.timer = true;
                $scope.buttonStatus.prev = true;
                $scope.buttonStatus.next = false;
            } else {
                $scope.buttonStatus.timer = false;
                $scope.buttonStatus.prev = true;
                $scope.buttonStatus.next = false;
            }
            

        } else if ($scope.stepTimer === 0) {
            $scope.buttonStatus.timer = false;

            timerDetailsStore.setDetails('none', index);
        }

        // update the progress bar when the slide changes
        var slides = $ionicSlideBoxDelegate.slidesCount();
        var increment = $document[0].getElementsByClassName('increment');
        increment[0].style.width = (1 + 19 * index / (slides - 1)) * 5 + '%';

        // if a timer has finished, reset so that the flash animations are removed
        if ($scope.timeUp) {
            $scope.timeUp = false;
        }
    };
    
    // starts a timer
    $scope.startTimer = function () {
        var timerDetails = timerDetailsStore.getDetails();

        if (timerDetails.timerType === 'fixed') {
            $scope.timerRunning = true;
        }

        $scope.buttonStatus.timer = false;
        $rootScope.$broadcast('begin-timer');

        if (timerDetails.timerType === 'scroll') {
            $scope.next();
        }
    };

    // Go to the next step
    $scope.next = function () {
        $ionicSlideBoxDelegate.next();

        // Cancel an alarm if there is one playing

        if ($scope.alarm != null) {
            $interval.cancel($scope.vibrationInterval);
            $scope.alarm.stop();
            $scope.alarm.release();
            $cordovaLocalNotification.clear(1);
        }
    };

    // Go to the previous step
    $scope.previous = function () {
        $ionicSlideBoxDelegate.previous();
    };

    $scope.timeUp = false;

    $scope.alarm;

    // Function called when timer hits 0:00
    $scope.timerUp = function (index) {

        $timeout(function () {
            $scope.timerRunning = false;

            $scope.timeUp = true;

            if (index === 0) {
                $scope.buttonStatus.prev = false;
            } else if (Object.keys($scope.steps).length === (index + 4) && index > 0) {
                $scope.buttonStatus.next = false;
                $scope.buttonStatus.done = true;
            } else if (Object.keys($scope.steps).length > index && index > 0) {
                $scope.buttonStatus.prev = true;
                $scope.buttonStatus.next = true;
                $scope.buttonStatus.done = false;
            }
        }, 0);

        // Send a push notification to the user
        $timeout(function () {
            $cordovaLocalNotification.schedule({
                id: 1,
                title: "betterbia",
                text: "Time's up! On to the next step...",
                icon: 'res://icon',
                smallIcon:'res://icon_trans',
                sound:''
            });
        }, 0);

        // Start playing the alarm sound
        $scope.alarm = new Media('/android_asset/www/sounds/alarm.wav',
            function () {
                console.log('play');
            }, function (err) {
                console.log(err);
            });

        $scope.alarm.play();

        navigator.vibrate([500, 500]);

        $scope.vibrationInterval = $interval(function () {
            navigator.vibrate([500, 500]);
        }, 1000, 30);

    }

    // When a push notification is tapped, cancel the alarm
    $ionicPlatform.ready(function () {
        $rootScope.$on('$cordovaLocalNotification:click', function (event, notification, state) {
            if ($scope.alarm != null) {
                $interval.cancel($scope.vibrationInterval);
                $scope.alarm.stop();
                $scope.alarm.release();
                $cordovaLocalNotification.clear(1);
            }
        });
    })

    // When a user exits the step by step process, reset the steps
    $scope.resetSteps = function () {
        if ($scope.timerRunning) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Exit the Recipe',
                template: 'Leaving this recipe will cancel the running timer. Are you sure you want to exit?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $ionicSlideBoxDelegate.slide(0);
                    $rootScope.$broadcast('timer-reset');
                    $scope.cooking = false;
                    $scope.steps = {};
                    $scope.allSteps = {};
                    $scope.recipeData = {};
                    $scope.ingredients = [];
                    $scope.timerRunning = false;
                    $ionicNativeTransitions.stateGo('recipeDetail', {}, {}, {
                        "type": "slide",
                        "direction": "right",
                        "duration": 300
                    });
                } else {
                    
                }
            });
        } else {
            $ionicSlideBoxDelegate.slide(0);
            $rootScope.$broadcast('timer-reset');
            $scope.cooking = false;
            $scope.steps = {};
            $scope.allSteps = {};
            $scope.recipeData = {};
            $scope.ingredients = [];
            $scope.timerRunning = false;
            $ionicNativeTransitions.stateGo('recipeDetail', {}, {}, {
                "type": "slide",
                "direction": "right",
                "duration": 300
            });
        }
    }

    // Sliding menu controls

    $scope.rightVisible = false;

    $scope.close = function () {
        $scope.rightVisible = false;
    }

    $scope.showRight = function () {
        $scope.rightVisible = true;
    }
});