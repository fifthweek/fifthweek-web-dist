"use strict";angular.module("webApp",["mgcrea.ngStrap","ngAnimate","ngResource","ngRoute","ngSanitize","LocalStorageModule","ng-focus","toaster","angular-loading-bar","angulartics","angulartics.google.analytics","angulartics.kissmetrics"]).constant("fifthweekConstants",{apiBaseUri:"https://api.fifthweek.com/",clientId:"fifthweek.web.1",homePage:"/",signInPage:"/signin",signOutPage:"/signout",registerPage:"/register",accountPage:"/account",dashboardPage:"/dashboard",feedbackPage:"/dashboard/feedback",notAuthorizedPage:"/notauthorized"}).config(["$routeProvider","fifthweekConstants",function(a,b){a.when(b.homePage,{templateUrl:"views/home.html",controller:"HomeCtrl"}).when(b.signInPage,{templateUrl:"views/signin.html",controller:"SignInCtrl"}).when(b.registerPage,{templateUrl:"views/register.html",controller:"RegisterCtrl"}).when(b.accountPage,{templateUrl:"views/account.html",controller:"AccountCtrl",access:{loginRequired:!0}}).when(b.dashboardPage,{templateUrl:"views/dashboard/demonstration.html",access:{loginRequired:!0}}).when(b.feedbackPage,{templateUrl:"views/dashboard/feedback.html",access:{loginRequired:!0}}).when(b.signOutPage,{templateUrl:"views/signout.html",controller:"SignOutCtrl"}).when(b.notAuthorizedPage,{redirectTo:b.homePage}).otherwise({redirectTo:b.homePage})}]),angular.module("webApp").controller("SignInCtrl",["$scope","$location","authenticationService","fifthweekConstants",function(a,b,c,d){a.signInData={username:"",password:""},a.message="",a.signIn=function(){return c.signIn(a.signInData).then(function(){b.path(d.dashboardPage)},function(b){a.message=b.error_description})}}]),angular.module("webApp").controller("HomeCtrl",[function(){}]),angular.module("webApp").controller("IndexCtrl",["$scope","$location","authenticationService","fifthweekConstants",function(a,b,c,d){a.signOut=function(){c.signOut(),b.path(d.homePage)},a.currentUser=c.currentUser}]),angular.module("webApp").controller("RegisterCtrl",["$scope","$location","$analytics","authenticationService","fifthweekConstants",function(a,b,c,d,e){d.currentUser.authenticated===!0&&b.path(e.dashboardPage),a.savedSuccessfully=!1,a.message="",a.registrationData={exampleWork:"",email:"",username:"",password:""},a.register=function(){var f=function(){return{"example work":a.registrationData.exampleWork,"email address":a.registrationData.email,username:a.registrationData.username}},g=function(b){c.eventTrack("Registration failed",{"error message":b}),a.message=b};c.eventTrack("Submitted registration",f()),d.registerUser(a.registrationData).then(function(){a.savedSuccessfully=!0,a.message="Signing in...";var h={username:a.registrationData.username,password:a.registrationData.password};return d.signIn(h).then(function(){c.setUserProperties(f()),c.eventTrack("Registration successful"),b.path(e.dashboardPage)},function(a){g(a.error_description)})},function(a){g(a.data.message)})}}]),angular.module("webApp").factory("authenticationInterceptor",["$q","$injector","$location","localStorageService","fifthweekConstants",function(a,b,c,d,e){var f,g={unauthorizedCount:0};g.request=function(a){a.headers=a.headers||{};var b=d.get("authenticationData");return b&&(a.headers.Authorization="Bearer "+b.token),a},g.responseError=function(d){if(401===d.status&&!d.config.hasRetried){d.config.hasRetried=!0;var f=b.get("authenticationService");return f.refreshToken().then(function(){var b=a.defer();return h(d.config,b),b.promise},function(){return c.path(e.signInPage),a.reject(d)})}return a.reject(d)};var h=function(a,c){f=f||b.get("$http"),f(a).then(function(a){c.resolve(a)},function(a){c.reject(a)})};return g}]),angular.module("webApp").factory("authenticationService",["$http","$q","$analytics","localStorageService","fifthweekConstants",function(a,b,c,d,e){var f=e.apiBaseUri,g={};g.currentUser={authenticated:!1,username:"",permissions:[]},g.init=function(){var a=d.get("authenticationData");a&&(g.currentUser.authenticated=!0,g.currentUser.username=a.username)},g.registerUser=function(b){return g.signOut(),a.post(f+"membership/registrations",b)},g.signIn=function(i){g.signOut();var j="grant_type=password&username="+i.username+"&password="+i.password+"&client_id="+e.clientId,k=b.defer();return a.post(f+"token",j,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){var b=h(i.username);d.set("authenticationData",{token:a.access_token,username:b,refreshToken:a.refresh_token}),g.currentUser.authenticated=!0,g.currentUser.username=b,c.setUsername(a.user_id),k.resolve(a)}).error(function(a){g.signOut(),k.reject(a)}),k.promise},g.signOut=function(){d.remove("authenticationData"),g.currentUser.authenticated=!1,g.currentUser.username=""},g.refreshToken=function(){var c=b.defer(),h=d.get("authenticationData");if(h){var i="grant_type=refresh_token&refresh_token="+h.refreshToken+"&client_id="+e.clientId;a.post(f+"token",i,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){d.set("authenticationData",{token:a.access_token,username:a.username,refreshToken:a.refresh_token}),c.resolve(a)}).error(function(a){g.signOut(),c.reject(a)})}else c.reject("No authentication data available");return c.promise};var h=function(a){return a.trim().toLowerCase()};return g}]),angular.module("webApp").constant("authorizationServiceConstants",{authorizationResult:{authorized:"authorized",loginRequired:"loginRequired",notAuthorized:"notAuthorized"},roleCheckType:{atLeastOne:"atLeastOne",all:"all"}}).factory("authorizationService",["authenticationService","authorizationServiceConstants",function(a,b){var c={};return c.authorize=function(c,d,e){var f=b.authorizationResult.authorized,g=!0;if(e=e||b.roleCheckType.atLeastOne,c===!0&&a.currentUser.authenticated===!1)f=b.authorizationResult.loginRequired;else if(c!==!0||a.currentUser.authenticated===!1||void 0!==d&&0!==d.length){if(d){var h=[];angular.forEach(a.currentUser.roles,function(a){h.push(a.toLowerCase())});for(var i=0;i<d.length;i+=1){var j=d[i].toLowerCase();if(e===b.roleCheckType.all){if(g=g&&h.indexOf(j)>-1,g===!1)break}else if(e===b.roleCheckType.atLeastOne&&(g=h.indexOf(j)>-1))break}f=g?b.authorizationResult.authorized:b.authorizationResult.notAuthorized}}else f=b.authorizationResult.authorized;return f},c}]),angular.module("webApp").config(["$httpProvider",function(a){a.interceptors.push("authenticationInterceptor")}]).run(["$rootScope","authenticationService","routeChangeAuthorizationHandler",function(a,b,c){b.init(),a.$on("$routeChangeStart",function(a,b){c.handleRouteChangeStart(b)})}]),angular.module("webApp").controller("AccountCtrl",["$scope",function(a){a.test=1}]),angular.module("webApp").controller("SignOutCtrl",["$location","authenticationService","fifthweekConstants",function(a,b,c){b.signOut(),a.path(c.signInPage)}]),angular.module("webApp").directive("roles",["authorizationService","authorizationServiceConstants",function(a,b){return{restrict:"A",link:function(c,d,e){var f=function(){d.removeClass("hidden")},g=function(){d.addClass("hidden")},h=function(c){var d;c&&f(),d=a.authorize(!0,i,e.roleCheckType),d===b.authorizationResult.authorized?f():g()},i=e.roles.split(/[\s,]+/);i.length>0&&h(!0)}}}]),angular.module("webApp").directive("username",["$q","$timeout",function(a,b){return{require:"ngModel",link:function(c,d,e,f){f.$asyncValidators.username=function(c){if(f.$isEmpty(c))return a.when();var d=a.defer();return b(function(){d.resolve()},1e3),d.promise}}}}]),angular.module("webApp").directive("vimeoVideo",["$analytics",function(a){return{link:function(b,c,d){var e=$f(c[0]);e.addEvent("ready",function(){e.addEvent("play",function(){a.eventTrack("Played video",{"video title":d.title})}),e.addEvent("pause",function(){a.eventTrack("Paused video",{"video title":d.title})}),e.addEvent("finish",function(){a.eventTrack("Finished video",{"video title":d.title})})})}}}]),angular.module("webApp").factory("routeChangeAuthorizationHandler",["authorizationService","authorizationServiceConstants","$rootScope","$location","fifthweekConstants",function(a,b,c,d,e){var f,g={},h=!1;return g.handleRouteChangeStart=function(c){if(h&&c.originalPath!==e.signInPage)h=!1,void 0!==c.access&&c.access.loginRequired===!0&&d.path(f).replace();else if(void 0!==c.access){var g=a.authorize(c.access.loginRequired,c.access.roles,c.access.roleCheckType);g===b.authorizationResult.loginRequired?(h=!0,f=c.originalPath,d.path(e.signInPage).replace()):g===b.authorizationResult.notAuthorized&&d.path(e.notAuthorizedPage).replace()}},g}]),function(a){a.module("angulartics.kissmetrics",["angulartics"]).config(["$analyticsProvider",function(a){window._kmq="undefined"==typeof _kmq?[]:_kmq,a.registerPageTrack(function(a){window._kmq.push(["record","Pageview",{Page:a}])}),a.registerEventTrack(function(a,b){window._kmq.push(["record",a,b])}),a.registerSetUsername(function(a){window._kmq.push(["identify",a])}),a.registerSetUserProperties(function(a){window._kmq.push(["set",a])})}])}(angular),angular.module("webApp").run(["$analytics",function(a){function b(a){a=a.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var b=new RegExp("[\\?&]"+a+"=([^&#]*)"),c=b.exec(location.search);return null===c?"":decodeURIComponent(c[1].replace(/\+/g," "))}var c=b("emailed_to");c.length>0&&a.setUserProperties({"last opened email from":c})}]);