// recipeStepsCtrl

angular.module('app.controllers').controller('scrollTimerCtrl', function ($scope, $timeout, $rootScope, scrollableTimerStore) {
    $scope.displayScrollableTimer = false;

    $scope.scrollTime = {
        max: 0,
        current: 0
    }

    $scope.timeUp = false;

    $rootScope.$on('start-scrollable-timer', function () {
        $scope.scrollTime.max = scrollableTimerStore.getTime();
        $scope.scrollTime.current = scrollableTimerStore.getTime();
        $scope.displayScrollableTimer = true;
        $timeout(function () {
            console.log('start timer!');
            $scope.$broadcast('timer-start');
        }, 1000);
    });

    $scope.scrollTimerUp = function () {
        $scope.timeUp = true;
        $timeout(function () {
            $scope.displayScrollableTimer = false;
            $scope.timeUp = false;
        }, 5000);

        //var alarm = new Media('/android_asset/www/sounds/alarm.mp3',
        //    function () {
        //        console.log('Play');
        //    }, function (err) {
        //        console.log(err);
        //    });
        //alarm.play();
        //navigator.vibrate([500, 500, 500, 500, 500, 500, 500, 500, 500, 500]);
    }


    $scope.$on('timer-tick', function (event, args) {
        $timeout(function () {
            $scope.scrollTime.current -= 1;
        });
    });
});

angular.module('app.controllers').controller('recipeStepsCtrl', function ($scope, $log, $timeout, $ionicSlideBoxDelegate, $document, detailStore, scrollableTimerStore) {
    $scope.steps = {};
    $scope.recipeData = {};
    $scope.ingredients = [];

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        viewData.enableBack = true;
        $scope.steps = detailStore.getSteps();
        $scope.recipeData = detailStore.getID();
        $scope.recipeData.$loaded().then(function () {
            $scope.ingredients = $scope.recipeData.ingredients;
        });

        $scope.steps.$loaded().then(function () {
            $ionicSlideBoxDelegate.update();
            $ionicSlideBoxDelegate.slide(0);
            $scope.buttonStatus = {
                "prev": false,
                "next": true,
                "done": false
            };
        });
    });

    $scope.buttonStatus = {
        "prev": false,
        "next": true,
        "done": false
    };

    $scope.slideChange = function (index) {
        // update what buttons are displayed on the page
        if (index === 0) {
            $scope.buttonStatus.prev = false;
        } else if (Object.keys($scope.steps).length === (index + 4) && index > 0) {
            $scope.buttonStatus.prev = false;
            $scope.buttonStatus.next = false;
            $scope.buttonStatus.done = true;
        } else if (Object.keys($scope.steps).length > index && index > 0) {
            $scope.buttonStatus.prev = true;
            $scope.buttonStatus.next = true;
            $scope.buttonStatus.done = false;
        }

        // if a timer is displayed, remove the next and previous buttons
        $scope.stepTimerArray = "";
        // check if the step# is below 10
        if (index < 9) {
            $scope.stepTimerArray = $scope.steps["step0" + (index + 1)].timer;
        } else {
            $scope.stepTimerArray = $scope.steps["step" + (index + 1)].timer;
        }

        if (Array.isArray($scope.stepTimerArray)) {
            if ($scope.stepTimerArray[0] <= 1) {
                $scope.buttonStatus.prev = false;
                $scope.buttonStatus.next = false;
            }
        }

        if ($scope.stepTimerArray == Object($scope.stepTimerArray)) {
            if ($scope.stepTimerArray.fixedPageTimer) {
                $scope.buttonStatus.prev = false;
                $scope.buttonStatus.next = false;
            } else if ($scope.stepTimerArray.scrollableTimer) {
                $scope.buttonStatus.prev = true;
                $scope.buttonStatus.next = false;
            }
               
        }

        // update the slider when the slide changes
        var slides = $ionicSlideBoxDelegate.slidesCount();
        var increment = $document[0].getElementsByClassName('increment');
        increment[0].style.width = (1 + 19 * index / (slides - 1)) * 5 + '%';

        // if a timer has finished, reset so that the flash animations are removed
        if ($scope.timeUp) {
            $scope.timeUp = false;
        }
    };

    $scope.next = function () {
        $ionicSlideBoxDelegate.next();
    };

    $scope.previous = function () {
        $ionicSlideBoxDelegate.previous();
    };

    $scope.timeUp = false;

    $scope.timerUp = function (index) {
        $scope.timeUp = true;
        $timeout(function () {
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
        });
        //var alarm = new Media('/android_asset/www/sounds/alarm.mp3',
        //    function () {
        //        console.log('Play');
        //    }, function (err) {
        //        console.log(err);
        //    });
        //alarm.play();
        //navigator.vibrate([500, 500, 500, 500, 500, 500, 500, 500, 500, 500]);
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