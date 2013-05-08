'use strict';


// Declare app level module which depends on filters, and services
angular.module('bedManagement', ['bedManagement.filters', 'bedManagement.services', 'bedManagement.directives', 'bedManagement.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/bed_dashboard.html', {templateUrl: 'partials/bed_dashboard.html'});
    $routeProvider.when('/patient_registration.html', {templateUrl: 'partials/patient_registration.html'});
    $routeProvider.when('/waiting_view.html', {templateUrl: 'partials/waiting_view.html'});
    //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/bed_dashboard.html'});
  }]);
