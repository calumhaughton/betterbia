// recipeDetailCtrl

angular.module('app.controllers').controller('recipeDetailCtrl', function ($scope, $log, detailStore, ShoppingList) {
    $scope.tab = 0;
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        $scope.recipeID = detailStore.getID();
        viewData.enableBack = true;
        $scope.tab = 0;
    });
    $scope.setTab = function (newValue) {
        $scope.tab = newValue;
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
});