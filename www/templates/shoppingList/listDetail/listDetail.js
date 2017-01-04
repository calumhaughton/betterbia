// shoppingListCtrl

angular.module('app.controllers').controller('listDetailCtrl', function ($rootScope, $state, $scope, ShoppingList, Catalogue, $ionicScrollDelegate, $ionicPopover, $ionicPopup, $firebaseObject, $localStorage) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#272727");
        $scope.items = "";
        // Load Shopping List Data
        $scope.shoppingList = ShoppingList;
        $scope.items = ShoppingList.items();

        $scope.lists = ShoppingList.lists();
        $scope.sharedLists = ShoppingList.sharedLists();
        $scope.accounts = $firebaseObject(firebase.database().ref('accounts'));
        
        $scope.checkList = ShoppingList.checkListLocation(ShoppingList.selectedList.listName).then(function (data) {
            $scope.listLocation = data;
        })
    });

    // Add item from user input
    var newItemElm = $('#newItem');
    $scope.addItem = function (item) {
        ShoppingList.add(item);
        $scope.newItem = "";
        $scope.$broadcast('autocomplete.preventBlur');
    };

    // Suggest items as user types
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


    // Inline-nav-bar color control - updates bg color on scroll
    $scope.navScrolled = {
        option: false
    }

    $scope.scrolled = function () {
        if ($ionicScrollDelegate.getScrollPosition().top > 0) {
            $scope.$apply(function () {
                $scope.navScrolled.option = true;
                StatusBar.backgroundColorByHexString("#5b800d");
            });
        } else {
            $scope.$apply(function () {
                $scope.navScrolled.option = false;
                StatusBar.backgroundColorByHexString("#272727");
            });
        }
    }

    // Updates the DOM when a user is editing an item
    $scope.editingItem = false;

    $rootScope.$on('editingItem', function () {
        $scope.editingItem = true;
    });

    $rootScope.$on('doneEditingItem', function () {
        $scope.editingItem = false;
    });

    // Prevent the soft keyboard from disappearing when clicking the "+" button
    // or one of the autocomplete suggestions
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


    //Code for the Popover menu at the top
    $ionicPopover.fromTemplateUrl('templates/shoppingList/listDetail/list-menu.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function ($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.popover.remove();
    });


    //Share a list via email
    $scope.shareTo = {};
    $scope.shareList = function (listName) {
        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' +
                      '<input id="email" type="text" class="validate" ng-model="shareTo.email" style="color:#222" focus-me>' +
                      '<label for="email" class="active">Email</label>' +
                      '</div>',
            title: 'Share List',
            subTitle: 'Enter the email address of the person you would like to share with',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        $scope.shareTo.email = "";
                        myPopup.close();
                    }
                },
                {
                    text: 'Share List',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.accounts.$loaded().then(function () {
                            angular.forEach($scope.accounts, function (value, key) {
                                if ($scope.shareTo.email === value.email) {
                                    var updateAccount = $firebaseObject(firebase.database().ref('accounts/' + key + '/shoppingList/sharedWithMe'));
                                    updateAccount.$loaded().then(function () {
                                        updateAccount[listName] = {
                                            accountId: $localStorage.accountId,
                                            email: $localStorage.accountId,
                                            accepted: false,
                                            name: listName
                                        };
                                        updateAccount.$save();
                                    });
                                }
                            });
                        });
                    }
                }
            ]
        });
    }

    // Unshare a list with me
    $scope.unshareList = function (listName) {
        var myPopup = $ionicPopup.show({
            title: 'Unshare List',
            subTitle: 'This will unshare this list with you, removing it from this view.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        myPopup.close();
                    }
                },
                {
                    text: 'Unshare List',
                    type: 'button-positive',
                    onTap: function (e) {
                        var listToUnshare = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/sharedWithMe/' + listName));
                        listToUnshare.$loaded().then(function () {
                            listToUnshare.$remove();
                            $state.go('tabsMaster');
                        });
                    }
                }
            ]
        });
    }

    // Update the list name
    $scope.editList = function (listName) {
        $scope.edit = {
            name: listName,
            oldName: listName
        };

        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' +
                      '<input id="editListName" type="text" class="validate" ng-model="edit.name" style="color:#222" focus-me>' +
                      '<label for="editListName" class="active">List Name</label>' +
                      '</div>',
            title: 'Edit List',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        $scope.edit.name = listName;
                        myPopup.close();
                    }
                },
                {
                    text: 'Update List',
                    type: 'button-positive',
                    onTap: function (e) {
                        ShoppingList.selectedList.listName = $scope.edit.name;

                        $scope.listAccount = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists'));
                        $scope.defaultList = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/defaultList'));
                        $scope.listAccount.$loaded().then(function () {
                            $scope.listAccount[$scope.edit.name] = {
                                ingredients: {},
                                name: $scope.edit.name
                            };

                            $scope.ingredients = $scope.listAccount[$scope.edit.oldName].ingredients;

                            angular.forEach($scope.ingredients, function (value, key) {
                                $scope.listAccount[$scope.edit.name].ingredients[key] = value;
                            });

                            $scope.listAccount.$save();

                            $scope.items = ShoppingList.items();

                            $scope.defaultList.$loaded().then(function () {
                                if ($scope.edit.oldName === $scope.defaultList.name) {
                                    $scope.defaultList.name = $scope.edit.name;
                                    $scope.defaultList.$save();
                                }
                            });

                            var listForDeletion = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists/' + $scope.edit.oldName));
                            listForDeletion.$loaded().then(function () {
                                listForDeletion.$remove();
                            });
                        });

                        $scope.accounts.$loaded().then(function () {

                            angular.forEach($scope.accounts, function (value, key) {
                                angular.forEach(value.shoppingList.sharedWithMe, function (value, key) {
                                    if (value.name === $scope.edit.oldName) {
                                        value.name = $scope.edit.name;
                                        $scope.accounts.$save();
                                    }
                                });

                            });
                        });
                    }
                }
            ]
        });
    }
});