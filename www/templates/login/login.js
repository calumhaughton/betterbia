// loginCtrl

angular.module('app.controllers').controller('loginCtrl', function ($scope, $state, $localStorage, Social, Utils, $cordovaOauth, Popup, Firebase, $timeout, ShoppingList, $rootScope, $firebaseArray) {
    $scope.util = Utils;

    $scope.$on('$ionicView.enter', function () {

        //Set statusbar
        StatusBar.backgroundColorByHexString("#272727");
        //Clear the Login Form.
        $scope.user = {
            email: '',
            password: ''
        };

        //Check if user is already authenticated on Firebase and authenticate using the saved credentials.
        if ($localStorage) {
            if ($localStorage.loginProvider) {
                $scope.loading = true;
                //The user is previously logged in, and there is a saved login credential.
                if ($localStorage.loginProvider == "Firebase") {
                    //Log the user in using Firebase.
                    loginWithFirebase($localStorage.email, $localStorage.password);
                } else {
                    //Log the user in using Social Login.
                    var provider = $localStorage.loginProvider;
                    var credential;
                    switch (provider) {
                        case 'Facebook':
                            credential = firebase.auth.FacebookAuthProvider.credential($localStorage.access_token);
                            break;
                        case 'Google':
                            credential = firebase.auth.GoogleAuthProvider.credential($localStorage.id_token, $localStorage.access_token);
                            break;
                        case 'Twitter':
                            credential = firebase.auth.TwitterAuthProvider.credential($localStorage.oauth_token, $localStorage.oauth_token_secret);
                            break;
                    }
                    loginWithCredential(credential, $localStorage.loginProvider);
                }
            } else if ($localStorage.isGuest) {
                //The user previously logged in as guest, entering as a new guest again.
                loginFirebaseGuest();
            }
        }
    });

  // Manages display of loading spinner on login/account creation
  $scope.loading = false;


  $scope.login = function (user) {
      if (angular.isDefined(user)) {
          $scope.loading = true;
          loginWithFirebase(user.email, user.password);
      }
  };

  $scope.loginWithFacebook = function() {
    $scope.loading = true;
    var fbLoginSuccess = function (userData) {
        // Login using the Facebook plugin, and pass the generated access token to Firebase
        facebookConnectPlugin.getAccessToken(function (token) {
            var credential = firebase.auth.FacebookAuthProvider.credential(token);
            loginWithCredential(credential, 'Facebook');
        });
    }

    facebookConnectPlugin.login(["public_profile", "email"], fbLoginSuccess, function (error) {
        console.log(error);
    });
  };

  // Function to login to Firebase using email and password.
  loginWithFirebase = function (email, password) {
      // Check user account is a Firebase account
      firebase.auth().fetchProvidersForEmail(email).then(function (data) {
          if (data[0] === 'password') {
              firebase.auth().signInWithEmailAndPassword(email, password)
              .then(function (response) {
                  // Retrieve the account from the Firebase Database
                  var userId = firebase.auth().currentUser.uid;
                  var account = Firebase.get('accounts', 'userId', userId);
                  account.$loaded().then(function () {
                      if (account.length > 0) {
                          $localStorage.loginProvider = "Firebase";
                          $localStorage.email = email;
                          $localStorage.password = password;
                          // Get the first account because Firebase.get() returns a list.
                          $localStorage.accountId = account[0].$id;
                          $localStorage.username = account[0].username;
                          $localStorage.imageURL = account[0].imageURL;
                          // Proceed to main page
                          $state.go('tabsMaster');
                          $scope.util.errorFeedback = false;
                          $timeout(function () {
                              $scope.loading = false;
                          }, 3000);
                      }
                  });
              })
              .catch(function (error) {
                  var errorCode = error.code;
                  showFirebaseLoginError(errorCode);
              });
          } else {
              // If account is from Facebook, display error message
              $scope.$apply(function () {
                  $scope.loading = false;
                  Utils.message(Popup.errorIcon, Popup.facebookAccount);
              });
          }
      });
    
  }

  // Function to login to Firebase using a credential and provider.
  loginWithCredential = function(credential, provider) {
    firebase.auth().signInWithCredential(credential)
      .then(function(response) {
        // Check if account already exists on the database.
        checkAndLoginAccount(response, provider, credential);
        // Save social login credentials.
        $localStorage.loginProvider = provider;
        $localStorage.credential = credential;
      })
      .catch(function(error) {
        // Show error message.
        var errorCode = error.code;
        showSocialLoginError(errorCode);
      });
  };

  // Check if the Social Login used already has an account on the Firebase Database. If not, the user is asked to complete a form.
  checkAndLoginAccount = function(response, provider, credential) {
    var userId = firebase.auth().currentUser.uid;
    var account = Firebase.get('accounts', 'userId', userId);
    account.$loaded().then(function() {
      if (account.length > 0) {
        // Account already exists, proceed to home.
        // Get the first account because Firebase.get() returns a list.
        $localStorage.accountId = account[0].$id;
        $localStorage.username = account[0].username;
        $localStorage.imageURL = account[0].imageURL;
        $localStorage.email = account[0].email;
        $scope.loading = false;
        $state.go('tabsMaster');
      } else {
        // No account yet, pull data from Facebook and save to Firebase Database.
        $localStorage.provider = provider;
        facebookConnectPlugin.api('/me?fields=id,name,email,picture', [], function (success) {
            $timeout(function () {
                $localStorage.username = success.name;
                $localStorage.imageURL = success.picture.data.url;
                $localStorage.email = success.email;
                //Get Firebase reference to add accounts database.
                var accounts = $firebaseArray(firebase.database().ref('accounts'));
                
                accounts.$loaded().then(function () {
                    accounts.$add({
                        username: success.name,
                        email: success.email,
                        userId: firebase.auth().currentUser.uid,
                        imageURL: success.picture.data.url,
                        dateCreated: Date(),
                        provider: 'Facebook',
                        shoppingList: {
                            defaultList: {
                                name: "My Shopping List",
                                group: "myLists"
                            },
                            myLists: {
                                "My Shopping List": {
                                    ingredients: {},
                                    name: "My Shopping List"
                                }
                            },
                            sharedWithMe: {}
                        },
                        calendar: {
                            "Date": 0,
                            "points": 0
                        },
                        onboarding: {
                            profile:false,
                            recipes:false,
                            shoppingLists:false
                        }
                    }).then(function (ref) {
                        // Account created successfully, logging user in automatically after a short delay.
                        $localStorage.accountId = ref.key;
                        $localStorage.loginProvider = "Facebook";
                        $scope.loading = false;
                        $state.go('tabsMaster');
                    });
                });

            }, 500);

        }, function (error) {
            console.log(error);
        });
      }
    });
  };

  // Displays message at the top of the page if there is an error while logging in with Firebase
  showFirebaseLoginError = function(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        Utils.message(Popup.errorIcon, Popup.emailNotFound);
        $scope.loading = false;
        $scope.$apply();
        break;
      case 'auth/wrong-password':
          Utils.message(Popup.errorIcon, Popup.wrongPassword);
          $scope.loading = false;
          $scope.$apply();
        break;
      case 'auth/user-disabled':
        Utils.message(Popup.errorIcon, Popup.accountDisabled);
        $scope.loading = false;
        $scope.$apply();
        break;
      case 'auth/too-many-requests':
        Utils.message(Popup.errorIcon, Popup.manyRequests);
        $scope.loading = false;
        $scope.$apply();
        break;
      default:
        Utils.message(Popup.errorIcon, Popup.errorLogin);
        $scope.loading = false;
        $scope.$apply();
        break;
    }
  };

// Displays message at the top of the page if there is an error while logging in with Facebook
  showSocialLoginError = function (errorCode) {
    switch (errorCode) {
      case 'auth/account-exists-with-different-credential':
        Utils.message(Popup.errorIcon, Popup.accountAlreadyExists);
        break;
      case 'auth/invalid-credential':
        Utils.message(Popup.errorIcon, Popup.sessionExpired);
        break;
      case 'auth/operation-not-allowed':
        Utils.message(Popup.errorIcon, Popup.serviceDisabled);
        break;
      case 'auth/user-disabled':
        Utils.message(Popup.errorIcon, Popup.accountDisabled);
        break;
      case 'auth/user-not-found':
        Utils.message(Popup.errorIcon, Popup.userNotFound);
        break;
      case 'auth/wrong-password':
        Utils.message(Popup.errorIcon, Popup.wrongPassword);
        break;
      default:
        Utils.message(Popup.errorIcon, Popup.errorLogin);
        break;
    }
  };

  // Manages display of different forms on Login page
  $scope.showLogin = true;
  $scope.showSignUp = false;
  $scope.showForgotPassword = false;

 

  $scope.updateShowLogin = function () {
      $scope.showLogin = false;
      Utils.message("", "");
      $timeout(function () {
          $scope.showSignUp = true;
          $scope.user = {};
      }, 1000);
  }

  $scope.updateShowSignUp = function () {
      $scope.showSignUp = false;
      $scope.showForgotPassword = false;
      Utils.message("", "");
      $timeout(function () {
          $scope.showLogin = true;
          $scope.user = {};
      }, 1000);
  }

  $scope.updateShowForgotPassword = function () {
      $scope.showLogin = false;
      Utils.message("", "");
      $timeout(function () {
          $scope.showForgotPassword = true;
      }, 1000);
  }


// Code for Signup form

$scope.creatingAccount = false;

$scope.register = function (user) {
        // Check if form is filled up.
        if (angular.isDefined(user)) {
            $scope.loading = true;
            $scope.creatingAccount = true;
            // Check if an account with the same email already exists.
            var account = Firebase.get('accounts', 'email', user.signUpEmail);
            account.$loaded().then(function () {
                // Account with same email already exists.
                if (account.length > 0) {
                    $scope.loading = false;
                    $scope.creatingAccount = false;
                    Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
                } else {
                    // Account doesn't exist yet, proceed to insert account data to database.
                    firebase.auth().createUserWithEmailAndPassword(user.signUpEmail, user.signUpPassword)
                      .then(function () {
                          // Get Firebase reference to add accounts database.
                          var accounts = Firebase.all('accounts');
                          accounts.$add({
                              username:user.name,
                              email: user.signUpEmail,
                              userId: firebase.auth().currentUser.uid,
                              imageURL: "img/default.png",
                              dateCreated: Date(),
                              provider: 'Firebase',
                              shoppingList: {
                                  defaultList: {
                                      name: "My Shopping List",
                                      group: "myLists"
                                  },
                                  myLists: {
                                      "My Shopping List": {
                                          ingredients: {},
                                          name: "My Shopping List"
                                      }
                                  },
                                  sharedWithMe: {}
                              },
                              calendar: {
                                  "Date": 0,
                                  "points": 0
                              },
                              onboarding: {
                                  profile: false,
                                  recipes: false,
                                  shoppingLists: false
                              }
                          }).then(function (ref) {
                              // Account created successfully, logging user in automatically after a short delay.
                              // Retrieve the account from the Firebase Database
                              var userId = firebase.auth().currentUser.uid;
                              var account = Firebase.get('accounts', 'userId', userId);
                              account.$loaded().then(function () {
                                  if (account.length > 0) {
                                      $localStorage.loginProvider = "Firebase";
                                      $localStorage.email = user.signUpEmail;
                                      $localStorage.password = user.signUpPassword;
                                      //Get the first account because Firebase.get() returns a list.
                                      $localStorage.accountId = account[0].$id;
                                      $localStorage.username = account[0].username;
                                      $localStorage.imageURL = account[0].imageURL;
                                      $state.go('tabsMaster');
                                      $scope.util.errorFeedback = false;

                                      $timeout(function () {
                                          $scope.loading = false;
                                          $scope.creatingAccount = false;
                                      }, 3000);

                                  }
                              });  
                          });
                      })
                      .catch(function (error) {
                          var errorCode = error.code;
                          var errorMessage = error.message;

                          // Put screen back to form
                          $timeout(function () {
                              $scope.loading = false;
                              $scope.creatingAccount = false;
                          }, 100);
                          
                          //Show error message.
                          console.log(errorCode);
                          switch (errorCode) {
                              case 'auth/email-already-in-use':
                                  Utils.message(Popup.errorIcon, Popup.emailAlreadyExists);
                                  break;
                              case 'auth/invalid-email':
                                  Utils.message(Popup.errorIcon, Popup.invalidEmail);
                                  break;
                              case 'auth/operation-not-allowed':
                                  Utils.message(Popup.errorIcon, Popup.notAllowed);
                                  break;
                              case 'auth/weak-password':
                                  Utils.message(Popup.errorIcon, Popup.weakPassword);
                                  break;
                              default:
                                  Utils.message(Popup.errorIcon, Popup.errorRegister);
                                  break;
                          }
                      });
                }
            });
        }
    };

    // Function to set the accountId from the Firebase database and store it on $localStorage.accountId.
    setAccountAndLogin = function (key) {
        $localStorage.accountId = key;
        $localStorage.loginProvider = "Firebase";
        $scope.loading = false;
        $state.go('tabsMaster');
    };




    // Code for Forgotten PW page

    $scope.emailSent = false;
    $scope.facebookAccount = false;

    $scope.returnToLogin = function () {
        $scope.showForgotPassword = false;
        $scope.emailSent = false;
        $scope.facebookAccount = false;

        $scope.showLogin = true;
    }

    $scope.resetPassword = function (user) {
        if (angular.isDefined(user)) {
            firebase.auth().fetchProvidersForEmail(user.resetEmail).then(function (data) {
                if (data[0] === 'password') {
                    firebase.auth().sendPasswordResetEmail(user.resetEmail).then(function () {
                        // Bring user to the Email Sent page.
                        $scope.$apply(function () {
                            $scope.emailSent = true;
                        });    

                    }, function (error) {
                        var errorCode = error.code;
                        //Show error message.
                        console.log(errorCode);
                        switch (errorCode) {
                            case 'auth/user-not-found':
                                Utils.message(Popup.errorIcon, Popup.emailNotFound);
                                break;
                            case 'auth/invalid-email':
                                Utils.message(Popup.errorIcon, Popup.invalidEmail);
                                break;
                            default:
                                Utils.message(Popup.errorIcon, Popup.errorPasswordReset);
                                break;
                        }
                    });
                } else {
                    $scope.$apply(function () {
                        $scope.facebookAccount = true;
                    });
                }
            });
        }
    };
});