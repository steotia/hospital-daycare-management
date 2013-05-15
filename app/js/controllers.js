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
                $scope.callToReception = function(patientNumber){
                    patientStore.callToReception(patientNumber);
                }
                $scope.freeIn30mins = function(){
                    var count=0;
                    var bed;
                    var beds = bedManager.getBeds();
                    for(var i=0;i<beds.length;i++){
                        bed = beds[i];
                        if(bed.warn==true){
                            count++;
                        }
                    }
                    return count;
                }
                
            }
        ]).
  controller('bedMonitorCtrl', ['$scope','$timeout','stopwatch','patientStore','bedManager',function($scope,$timeout,stopwatch,patientStore,bedManager) {
    $scope.checkBed = function(patientNumber){
        var bed = bedManager.getBed(patientNumber);
        bed.checkBed();
    }
  }]).
  controller('waitingRoomCtrl', ['$scope','$timeout','stopwatch','patientStore','estimator',function($scope,$timeout,stopwatch,patientStore,estimator) {
    
  }]).
  controller('patientRegistrationCtrl', ['$scope','$timeout','stopwatch','patientStore','bedManager','treatmentLibrary',function($scope,$timeout,stopwatch,patientStore,bedManager,treatmentLibrary) {

    $scope.checkMedicine = function(patientNumber){
        patientStore.checkMedicine(patientNumber);
    }
    $scope.mixMedicine = function(patientNumber){
        patientStore.mixMedicine(patientNumber);
    }
    $scope.fetchRecord = function(patientNumber){
        patientStore.fetchRecord(patientNumber);
    }
    $scope.registerPatient = function() {
        /*
        patientStore.addPatient(
            $scope.patientName,
            $scope.patientNumber,
            $scope.treatmentType,
            stopwatch.data.value
            );*/
        registerRandom(1,$scope.patientNumber);
        $scope.patientName = '';
        $scope.patientNumber = '';
    };
    var registerRandom = function(count,patientNumber=null){
        var name,number,type,time;
        for(var i=0;i<count;i++) {
            name = 'Patient'+$scope.patientStore.getPatients().length;
            if(patientNumber){
                number = patientNumber;
            } else {
                number = Math.floor(Math.random() * 1000000) + 2;
            }
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
    $scope.registerRandom = registerRandom;
    $scope.assignBed = function(patientNum,treatmentType){
        var time = stopwatch.data.value;
        var duration = $scope.treatmentLibrary.treatmentTime(treatmentType);
        bedManager.assignBed(patientNum,duration,time);
        patientStore.startTreatment(patientNum,time);
    }
  }]).controller('MyCtrl2', [function() {

  }]);