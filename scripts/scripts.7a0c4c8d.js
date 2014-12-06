"use strict";angular.module("webApp",["ngAnimate","ngResource","ngRoute","ngSanitize","LocalStorageModule","toaster","angular-loading-bar"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/home.html",controller:"HomeCtrl"}).when("/signin",{templateUrl:"views/signin.html",controller:"SignInCtrl"}).when("/register",{templateUrl:"views/register.html",controller:"RegisterCtrl"}).when("/help",{templateUrl:"views/dashboard.html",controller:"HelpCtrl"}).when("/account",{templateUrl:"views/account.html",controller:"AccountCtrl"}).when("/dashboard",{templateUrl:"views/dashboard.html",controller:"DashboardCtrl"}).when("/signout",{templateUrl:"views/signout.html",controller:"SignOutCtrl"}).otherwise({redirectTo:"/"})}]).constant("webSettings",{apiBaseUri:"https://fifthweek-api.azurewebsites.net/",clientId:"fifthweek.web.1",successfulSignInPath:"/dashboard",successfulSignOutPath:"/signin"}),angular.module("webApp").controller("DashboardCtrl",function(){}),angular.module("webApp").controller("SignInCtrl",["$scope","$location","authService","webSettings",function(a,b,c,d){a.signInData={username:"",password:""},a.message="",a.signIn=function(){return c.signIn(a.signInData).then(function(){b.path(d.successfulSignInPath)},function(b){a.message=b.error_description})}}]),angular.module("webApp").controller("HomeCtrl",[function(){}]),angular.module("webApp").controller("IndexCtrl",["$scope","$location","authService",function(a,b,c){a.signOut=function(){c.signOut(),b.path("/home")},a.authentication=c.authentication}]),angular.module("webApp").controller("RegisterCtrl",["$scope","$location","authService","webSettings",function(a,b,c,d){a.savedSuccessfully=!1,a.message="",a.registrationData={exampleWork:"",email:"",username:"",password:""},a.register=function(){c.registerUser(a.registrationData).then(function(){a.savedSuccessfully=!0,a.message="Signing in...";var e={username:a.registrationData.username,password:a.registrationData.password};c.signIn(e).then(function(){b.path(d.successfulSignInPath)},function(b){a.message=b.error_description})},function(b){a.message=b.data.message})}}]),angular.module("webApp").factory("authInterceptorService",["$q","$injector","$location","localStorageService",function(a,b,c,d){var e,f={unauthorizedCount:0};f.request=function(a){a.headers=a.headers||{};var b=d.get("authenticationData");return b&&(a.headers.Authorization="Bearer "+b.token),a},f.responseError=function(d){if(401===d.status&&!d.config.hasRetried){d.config.hasRetried=!0;var e=b.get("authService");return e.refreshToken().then(function(){var b=a.defer();return g(d.config,b),b.promise},function(){return c.path("/signin"),a.reject(d)})}return a.reject(d)};var g=function(a,c){e=e||b.get("$http"),e(a).then(function(a){c.resolve(a)},function(a){c.reject(a)})};return f}]),angular.module("webApp").factory("authService",["$http","$q","localStorageService","webSettings",function(a,b,c,d){var e=d.apiBaseUri,f={};return f.authentication={isAuth:!1,username:""},f.externalAuthData={provider:"",username:"",externalAccessToken:""},f.registerUser=function(b){return f.signOut(),a.post(e+"account/registerUser",b)},f.signIn=function(g){f.signOut();var h="grant_type=password&username="+g.username+"&password="+g.password+"&client_id="+d.clientId,i=b.defer();return a.post(e+"token",h,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){c.set("authenticationData",{token:a.access_token,username:g.username,refreshToken:a.refresh_token}),f.authentication.isAuth=!0,f.authentication.username=g.username,i.resolve(a)}).error(function(a){f.signOut(),i.reject(a)}),i.promise},f.signOut=function(){c.remove("authenticationData"),f.authentication.isAuth=!1,f.authentication.username=""},f.fillAuthData=function(){var a=c.get("authenticationData");a&&(f.authentication.isAuth=!0,f.authentication.username=a.username)},f.refreshToken=function(){var g=b.defer(),h=c.get("authenticationData");if(h){var i="grant_type=refresh_token&refresh_token="+h.refreshToken+"&client_id="+d.clientId;a.post(e+"token",i,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){c.set("authenticationData",{token:a.access_token,username:a.username,refreshToken:a.refresh_token}),g.resolve(a)}).error(function(a){f.signOut(),g.reject(a)})}else g.reject("No authentication data available");return g.promise},f}]),angular.module("webApp").config(["$httpProvider",function(a){a.interceptors.push("authInterceptorService")}]).run(["authService",function(a){a.fillAuthData()}]),angular.module("webApp").controller("AccountCtrl",["$scope",function(a){a.test=1}]),angular.module("webApp").controller("SignOutCtrl",["$location","authService","webSettings",function(a,b,c){b.signOut(),a.path(c.successfulSignOutPath)}]);