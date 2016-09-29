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
            template: '<div class="list"><label class="item item-input item-stacked-label">' +
                        '<span class="input-label" style="color:black;">Enter new list name below</span>' +
                        '<input type="text" style="color:black;" placeholder="List Name" ng-model="newList.name">' +
                        '</label></div>',
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
            template: '<div class="list"><label class="item item-input item-stacked-label">' +
                        '<span class="input-label" style="color:black;">Email</span>' +
                        '<input style="color:black;" type="text" ng-model="shareTo.email">' +
                        '</label></div>',
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
});