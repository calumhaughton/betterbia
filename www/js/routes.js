'Use Strict';
angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  .state('tabsMaster', {
      url: '/tabsMaster',
      templateUrl: 'templates/tabs/tabsMaster.html',
      controller:'masterCtrl'
  })

  .state('listDetail', {
      url: '/listDetail',
      templateUrl: 'templates/shoppingList/listDetail/listDetail.html',
      controller: 'listDetailCtrl'
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

$urlRouterProvider.otherwise('/login')

  

});