// List Home Controller



angular.module('app.controllers')
    
.controller('listHomeCtrl', function ($scope, $localStorage, $ionicPopup, $firebaseObject, $firebaseArray, ShoppingList, Catalogue) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#5b800d");
    });

    // Load list data on account load
    $scope.$on('getAccountDetails', function() {
        $scope.thisAccount = $localStorage.accountId;
        $scope.lists = ShoppingList.lists();
        $scope.sharedLists = ShoppingList.sharedLists();
    });

    $scope.thisAccount = $localStorage.accountId;
    $scope.lists = ShoppingList.lists();
    $scope.setList = function (list, id) {
        ShoppingList.setList(list, id);
    }

    $scope.sharedLists = ShoppingList.sharedLists();
    $scope.accounts = $firebaseObject(firebase.database().ref('accounts'));
    $scope.newList = {};

    // Create a new list
    $scope.createNewList = function () {
        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' + 
                      '<input id="newListName" type="text" class="validate" ng-model="newList.name" style="color:#222" focus-me>' + 
                      '<label for="newListName" class="active">New List Name</label>'+
                      '</div>',
            title:'Create New List',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function(e) {
                        $scope.newList.name = "";
                        myPopup.close();
                    }   
                },
                {
                    text: 'Create List',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.lists[$scope.newList.name] = {
                            "name": $scope.newList.name,
                            "ingredients": [],
                        }
                        $scope.lists.$save();
                        $scope.newList.name = "";
                    }
                }
            ]
        });
    }

    // Store for the email that will be shared to
    $scope.shareTo = {};
    // Share a list with another user via email
    $scope.shareList = function (listName) {
        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' + 
                      '<input id="email" type="text" class="validate" ng-model="shareTo.email" style="color:#222" focus-me>' + 
                      '<label for="email" class="active">Email</label>'+
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
                                            accepted:false,
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

    // Unshare a list that has been shared with me
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
                        });
                    }
                }
            ]
        });
    }

    // Delete a list
    $scope.deleteList = function (listName) {
        var myPopup = $ionicPopup.show({
            title: 'Delete List',
            subTitle: 'This will permanently remove the list for you and anyone this list has been shared with.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        myPopup.close();
                    }
                },
                {
                    text: 'Delete List',
                    type: 'button-positive',
                    onTap: function (e) {
                        var listForDeletion = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists/' + listName));
                        listForDeletion.$loaded().then(function () {
                            listForDeletion.$remove();
                        });

                        $scope.accounts.$loaded().then(function () {

                            angular.forEach($scope.accounts, function (value, key) {
                                // Find where the list has been shared to, and delete it from there too
                                angular.forEach(value.shoppingList.sharedWithMe, function (v, k) {
                                    if (v.name === listName) {
                                        var obj = $firebaseObject(firebase.database().ref('accounts/' + key + '/shoppingList/sharedWithMe/' + v.name));
                                        obj.$remove();  
                                    }
                                });

                            });
                        });
                    }
                }
            ]
        });
    }

    // Edit list name
    $scope.editList = function (listName) {
        $scope.edit = {
            name: listName,
            oldName: listName
        };

        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' + 
                      '<input id="editListName" type="text" class="validate" ng-model="edit.name" style="color:#222" focus-me>' + 
                      '<label for="editListName" class="active">List Name</label>'+
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
                        $scope.listAccount = $firebaseObject(firebase.database().ref('accounts/' + $scope.thisAccount + '/shoppingList/myLists'));
                        $scope.defaultList = $firebaseObject(firebase.database().ref('accounts/' + $scope.thisAccount + '/shoppingList/defaultList'));
                        $scope.listAccount.$loaded().then(function () {
                            $scope.listAccount[$scope.edit.name] = {
                                ingredients: {},
                                name:$scope.edit.name
                            };

                            $scope.ingredients = $scope.listAccount[$scope.edit.oldName].ingredients;

                            angular.forEach($scope.ingredients, function (value, key) {
                                $scope.listAccount[$scope.edit.name].ingredients[key] = value;
                            });

                            $scope.listAccount.$save();

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
                                // Find where a list has been shared to, and delete it from there too
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
})

    // Separate controller for lists that have been shared with me, but not yet accepted
.controller('sharedListCtrl', function ($scope, $firebaseObject, $localStorage, $ionicPopup) {
    $scope.fullSharedList = $firebaseObject(firebase.database().ref('accounts/' + $scope.sharedList.accountId + '/shoppingList/myLists/' + $scope.sharedList.name));
    $scope.fullSharedList.$watch(function () {
        if ('ingredients' in $scope.fullSharedList) {
            $scope.listIngs = $scope.fullSharedList.ingredients;
            $scope.listLength = Object.keys($scope.listIngs).length;
        } else {
            $scope.listLength = "0";
        }
    });

    $scope.listSharedWithMe = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/sharedWithMe/' + $scope.sharedList.name));

    // Accept the list
    $scope.acceptList = function () {
        $scope.listSharedWithMe.$loaded().then(function () {
            $scope.listSharedWithMe.accepted = true;
            $scope.listSharedWithMe.$save();
        });
    }

    // Reject the list, removing it from the page
    $scope.cancelList = function () {
        var myPopup = $ionicPopup.show({
            title: 'Cancel List Share',
            subTitle: 'This will remove the list from your Shopping List page. It won\'t affect the original list.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        myPopup.close();
                    }
                },
                {
                    text: 'Remove List',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.listSharedWithMe.$loaded().then(function () {
                            $scope.listSharedWithMe.$remove();
                        });
                    }
                }
            ]
        });        
    }
})
;