// shoppingListCtrl

angular.module('app.controllers').controller('listDetailCtrl', function ($scope, ShoppingList, Catalogue, $ionicScrollDelegate) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        $scope.items = "";
        $scope.shoppingList = ShoppingList;
        $scope.items = ShoppingList.items();
    });
    
    var newItemElm = $('#newItem');

    $scope.addItem = function (item) {
        ShoppingList.add(item);
        $scope.newItem = "";
        $scope.$broadcast('autocomplete.preventBlur');
    };


    $scope.$watch('newItem', function (text) {
        var suggestions = Catalogue.names();
        $scope.suggestions = [];

        if (text && !text.isEmpty()) {
            var matches = [];
            var substrRegex = new RegExp(text, 'i');
            $.each(suggestions, function (i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });
            if (matches.length < 6) {
                $scope.suggestions = matches;
            } else {
                for (var i = 0; i < 5; i++) {
                    $scope.suggestions[i] = matches[i];
                }
            }
        }
    });


    // inline-nav-bar color control - updates bg color on scroll
    $scope.navScrolled = {
        option: false
    }

    $scope.scrolled = function () {
        if ($ionicScrollDelegate.getScrollPosition().top > 0) {
            $scope.$apply(function () {
                $scope.navScrolled.option = true;
            });
        } else {
            $scope.$apply(function () {
                $scope.navScrolled.option = false;
            });
        }
    }

    // Prevent the soft keyboard from disappearing when clicking the "+" button
    // or one of the autocomplete suggestions
    // ref: https://stackoverflow.com/questions/7621711/how-to-prevent-blur-running-when-clicking-a-link-in-jquery
    var keepFocus = false;
    $scope.$on('autocomplete.preventBlur', function () {
        keepFocus = true;
    });
    newItemElm.blur(function () {
        if (keepFocus) {
            newItemElm.focus();
            keepFocus = false;
        }
    });

    String.prototype.capitalize = function () {
        return this.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    };

    String.prototype.isEmpty = function () {
        return (this.length === 0 || !this.trim());
    };

});