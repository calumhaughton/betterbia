'Use Strict';
angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.profile', {
    url: '/profile',
    views: {
      'tab1': {
        templateUrl: 'templates/profile/profile.html',
        controller: 'profileCtrl'
      }
    }
  })

  .state('tabsController.recipesList', {
    url: '/recipesList',
    views: {
      'tab4': {
        templateUrl: 'templates/recipesList/recipesList.html',
        controller: 'recipesListCtrl'
      }
    }
  })

  .state('tabsController.listHome', {
    url: '/listHome',
    views: {
      'tab2': {
        templateUrl: 'templates/shoppingList/listHome/listHome.html',
        controller: 'listHomeCtrl'
      }
    }
  })

  .state('listDetail', {
      url: '/listDetail',
      templateUrl: 'templates/shoppingList/listDetail/listDetail.html',
      controller: 'listDetailCtrl'
  })

  .state('tabsController', {
    url: '/tabs',
    templateUrl: 'templates/tabsController.html',
    controller: 'tabsCtrl',
    abstract:true
  })

  .state('recipeDetail', {
    url: '/recipeDetail',
    templateUrl: 'templates/recipeDetail/recipeDetail.html',
    controller: 'recipeDetailCtrl'
  })

  .state('recipeSteps', {
    url: '/recipeSteps',
    templateUrl: 'templates/recipeSteps/recipeSteps.html',
    controller: 'recipeStepsCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup/signup.html',
    controller: 'signupCtrl'
  })

  .state('forgotPassword', {
    url: '/forgotPassword',
    templateUrl: 'templates/forgotPassword/forgotPassword.html',
    controller: 'forgotPasswordCtrl'
  }) 

   .state('completeAccount', {
     url: '/completeAccount',
     templateUrl: 'templates/completeAccount/completeAccount.html',
     controller: 'completeAccountCtrl'
   })

    .state('editProfile', {
        url: '/editProfile',
        templateUrl: 'templates/mainMenu/editProfile/editProfile.html',
        controller: 'editProfileCtrl'
    })

    .state('help', {
        url: '/help',
        templateUrl: 'templates/mainMenu/help/help.html',
        controller: 'helpCtrl'
    })

    .state('privacyPolicy', {
        url: '/privacyPolicy',
        templateUrl: 'templates/mainMenu/privacyPolicy/privacyPolicy.html',
        controller: 'privacyPolicyCtrl'
    })




$urlRouterProvider.otherwise('/login')

  

});