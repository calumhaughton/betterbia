'Use Strict';
angular.module('app.services', [])

//shopping list code
.factory('Catalogue', function ($window, $rootScope, $firebaseArray) {
    var catalogue = {
        items: $firebaseArray(firebase.database().ref('ingredients')),
        names: function () {
            return this.items.map(function (x) { return x.$value });
        },
        exists: function (name) {
            return this.names().indexOf(name) >= 0;
        }
    };

    $rootScope.$watch(function () { return catalogue }, function () {
        $window.localStorage['catalogue'] = angular.toJson(catalogue.items);
    }, true)

    return catalogue;
})


.factory('ShoppingList', function ($window, $rootScope, Catalogue, $firebaseArray, $firebaseObject, $localStorage, $filter) {
    //var selectedList = "";
    var shoppingList = {
        // retrieve items in the database for this user's shopping list
        lists: $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists')),
        sharedLists: $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/sharedWithMe')),
            
        items: function () {
            var listName = shoppingList.selectedList.listName;
            var accountId = shoppingList.selectedList.accountId;

            function getArray (accountId, list) {
                return $firebaseArray(firebase.database().ref('accounts/' + accountId + '/shoppingList/myLists/' + list + '/ingredients'));
            }

            return getArray(accountId, listName);

        },

        defaultListItems: $firebaseArray(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists/My List/ingredients')),

        selectedList: {
            accountId: "",
            listName: ""
        },

        setList: function(listName, id) {
            shoppingList.selectedList.listName = listName;
            shoppingList.selectedList.accountId = id;
        },

        add: function (name) {
            name = name.capitalize();
            if (!name.isEmpty() && !this.exists(name)) {
                this.items().$add({
                    name: name,
                    quantity: 1,
                    measure: "",
                    prep:"",
                    checked: false
                });
            }
        },
        names: function () {
            return this.defaultListItems.map(function (x) { return x.name });
        },
        exists: function (name) {
            return this.names().indexOf(name) >= 0;
        },
        clearDone: function () {
            var items = this.items();
            items.$loaded().then(function () {
                var removeItems = $filter('trash')(items);
                for (var i = 0; i < removeItems.length; i++) {
                    items.$remove(removeItems[i]);
                }
            });
            
        },

        addedIngredient: {
            name: "DFSDF",
            list: "ASDFASDG"
        },
        addFromRecipe: function (ingredient) {
            if (this.exists(ingredient.name)) {
                var index = this.names().indexOf(ingredient.name);
                var key = this.defaultListItems.$keyAt(index);
                var updateIngredient = this.defaultListItems.$getRecord(key);

                updateIngredient.quantity += ingredient.quantity;

                if (updateIngredient.quantity > 1) {
                    if (updateIngredient.measure !== "ml" && updateIngredient.measure !== "") {
                        var lastLetter = updateIngredient.measure.slice(-1);
                        if (lastLetter !== "s") {
                            updateIngredient.measure = updateIngredient.measure + "s";
                        }
                    }
                }
                this.defaultListItems.$save(updateIngredient);
            } else if (!this.exists(ingredient.name)) {
                this.defaultListItems.$add({
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    measure: ingredient.measure,
                    prep: "",
                    checked: false
                });
            }
            shoppingList.addedIngredient.name = ingredient.name;
            shoppingList.addedIngredient.list = "My List";
            $rootScope.$broadcast('ingredientAdded');
            
        }
    };

    return shoppingList;
})

//database get data for recipes
.factory('recipeStore', function ($firebaseObject) {
    var dataSet = firebase.database().ref('recipesList');
    return $firebaseObject(dataSet);
})


// factory to store what the ingType is

.factory('ingTypeStore', function ($rootScope) {
    var ingType = {};
    ingType.selected = "All";
    return {
        getType: function () {
            return ingType.selected;
        },
        setType: function (newType) {
            ingType.selected = newType;
            $rootScope.$broadcast('newIngredient');
        }
    }
})

    // stores the time input on the recipe list page, for use throughout the application. 
.factory('timeStore', function () {
    var timeInput = {};
    timeInput.time = "All";

    return {
        getTime: function () {
            return timeInput.time;
        },
        setTime: function (time) {
            timeInput.time = time;
        }
    }
})
    // stores the selected recipe, using its ID. The ID can then be used to call the recipe detail information, or the recipe steps information. 
.factory('detailStore', function ($firebaseObject) {
    var recipeID = 0;

    return {
        getID: function () {
            var recipeData = firebase.database().ref('recipeDetail/' + recipeID);
            return $firebaseObject(recipeData);
        },
        setID: function (id) {
            recipeID = id;
        },
        getSteps: function (id) {
            var stepData = firebase.database().ref('step-by-step/' + recipeID);
            return $firebaseObject(stepData);
        }
    }
})

.factory('scrollableTimerStore', function () {
    var time = {};
    time.value = "";

    return {
        setTime: function (setTime) {
            time.value = setTime;
        },
        getTime: function () {
            return time.value;
        }
    }
})

// login sign up

.factory('Utils', function ($ionicLoading, $timeout, Popup) {
    var promise;
    var Utils = {
        errorFeedback: false,
        errorMessage: "",
        show: function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="android" style="fill:white;"></ion-spinner>'
            });
        },
        hide: function () {
            $ionicLoading.hide();
        },
        message: function (icon, message) {
            Utils.errorFeedback = true;
            Utils.errorMessage = "<i class='icon " + icon + " padding'></i>" + message;
            
        }
    };

    hideMessage = function () {
        $timeout.cancel(promise);
        $ionicLoading.hide();
    };

    return Utils;
})



.constant('Social', {
    facebookAppId: "1714490675467225",

})

.constant('Popup', {
    delay: 3000, //How long the popup message should show before disappearing (in milliseconds -> 3000 = 3 seconds).
    successIcon: "ion-happy-outline",
    errorIcon: "ion-android-alert",
    accountCreateSuccess: "Congratulations! Your account has been created. Logging you in.",
    emailAlreadyExists: "Sorry, but an account with that email address already exists. Please register with a different email and try again.",
    accountAlreadyExists: "Sorry, but an account with the same credential already exists. Please check your account and try again.",
    emailNotFound: "Sorry, but we couldn\'t find an account with that email address. Please check your email and try again.",
    userNotFound: "Sorry, but we couldn\'t find a user with that account. Please check your account and try again.",
    invalidEmail: "Sorry, but you entered an invalid email. Please check your email and try again.",
    notAllowed: "Sorry, but registration is currently disabled. Please contact support and try again.",
    serviceDisabled: "Sorry, but logging in with this service is current disabled. Please contact support and try again.",
    wrongPassword: "Sorry, but the password you entered is incorrect. Please check your password and try again.",
    accountDisabled: "Sorry, but your account has been disabled. Please contact support and try again.",
    weakPassword: "Sorry, but you entered a weak password. Please enter a stronger password and try again.",
    errorRegister: "Sorry, but we encountered an error registering your account. Please try again later.",
    passwordReset: "A password reset link has been sent to: ",
    errorPasswordReset: "Sorry, but we encountered an error sending your password reset email. Please try again later.",
    errorLogout: "Sorry, but we encountered an error logging you out. Please try again later.",
    sessionExpired: "Sorry, but the login session has expired. Please try logging in again.",
    errorLogin: "Sorry, but we encountered an error logging you in. Please try again later.",
    welcomeBack: "Welcome back! It seems like you should still be logged in. Logging you in now.",
    manyRequests: "Sorry, but we\'re still proccessing your previous login. Please try again later."
});

