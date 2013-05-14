'use strict';

/* Controllers */

angular.module('bedManagement.controllers', []).
    controller(
        'AppCtrl', 
        [
            '$scope',
            '$timeout',
            'stopwatch',
            'patientStore',
            'bedManager',
            'treatmentLibrary',
            'estimator',
            function($scope,$timeout,stopwatch,patientStore,bedManager,treatmentLibrary,estimator) {
                $scope.timer = stopwatch;
                $scope.patientStore = patientStore;
                $scope.bedManager = bedManager;
                $scope.patientStore.reset();
                $scope.bedManager.reset();
                $scope.estimator = estimator;
                $scope.treatmentLibrary = treatmentLibrary;
                $scope.convert_to_minutes = function(seconds){
                    return Math.round(seconds/(60*1000));
                }
                $scope.earliestPatientWaiting = function(){
                    return (stopwatch.data.value + estimator.earliestPatientWaiting())
                }
                
            }
        ]).
  controller('bedMonitorCtrl', ['$scope','$timeout','stopwatch','patientStore','bedManager',function($scope,$timeout,stopwatch,patientStore,bedManager) {
  }]).
  controller('waitingRoomCtrl', ['$scope','$timeout','stopwatch','patientStore','estimator',function($scope,$timeout,stopwatch,patientStore,estimator) {
    
  }]).
  controller('patientRegistrationCtrl', ['$scope','$timeout','stopwatch','patientStore','bedManager','treatmentLibrary',function($scope,$timeout,stopwatch,patientStore,bedManager,treatmentLibrary) {

    $scope.registerPatient = function() {
        patientStore.addPatient(
            $scope.patientName,
            $scope.patientNumber,
            $scope.treatmentType,
            stopwatch.data.value
            );
        $scope.patientName = '';
        $scope.patientNumber = '';
    };
    $scope.registerRandom = function(count){
        var name,number,type,time;
        for(var i=0;i<count;i++) {
            name = 'Patient'+$scope.patientStore.getPatients().length;
            number = Math.floor(Math.random() * 1000000) + 2;
            type = (Math.floor(Math.random() * 10)%3) + 1;
            if(type==1)
                type='A';
            else if(type==2)
                type='B';
            else
                type='C';
            time=stopwatch.data.value;
            patientStore.addPatient(name,number,type,time);
        }
    }
    $scope.assignBed = function(patientNum,treatmentType){
        var time = stopwatch.data.value;
        var duration = $scope.treatmentLibrary.treatmentTime(treatmentType);
        bedManager.assignBed(patientNum,duration,time);
        patientStore.startTreatment(patientNum,time);
    }
  }]).controller('MyCtrl2', [function() {

  }]);