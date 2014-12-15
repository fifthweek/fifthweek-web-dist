"use strict";angular.module("webApp",["mgcrea.ngStrap","ngAnimate","ngResource","ngRoute","ngSanitize","LocalStorageModule","toaster","angular-loading-bar","angulartics","angulartics.google.analytics","angulartics.kissmetrics"]).constant("fifthweekConstants",{apiBaseUri:"https://api.fifthweek.com/",clientId:"fifthweek.web.1",homePage:"/",signInPage:"/signin",signOutPage:"/signout",registerPage:"/register",accountPage:"/account",dashboardPage:"/dashboard",feedbackPage:"/dashboard/feedback",notAuthorizedPage:"/notauthorized"}).config(["$routeProvider","fifthweekConstants",function(a,b){a.when(b.homePage,{templateUrl:"views/home.html",controller:"HomeCtrl"}).when(b.signInPage,{templateUrl:"views/signin.html",controller:"SignInCtrl"}).when(b.registerPage,{templateUrl:"views/register.html",controller:"RegisterCtrl"}).when(b.accountPage,{templateUrl:"views/account.html",controller:"AccountCtrl",access:{loginRequired:!0}}).when(b.dashboardPage,{templateUrl:"views/dashboard/demonstration.html",access:{loginRequired:!0}}).when(b.feedbackPage,{templateUrl:"views/dashboard/feedback.html",access:{loginRequired:!0}}).when(b.signOutPage,{templateUrl:"views/signout.html",controller:"SignOutCtrl"}).when(b.notAuthorizedPage,{redirectTo:b.homePage}).otherwise({redirectTo:b.homePage})}]),angular.module("webApp").controller("SignInCtrl",["$scope","$location","authenticationService","fifthweekConstants",function(a,b,c,d){a.signInData={username:"",password:""},a.message="",a.signIn=function(){return c.signIn(a.signInData).then(function(){b.path(d.dashboardPage)},function(b){a.message=b.error_description})}}]),angular.module("webApp").controller("HomeCtrl",[function(){}]),angular.module("webApp").controller("IndexCtrl",["$scope","$location","authenticationService","fifthweekConstants",function(a,b,c,d){a.signOut=function(){c.signOut(),b.path(d.homePage)},a.currentUser=c.currentUser}]),angular.module("webApp").controller("RegisterCtrl",["$scope","$location","authenticationService","fifthweekConstants",function(a,b,c,d){c.currentUser.authenticated===!0&&b.path(d.dashboardPage),a.savedSuccessfully=!1,a.message="",a.registrationData={exampleWork:"",email:"",username:"",password:""},a.register=function(){c.registerUser(a.registrationData).then(function(){a.savedSuccessfully=!0,a.message="Signing in...";var e={username:a.registrationData.username,password:a.registrationData.password};return c.signIn(e).then(function(){b.path(d.dashboardPage)},function(b){a.message=b.error_description})},function(b){a.message=b.data.message})}}]),angular.module("webApp").factory("authenticationInterceptor",["$q","$injector","$location","localStorageService","fifthweekConstants",function(a,b,c,d,e){var f,g={unauthorizedCount:0};g.request=function(a){a.headers=a.headers||{};var b=d.get("authenticationData");return b&&(a.headers.Authorization="Bearer "+b.token),a},g.responseError=function(d){if(401===d.status&&!d.config.hasRetried){d.config.hasRetried=!0;var f=b.get("authenticationService");return f.refreshToken().then(function(){var b=a.defer();return h(d.config,b),b.promise},function(){return c.path(e.signInPage),a.reject(d)})}return a.reject(d)};var h=function(a,c){f=f||b.get("$http"),f(a).then(function(a){c.resolve(a)},function(a){c.reject(a)})};return g}]),angular.module("webApp").factory("authenticationService",["$http","$q","localStorageService","fifthweekConstants",function(a,b,c,d){var e=d.apiBaseUri,f={};f.currentUser={authenticated:!1,username:"",permissions:[]},f.init=function(){var a=c.get("authenticationData");a&&(f.currentUser.authenticated=!0,f.currentUser.username=a.username)},f.registerUser=function(b){return f.signOut(),a.post(e+"membership/registrations",b)},f.signIn=function(h){f.signOut();var i="grant_type=password&username="+h.username+"&password="+h.password+"&client_id="+d.clientId,j=b.defer();return a.post(e+"token",i,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){var b=g(h.username);c.set("authenticationData",{token:a.access_token,username:b,refreshToken:a.refresh_token}),f.currentUser.authenticated=!0,f.currentUser.username=b,j.resolve(a)}).error(function(a){f.signOut(),j.reject(a)}),j.promise},f.signOut=function(){c.remove("authenticationData"),f.currentUser.authenticated=!1,f.currentUser.username=""},f.refreshToken=function(){var g=b.defer(),h=c.get("authenticationData");if(h){var i="grant_type=refresh_token&refresh_token="+h.refreshToken+"&client_id="+d.clientId;a.post(e+"token",i,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){c.set("authenticationData",{token:a.access_token,username:a.username,refreshToken:a.refresh_token}),g.resolve(a)}).error(function(a){f.signOut(),g.reject(a)})}else g.reject("No authentication data available");return g.promise};var g=function(a){return a.trim().toLowerCase()};return f}]),angular.module("webApp").constant("authorizationServiceConstants",{authorizationResult:{authorized:"authorized",loginRequired:"loginRequired",notAuthorized:"notAuthorized"},roleCheckType:{atLeastOne:"atLeastOne",all:"all"}}).factory("authorizationService",["authenticationService","authorizationServiceConstants",function(a,b){var c={};return c.authorize=function(c,d,e){var f=b.authorizationResult.authorized,g=!0;if(e=e||b.roleCheckType.atLeastOne,c===!0&&a.currentUser.authenticated===!1)f=b.authorizationResult.loginRequired;else if(c!==!0||a.currentUser.authenticated===!1||void 0!==d&&0!==d.length){if(d){var h=[];angular.forEach(a.currentUser.roles,function(a){h.push(a.toLowerCase())});for(var i=0;i<d.length;i+=1){var j=d[i].toLowerCase();if(e===b.roleCheckType.all){if(g=g&&h.indexOf(j)>-1,g===!1)break}else if(e===b.roleCheckType.atLeastOne&&(g=h.indexOf(j)>-1))break}f=g?b.authorizationResult.authorized:b.authorizationResult.notAuthorized}}else f=b.authorizationResult.authorized;return f},c}]),angular.module("webApp").config(["$httpProvider",function(a){a.interceptors.push("authenticationInterceptor")}]).run(["$rootScope","authenticationService","routeChangeAuthorizationHandler",function(a,b,c){b.init(),a.$on("$routeChangeStart",function(a,b){c.handleRouteChangeStart(b)})}]),angular.module("webApp").controller("AccountCtrl",["$scope",function(a){a.test=1}]),angular.module("webApp").controller("SignOutCtrl",["$location","authenticationService","fifthweekConstants",function(a,b,c){b.signOut(),a.path(c.signInPage)}]),angular.module("webApp").directive("roles",["authorizationService","authorizationServiceConstants",function(a,b){return{restrict:"A",link:function(c,d,e){var f=function(){d.removeClass("hidden")},g=function(){d.addClass("hidden")},h=function(c){var d;c&&f(),d=a.authorize(!0,i,e.roleCheckType),d===b.authorizationResult.authorized?f():g()},i=e.roles.split(/[\s,]+/);i.length>0&&h(!0)}}}]),angular.module("webApp").directive("username",["$q","$timeout",function(a,b){return{require:"ngModel",link:function(c,d,e,f){f.$asyncValidators.username=function(c){if(f.$isEmpty(c))return a.when();var d=a.defer();return b(function(){d.resolve()},1e3),d.promise}}}}]),angular.module("webApp").factory("routeChangeAuthorizationHandler",["authorizationService","authorizationServiceConstants","$rootScope","$location","fifthweekConstants",function(a,b,c,d,e){var f,g={},h=!1;return g.handleRouteChangeStart=function(c){if(h&&c.originalPath!==e.signInPage)h=!1,void 0!==c.access&&c.access.loginRequired===!0&&d.path(f).replace();else if(void 0!==c.access){var g=a.authorize(c.access.loginRequired,c.access.roles,c.access.roleCheckType);g===b.authorizationResult.loginRequired?(h=!0,f=c.originalPath,d.path(e.signInPage).replace()):g===b.authorizationResult.notAuthorized&&d.path(e.notAuthorizedPage).replace()}},g}]);