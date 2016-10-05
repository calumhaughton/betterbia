// List Home Controller

angular.module('app.controllers').controller('listHomeCtrl', function ($scope, $localStorage, $ionicPopup, $firebaseObject, $firebaseArray, ShoppingList, Catalogue) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        StatusBar.backgroundColorByHexString("#5b800d");
    });

    $scope.thisAccount = $localStorage.accountId;
    $scope.lists = ShoppingList.lists;
    $scope.setList = function (list, id) {
        ShoppingList.setList(list, id);
    }
    $scope.sharedLists = ShoppingList.sharedLists;
    $scope.accounts = $firebaseObject(firebase.database().ref('accounts'));
    $scope.newList = {};

    $scope.createNewList = function () {
        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' + 
                      '<input id="newListName" type="text" class="validate" ng-model="newList.name" style="color:#222">' + 
                      '<label for="newListName" class="active">New List Name</label>'+
                      '</div>',
            title:'Create New List',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function(e) {
                        myPopup.close();
                    }   
                },
                {
                    text: '<b>Create List</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.lists[$scope.newList.name] = {
                            name: $scope.newList.name,
                            ingredients: []
                        }
                        $scope.lists.$save();
                        $scope.newList.name = "";
                    }
                }
            ]
        });
    }

    $scope.shareTo = {};

    $scope.shareList = function (listName) {
        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' + 
                      '<input id="email" type="text" class="validate" ng-model="shareTo.email" style="color:#222">' + 
                      '<label for="email" class="active">Email</label>'+
                      '</div>',
            title: 'Share List',
            subTitle: 'Enter the email address of the person you would like to share with',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        myPopup.close();
                    }
                },
                {
                    text: '<b>Share List</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.accounts.$loaded().then(function () {
                            angular.forEach($scope.accounts, function (value, key) {
                                if ($scope.shareTo.email === value.email) {
                                    var updateAccount = $firebaseArray(firebase.database().ref('accounts/' + key + '/shoppingList/sharedWithMe'));
                                    updateAccount.$loaded().then(function () {
                                        updateAccount.$add({
                                            accountId: $localStorage.accountId,
                                            name: listName
                                        });
                                    });
                                }
                            });
                        });
                    }
                }
            ]
        });
    }

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
                    text: '<b>Delete List</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        var listForDeletion = $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists/' + listName));
                        listForDeletion.$loaded().then(function () {
                            listForDeletion.$remove();
                        });
                    }
                }
            ]
        });
    }

    $scope.editList = function (listName) {
        $scope.edit = {
            name: listName,
            oldName: listName
        };

        var myPopup = $ionicPopup.show({
            template: '<div class="input-field col s6">' + 
                      '<input id="editListName" type="text" class="validate" ng-model="edit.name" style="color:#222">' + 
                      '<label for="editListName" class="active">List Name</label>'+
                      '</div>',
            title: 'Edit List',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        myPopup.close();
                    }
                },
                {
                    text: '<b>Update List</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        $scope.listAccount = $firebaseObject(firebase.database().ref('accounts/' + $scope.thisAccount + '/shoppingList/myLists'));
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