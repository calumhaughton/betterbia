'Use Strict';
angular.module('app.services', [])

// Catalogue of suggested items when adding to shopping list
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

// Shopping List service that manages adding items to lists across the app
.factory('ShoppingList', function ($window, $rootScope, Catalogue, $firebaseArray, $firebaseObject, $localStorage, $filter, $q) {
    //var selectedList = "";
    var shoppingList = {
        // retrieve items in the database for this user's shopping list
        allListData: function () {
            return $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList'))
        },
        lists: function () {
            return $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists'))
        },
        sharedLists: function () {
            return $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/sharedWithMe'))
        },
            
        items: function () {
            var listName = shoppingList.selectedList.listName;
            var accountId = shoppingList.selectedList.accountId;

            function getArray (accountId, list) {
                return $firebaseArray(firebase.database().ref('accounts/' + accountId + '/shoppingList/myLists/' + list + '/ingredients'));
            }

            return getArray(accountId, listName);

        },
        defaultList: function () {
            return $firebaseObject(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/defaultList'));
        },

        defaultListItems: function() {
            var listName = shoppingList.defaultList();
            var accountId = $localStorage.accountId;

            function getArray (accountId, list) {
                return $firebaseArray(firebase.database().ref('accounts/' + accountId + '/shoppingList/' + list.group + '/' + list.name + '/ingredients'));
            }

            return getArray(accountId, listName);
        },

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
            return this.defaultListItems().map(function (x) { return x.name });
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

        addedIngredient: {},

        addFromRecipe: function (ingredient) {
            var list = shoppingList.defaultList();

            list.$loaded().then(function () {
                shoppingList.addedIngredient = ingredient;
                shoppingList.addedIngredient.list = list.name;
                $rootScope.$broadcast('ingredientAdded');
            }); 
        },

        checkListLocation: function (listName) {
            var lists = shoppingList.lists();
            var sharedLists = shoppingList.sharedLists();

            var defer = $q.defer();

            lists.$loaded().then(function () {
                sharedLists.$loaded().then(function () {
                    angular.forEach(lists, function (value, key) {
                        if (value.name === listName) {
                            defer.resolve('myLists');
                        }
                    });
                    angular.forEach(sharedLists, function (value, key) {
                        if (value.name === listName) {
                            defer.resolve('sharedWithMe');
                        }
                    });
                   
                }); 
            });

            return defer.promise;

        },
        addToList: function (ingredient, list) {
            // Edit the ingredient so the correct thing is added to the list
            var ingredientString;

            if (ingredient.main === true) {
                if ((ingredient.quantity * ingredient.servingSize) > 1) {
                    if (ingredient.measure !== "ml" && ingredient.measure !== "" && ingredient.measure !== "g") {
                        var lastLetter = ingredient.measure.slice(-1);
                        if (lastLetter !== "s") {
                            ingredient.measure = ingredient.measure + "s";
                        }
                    }
                }

                if (ingredient.measure === "g") {
                    ingredientString = ingredient.name + " x " + (ingredient.quantity * ingredient.servingSize) + ingredient.measure;
                } else {
                    if (ingredient.quantity === "") {
                        ingredientString = ingredient.name

                    } else {
                        ingredientString = ingredient.name + " x " + (ingredient.quantity * ingredient.servingSize) + " " + ingredient.measure;

                    }
                }
            } else {
                ingredientString = ingredient.name;
            }

            // select the correct list, and add the ingredient to it
            var chosenList;
            var listLocation;

            var lists = shoppingList.lists();
            var sharedLists = shoppingList.sharedLists();

            lists.$loaded().then(function () {
                sharedLists.$loaded().then(function () {
                    angular.forEach(lists, function (value, key) {
                        if (value.name === list) {
                            listLocation = 'myLists';
                        }
                    });
                    angular.forEach(sharedLists, function (value, key) {
                        if (value.name === list) {
                            listLocation = 'sharedWithMe';
                        }
                    });

                    if (listLocation === 'sharedWithMe') {
                        var accountId = sharedLists[list].accountId;
                        chosenList = $firebaseArray(firebase.database().ref('accounts/' + accountId + '/shoppingList/myLists/' + list + '/ingredients'));
                    } else {
                        chosenList = $firebaseArray(firebase.database().ref('accounts/' + $localStorage.accountId + '/shoppingList/myLists/' + list + '/ingredients'));
                    }

                    chosenList.$loaded().then(function () {
                        chosenList.$add({
                            name: ingredientString,
                            checked: false
                        });
                    });
                });
            });
        }
    };

    return shoppingList;
})

// Returns data for all recipes 
.factory('recipeStore', function ($firebaseObject) {
    var dataSet = firebase.database().ref('recipesList');
    return $firebaseObject(dataSet);
})


// Sets/gets the ingredient type, used to filter the Recipes List
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

// Sets/gets for the time value, used to filter the Recipes List 
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

// Sets/gets recipes by ID. The ID can then be used to call the recipe detail information, or the recipe steps information. 
.factory('detailStore', function ($firebaseObject) {
    var recipeID = 0;
    var servingSize = 0;

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
        },
        setServingSize: function (size) {
            servingSize = size;
        },
        getServingSize: function () {
            return servingSize;
        }
    }
})

// Sets/gets a value to pass to the Scrollable Timer Controller
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

// Sets/gets a value to pass to the timer on the Recipe Steps page
.factory('timerDetailsStore', function() {
    var details = {};
    details.timerType = "";
    details.index = "";
    details.count = 0;

    return {
        setDetails: function (t, i) {
            details.timerType = t;
            details.index = i;
        },
        getDetails: function () {
            return details;
        },
        addCount: function () {
            details.count++;
        },
        resetCount: function () {
            details.count = 0;
        }
    }
})

// Sets/gets an input from the user that is used to search the Recipes List
    .factory('searchStore', function () {
        var searchFilter = {};

        searchFilter.store = "";

        return {
            setFilter: function (input) {
                searchFilter.store = input;
            },
            getFilter: function () {
                return searchFilter.store;
            }
        }
    })

// Displays errors and messages through the login and signup workflows
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
            Utils.errorMessage = message;
            
        }
    };

    hideMessage = function () {
        $timeout.cancel(promise);
        $ionicLoading.hide();
    };

    return Utils;
})


// Facebook App Id
.constant('Social', {
    facebookAppId: "1714490675467225",

})

// Set of messages needed throughout login/signup workflows
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
    manyRequests: "Sorry, but we\'re still proccessing your previous login. Please try again later.",
    facebookAccount: "It looks like that email is linked to a Facebook account. Please press the 'Login with Facebook' button to login."
});

