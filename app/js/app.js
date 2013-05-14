'use strict';


// Declare app level module which depends on filters, and services
angular.module('bedManagement', ['bedManagement.filters', 'bedManagement.services', 'bedManagement.directives', 'bedManagement.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/bed_dashboard.html', {templateUrl: 'partials/bed_dashboard.html'});
    $routeProvider.when('/bed_monitor.html', {templateUrl: 'partials/bed_monitor.html', controller: 'bedMonitorCtrl'});
    $routeProvider.when('/patient_registration.html', {templateUrl: 'partials/patient_registration.html', controller: 'patientRegistrationCtrl'});
    $routeProvider.when('/waiting_view.html', {templateUrl: 'partials/waiting_view.html', controller: 'waitingRoomCtrl'});
    //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/bed_monitor.html'});
  }]);
