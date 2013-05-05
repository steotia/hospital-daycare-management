'use strict';


// Declare app level module which depends on filters, and services
angular.module('bedManagement', ['bedManagement.filters', 'bedManagement.services', 'bedManagement.directives', 'bedManagement.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/bed_dashboard', {templateUrl: 'partials/bed_dashboard.html', controller: 'bedDashboardCtrl'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
