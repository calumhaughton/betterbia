// recipeDetailCtrl

angular.module('app.controllers').controller('recipeDetailCtrl', function ($scope, $log, $timeout, detailStore, ShoppingList, $ionicScrollDelegate) {
    $scope.tab = 0;
    $scope.detailTabOpen = false;
    $scope.showDetailTab = false;
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        $scope.recipeID = detailStore.getID();
        viewData.enableBack = true;
        $scope.tab = 0;
    });
    $scope.setTab = function (newValue) {
        if (newValue === $scope.tab) {
            
            $scope.showDetailTab = false;

            $timeout(function () {
                $scope.detailTabOpen = false;
                $scope.tab = 0;
            }, 500);

        } else {
            $scope.tab = newValue;
            $scope.detailTabOpen = true;
            $timeout(function () {
                $scope.showDetailTab = true;
                
            }, 500);
        }
               
    };
    $scope.isSet = function (tabName) {
        return $scope.tab === tabName;
    };

    $scope.addAllToList = function () {
        for (var i = 0; i < $scope.recipeID.ingredients.length; i++) {
            ShoppingList.addFromRecipe($scope.recipeID.ingredients[i]);
        }
    };

    $scope.addToList = function (ingredient) {
        ShoppingList.addFromRecipe(ingredient);
    };

    $scope.page = "Recipe Detail";

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
});