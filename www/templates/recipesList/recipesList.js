// recipesListCtrl


angular.module('app.controllers').controller('recipesListCtrl', function ($scope, $rootScope, $log, $timeout, recipeStore, timeStore, detailStore, ingTypeStore, ShoppingList) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#5b800d");
    });
    
    $scope.recipes = recipeStore;
    $scope.filteredRecipes = {};

    $scope.spinnerBoolean = true;
    $scope.time = "All";

    $scope.recipes.$loaded().then(function () {
        $scope.filteredRecipes = {};
        angular.forEach($scope.recipes, function (value, key) {
            angular.forEach(value, function (v, k) {
                $scope.filteredRecipes[k] = v;
            });
        });
        $scope.spinnerBoolean = false;
    });
    
    $rootScope.$on('newIngredient', function () {
        var ing = ingTypeStore.getType();
        $scope.getRecipes(ing);
    });

    $scope.getRecipes = function (ingredient) {
        $scope.filteredRecipes = {};
        angular.forEach($scope.recipes, function (value, key) {
            if (ingredient === "All") {
                angular.forEach(value, function (v, k) {
                    $scope.filteredRecipes[k] = v;
                });
            } else if (ingredient === key) {
                angular.forEach(value, function (v, k) {
                    $scope.filteredRecipes[k] = v;
                });
            }

        });
    };

    $scope.setTime = function (time) {
        timeStore.setTime(time);
    };

    $scope.goToDetail = function (id) {
        detailStore.setID(id);
    };

    $scope.addRecipeToShoppingList = function (id)
    {
        detailStore.setID(id);
        var recipeDetail = detailStore.getID();
        recipeDetail.$loaded().then(function () {
            for (var i = 0; i < recipeDetail.ingredients.length; i++) {
                ShoppingList.addFromRecipe(recipeDetail.ingredients[i]);
            }
        });
    };

    $scope.page = "Recipes List";
});