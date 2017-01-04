// recipesListCtrl


angular.module('app.controllers').controller('recipesListCtrl', function ($scope, $rootScope, $log, $timeout, recipeStore, timeStore, detailStore, ingTypeStore, ShoppingList, searchStore) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#5b800d");
    });
    // Load recipe data
    $scope.recipes = recipeStore;
    $scope.filteredRecipes = {};

    $scope.searchFilter = searchStore.getFilter();

    $scope.spinnerBoolean = true;
    $scope.time = "All";

    // When all recipes have loaded, add them to filteredRecipes to be displayed, and turn off loading spinner
    $scope.recipes.$loaded().then(function () {
        $scope.filteredRecipes = {};
        angular.forEach($scope.recipes, function (value, key) {
            angular.forEach(value, function (v, k) {
                $scope.filteredRecipes[k] = v;
            });
        });
        $scope.spinnerBoolean = false;
    });
    
    // When a new ingredient type has been selected, update the screen
    $rootScope.$on('newIngredient', function () {
        var ing = ingTypeStore.getType();
        $scope.getRecipes(ing);
    });

    // As the user types into the search bar, this function is called
    $scope.$on('newSearchFilter', function () {
        $scope.searchFilter = searchStore.getFilter();
    });

    // Get recipes for an individual ingredient
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

    // Stores recipe.id to load on the detail page
    $scope.goToDetail = function (id) {
        detailStore.setID(id);
    };

    $scope.page = "Recipes List";

    // Checks if the 'No Results' message should display
    $scope.checkResultsLength = function (results) {
        if (results != null) {
            var resultsArray = Object.keys(results);
            var length = resultsArray.length;
            return length;
        }
    }

});