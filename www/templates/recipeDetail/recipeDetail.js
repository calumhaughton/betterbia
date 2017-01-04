// recipeDetailCtrl

angular.module('app.controllers').controller('recipeDetailCtrl', function ($scope, $log, $timeout, detailStore, ShoppingList, $ionicScrollDelegate, $ionicSlideBoxDelegate) {
    $scope.tab = 0;
    $scope.oldTab = 0;

    $scope.detailTabOpen = false;
    $scope.showDetailTab = false;
    $scope.showServingSelect = false;

    $scope.servingSize = 0;

    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        viewData.enableBack = true;

        $scope.recipeID = detailStore.getID();
        $scope.tab = 0;
        $scope.detailTabOpen = false;
        $scope.showDetailTab = false;
        $scope.ingredientsToAdd = [];
        $ionicSlideBoxDelegate.update();
        $scope.recipeID.$loaded().then(function () {
            $scope.setTopValue($scope.recipeID.title);
            $scope.servingSize = $scope.recipeID.serves;
        });
        
    });

    // Manage display of recipe.title based on how long the string is
    $scope.lines = {
        one: false,
        two: false,
        three:false
    }

    $scope.setTopValue = function (title) {
        if (title.length < 26) {
            $scope.lines.one = true;
            $scope.lines.two = false;
            $scope.lines.three = false;
        } else {
            $scope.lines.one = false;
            $scope.lines.two = true;
            $scope.lines.three = false;
        }
        // Some titles display on 3 lines, despite lower char lengths
        if (title === "Goat's Cheese, Pomegranate & Pear Salad" || title === "Paprika Pork & Mushrooms with Baby Potatoes" || title === "Moroccan Fish, Green Beans & Sweet Potato Mash" || title === "Steak with Onions, Broccoli & Sweet Potato Chips") {
            $scope.lines.one = false;
            $scope.lines.two = false;
            $scope.lines.three = true;
        }
    }
    // Change tab on swipe
    $scope.swipeSlide = function (i) {
        $scope.tab = (i + 1);
    }

    $scope.closeTabs = function () {
        console.log($scope.tab);
        if ($scope.tab > 0) {
            $scope.detailTabOpen = false;


            $timeout(function () {
                $scope.showDetailTab = false;
                $scope.tab = 0;
            }, 500);
        }
    }

    $scope.setTab = function (newValue) {
        if (newValue === $scope.tab) {
            $scope.detailTabOpen = false;
            

            $timeout(function () {
                $scope.showDetailTab = false;
                $scope.tab = 0;
            }, 500);
            

        } else {         

            $scope.tab = newValue;

            $timeout(function () {
                $scope.detailTabOpen = true;
                $scope.showDetailTab = true;
                
            }, 1);

            $timeout(function () {
                $ionicSlideBoxDelegate.slide((newValue - 1));
            }, 2);
        }
               
    };
    $scope.isSet = function (tabName) {
        return $scope.tab === tabName;
    };

    $scope.changeServing = function (action) {
        if (action === 'add') {
            $scope.servingSize++
        } else if (action === 'remove') {
            $scope.servingSize--
        }

        $scope.$broadcast('change-serving');
    }

    // Stores ingredients that have been checked on the ingredients tab
    $scope.ingredientsToAdd = [];

    // Loops through ingredientsToAdd[] and uses ShoppingList service to add
    $scope.addAllToList = function () {
        for (var i = 0; i < $scope.ingredientsToAdd.length; i++) {
            $scope.ingredientsToAdd[i].servingSize = $scope.servingSize;
            ShoppingList.addFromRecipe($scope.ingredientsToAdd[i]);
        }
    };

    $scope.addToList = function (ingredient) {
        ShoppingList.addFromRecipe(ingredient);
    };

    $scope.page = "Recipe Detail";

    // Tracks whether the page has been scrolled, and adjusts DOM accordingly
    $scope.pageScrolled = false;
    $scope.scrolled = function () {
        if ($ionicScrollDelegate.getScrollPosition().top > 0) {
            $scope.$apply(function () {
                $scope.pageScrolled = true;
            });
        } else {
            $scope.$apply(function () {
                $scope.pageScrolled = false;
            });
        }
    }

    $scope.setServingSize = function (size) {
        detailStore.setServingSize(size);
    }
});