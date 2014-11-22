"use strict";angular.module("webApp",["ngAnimate","ngResource","ngRoute","ngSanitize","LocalStorageModule","toaster"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/home.html",controller:"HomeCtrl"}).when("/signin",{templateUrl:"views/signin.html",controller:"SignInCtrl"}).when("/register",{templateUrl:"views/register.html",controller:"RegisterCtrl"}).when("/orders",{templateUrl:"views/orders.html",controller:"OrdersCtrl"}).when("/refresh",{templateUrl:"views/refresh.html",controller:"RefreshCtrl"}).when("/tokens",{templateUrl:"views/tokens.html",controller:"TokensManagerCtrl"}).when("/associate",{templateUrl:"views/associate.html",controller:"AssociateCtrl"}).otherwise({redirectTo:"/"})}]).constant("webSettings",{apiBaseUri:"http://fifthweek-api.azurewebsites.net/",clientId:"fifthweek.web.1",successfulSignInPath:"/orders"}),angular.module("webApp").controller("SignInCtrl",["$scope","$location","authService","webSettings",function(a,b,c,d){a.signInData={username:"",password:""},a.message="",a.signIn=function(){return c.signIn(a.signInData).then(function(){b.path(d.successfulSignInPath)},function(b){a.message=b.error_description})},a.authExternalProvider=function(b){var c=location.protocol+"//"+location.host+"/authcomplete.html",e=d.apiBaseUri+"api/account/initiateExternalSignIn?provider="+b+"&response_type=token&client_id="+d.clientId+"&redirect_uri="+c;window.$windowScope=a,window.open(e,"Authenticate Account","location=0,status=0,width=600,height=750")},a.authCompletedCallback=function(d){a.$apply(function(){if("False"===d.hasLocalAccount)c.signOut(),c.externalAuthData={provider:d.provider,username:d.externalUsername,externalAccessToken:d.externalAccessToken},b.path("/associate");else{var e={provider:d.provider,externalAccessToken:d.externalAccessToken};c.obtainAccessToken(e).then(function(){b.path("/orders")},function(b){a.message=b.error_description})}})}}]),angular.module("webApp").controller("AssociateCtrl",["$scope","$location","$timeout","authService",function(a,b,c,d){a.savedSuccessfully=!1,a.message="",a.registerData={username:d.externalAuthData.username,provider:d.externalAuthData.provider,externalAccessToken:d.externalAuthData.externalAccessToken},a.registerExternalUser=function(){d.registerExternalUser(a.registerData).then(function(){a.savedSuccessfully=!0,a.message="User has been registered successfully, you will be redicted to orders page in 2 seconds.",e()},function(b){var c=[];for(var d in b.modelState)c.push(b.modelState[d]);a.message="Failed to register user due to: "+c.join(", ")})};var e=function(){var a=c(function(){c.cancel(a),b.path("/orders")},2e3)}}]),angular.module("webApp").controller("HomeCtrl",[function(){}]),angular.module("webApp").controller("IndexCtrl",["$scope","$location","authService",function(a,b,c){a.signOut=function(){c.signOut(),b.path("/home")},a.authentication=c.authentication}]),angular.module("webApp").controller("OrdersCtrl",["$scope","ordersService",function(a,b){a.orders=[],b.getOrders().then(function(b){a.orders=b.data},function(){})}]),angular.module("webApp").controller("RefreshCtrl",["$scope","$location","authService",function(a,b,c){a.authentication=c.authentication,a.tokenRefreshed=!1,a.tokenResponse=null,a.refreshToken=function(){c.refreshToken().then(function(b){a.tokenRefreshed=!0,a.tokenResponse=b},function(){b.path("/signin")})}}]),angular.module("webApp").controller("RegisterCtrl",["$scope","$location","$timeout","authService",function(a,b,c,d){a.savedSuccessfully=!1,a.message="",a.registrationData={username:"",password:"",confirmPassword:""},a.register=function(){d.registerInternalUser(a.registrationData).then(function(){a.savedSuccessfully=!0,a.message="User has been registered successfully, you will be redicted to the sign in page in 2 seconds.",e()},function(b){var c=[];for(var d in b.data.modelState)for(var e=0;e<b.data.modelState[d].length;e++)c.push(b.data.modelState[d][e]);a.message=c.join("<br/>")})};var e=function(){var a=c(function(){c.cancel(a),b.path("/signin")},2e3)}}]),angular.module("webApp").controller("TokensManagerCtrl",["$scope","tokensManagerService","toaster",function(a,b,c){a.refreshTokens=[],b.getRefreshTokens().then(function(b){a.refreshTokens=b.data},function(a){c.pop("error","Error",a.data.message)}),a.deleteRefreshTokens=function(d,e){e=window.encodeURIComponent(e),b.deleteRefreshTokens(e).then(function(){a.refreshTokens.splice(d,1)},function(a){c.pop("error","Error",a.data.message)})}}]),angular.module("webApp").factory("authInterceptorService",["$q","$injector","$location","localStorageService",function(a,b,c,d){var e,f={unauthorizedCount:0};f.request=function(a){a.headers=a.headers||{};var b=d.get("authenticationData");return b&&(a.headers.Authorization="Bearer "+b.token),a},f.responseError=function(d){if(401===d.status&&!d.config.hasRetried){d.config.hasRetried=!0;var e=b.get("authService");return e.refreshToken().then(function(){var b=a.defer();return g(d.config,b),b.promise},function(){return c.path("/signin"),a.reject(d)})}return a.reject(d)};var g=function(a,c){e=e||b.get("$http"),e(a).then(function(a){c.resolve(a)},function(a){c.reject(a)})};return f}]),angular.module("webApp").factory("authService",["$http","$q","localStorageService","webSettings",function(a,b,c,d){var e=d.apiBaseUri,f={};f.authentication={isAuth:!1,username:""},f.externalAuthData={provider:"",username:"",externalAccessToken:""},f.registerInternalUser=function(b){return f.signOut(),a.post(e+"api/account/registerInternalUser",b)},f.signIn=function(g){var h="grant_type=password&username="+g.username+"&password="+g.password+"&client_id="+d.clientId,i=b.defer();return a.post(e+"token",h,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){c.set("authenticationData",{token:a.access_token,username:g.username,refreshToken:a.refresh_token}),f.authentication.isAuth=!0,f.authentication.username=g.username,i.resolve(a)}).error(function(a){f.signOut(),i.reject(a)}),i.promise},f.signOut=function(){c.remove("authenticationData"),f.authentication.isAuth=!1,f.authentication.username=""},f.fillAuthData=function(){var a=c.get("authenticationData");a&&(f.authentication.isAuth=!0,f.authentication.username=a.username)},f.refreshToken=function(){var g=b.defer(),h=c.get("authenticationData");if(h){var i="grant_type=refresh_token&refresh_token="+h.refreshToken+"&client_id="+d.clientId;a.post(e+"token",i,{headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(a){c.set("authenticationData",{token:a.access_token,username:a.username,refreshToken:a.refresh_token}),g.resolve(a)}).error(function(a){f.signOut(),g.reject(a)})}else g.reject("No authentication data available");return g.promise};var g=function(a,d){var e=b.defer();return d(a).success(function(a){c.set("authenticationData",{token:a.access_token,username:a.username,refreshToken:a.refresh_token}),f.authentication.isAuth=!0,f.authentication.username=a.username,e.resolve(a)}).error(function(a){f.signOut(),e.reject(a)}),e.promise};return f.obtainAccessToken=function(b){return g(b,function(b){return a.get(e+"api/account/obtainAccessTokenForExternalUser",{params:{provider:b.provider,externalAccessToken:b.externalAccessToken}})})},f.registerExternalUser=function(b){return g(b,function(b){return a.post(e+"api/account/registerExternalUser",b)})},f}]),angular.module("webApp").factory("ordersService",["$http","webSettings",function(a,b){var c=b.apiBaseUri,d={};return d.getOrders=function(){return a.get(c+"api/orders").then(function(a){return a})},d}]),angular.module("webApp").factory("tokensManagerService",["$http","webSettings",function(a,b){var c=b.apiBaseUri,d={};return d.getRefreshTokens=function(){return a.get(c+"api/refreshTokens").then(function(a){return a})},d.deleteRefreshTokens=function(b){return a.delete(c+"api/refreshTokens/?tokenid="+b).then(function(a){return a})},d}]);