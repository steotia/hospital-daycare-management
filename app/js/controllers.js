'use strict';

/* Controllers */

angular.module('bedManagement.controllers', []).
  controller('bedDashboardCtrl', ['$scope','$timeout','stopwatch',function($scope,$timeout,stopwatch) {
  	$scope.timer = stopwatch;
  	$scope.beds = [];
  	for(var i=0;i<6;i++) {
  		$scope.beds.push({
  			number: i+1,
  			state: 'free',
  			freeAt:0,
  			assignedAt: null,
  			assignedPatient: 'unassigned',
  			alertStatus: 'alert-success',
  			checkedAt:null,
  			completion:100
  		});
	}
	$scope.freeBeds = function(){
		var count = 0;
    	angular.forEach($scope.beds, function(bed) {
      		count += bed.state=='free' ? 1 : 0;
    	});
    	return count;
	};
	$scope.delayRelease = function(number){
		var bedFound = false;
		angular.forEach($scope.beds, function(bed) {
			if(!bedFound && bed.number==number){
				var current_time = parseInt($scope.timer.data.value);
				var diff_time = (parseInt(bed.freeAt)-current_time);
				if(diff_time>0){
					bed.freeAt += 30;
				}
				else {
					bed.freeAt = current_time+30;
				}
					bed.state='taken';
					bed.alertStatus='alert-error';
					bed.request_check=false;
					bed.checkedAt = current_time;
			}
		});	
	}
	$scope.releaseBed = function(number){
		var bedFound = false;
		var treatedPatient = null;
		angular.forEach($scope.beds, function(bed) {
			if(!bedFound && bed.number==number){
				treatedPatient	=	bed.assignedPatient
				bedFound=true;
				bed.state='free';
				bed.freeAt = 0;
				bed.assignedAt = null;
				bed.assignedPatient = 'unassigned';
				bed.alertStatus='alert-success';
				bed.checkedAt = null;
				bed.completion	=	100;

			}
		});	
		angular.forEach($scope.patients, function(patient) {
			if(patient.patientNumber==treatedPatient){
				patient.endedTreatmentAt	=	$scope.timer.data.value;
        		patient.message = '';
			}
		});
	}
	$scope.assignBed = function(patientNum,treatmentType){
  		console.log('assignBed');
		var bedFound = false;
		var offset	=	0;
		if(treatmentType=='A'){
			offset	=	60;
		}else if(treatmentType=='B'){
			offset	=	120;
		}else{
			offset	=	180;
		}
		//var patientNum = $scope.assignPatientNumber;
		angular.forEach($scope.beds, function(bed) {
			if(!bedFound && bed.state=='free'){
				bedFound=true;
				bed.assignedPatient = patientNum;
				bed.assignedAt = $scope.timer.data.value;
				bed.freeAt = bed.assignedAt + offset;
				console.log('Bed will be freed at:'+bed.freeAt);
				bed.state='taken';
				bed.alertStatus='alert-error';
				bed.checkedAt = bed.assignedAt;
			}
		});
		angular.forEach($scope.patients, function(patient) {
			if(patient.patientNumber==patientNum){
				patient.startedTreatmentAt	=	$scope.timer.data.value;
				patient.probableBed = null;
				patient.treated	=	true;
			}
		});
	}

	var checkEv;

	function checkBeds() {
        checkEv = $timeout(function() {
        	angular.forEach($scope.beds, function(bed) {
        		var current_time = parseInt($scope.timer.data.value);
        		if(bed.state=='taken'){
        			if(current_time>bed.freeAt){
        				bed.state='waiting to release';
        				bed.alertStatus='alert-warning';
        			}else if((bed.freeAt-current_time)<30){
        				bed.alertStatus='alert-warning';
        			}
        		}
        		if((bed.state!='free')&&(current_time-bed.checkedAt)>30){
        			bed.request_check=true;
        		} else {
        			bed.request_check=false;
        		}
        		if(bed.state!='free'){
        			bed.completion=(current_time-bed.assignedAt)*100/(bed.freeAt-bed.assignedAt);
        			if(bed.completion>100)
        				bed.completion=100;
        		}
        	});
        	$scope.beds.sort(function(a,b){
        		return a.completion<b.completion;
        	});
        	var bed_index=0;
        	var time_diff;
        	//var taken_beds=[];
        	angular.forEach($scope.patients, function(patient,index) {
        		var bed = getNextUsableBed(bed_index);
        		if(!patient.treated&&bed){
        			//if(bed.state=='free'||bed.state=='waiting to release'){
        			patient.alertStatus = bed.alertStatus;
        			patient.probableBed = bed.number;
        			bed_index+=1;
        			time_diff = (parseInt($scope.timer.data.value) - bed.freeAt);
        			if(time_diff>-30){
        				patient.message = '< 30m'
        			} else if(time_diff>-60){
        				patient.message = '30m - 1hr'
        			} else if(time_diff>-120) {
        				patient.message = '1hr - 2hr'
        			}
        			//}
        		}
        		else {
        			patient.alertStatus = null;
        			patient.message = '';
        		}
        	});
            checkBeds();
        }, 1000);
    };	

    checkBeds();

    function getNextUsableBed(index){
    	var current_time = parseInt($scope.timer.data.value);
    	var bed,time_diff;
    	var bed_found=false;
    	while(index<$scope.beds.length&&index>=0){
    		bed = $scope.beds[index];
    		index+=1;
    		time_diff	=	current_time-bed.freeAt;
    		if(bed.freeAt==0||(time_diff>-120)){
    			bed_found=true;
    			break;	
    		}
    	}
    	return (bed_found&&bed)||null;
    }

    function addPatient(name,number,type,time){
    	$scope.patients.push(
	    	{
	    		patientName:name,
	    		patientNumber:number,
	    		treatmentType:type,
	    		registrationTime:time,
	    		startedTreatmentAt:null,
	    		treated:false
	    	});
    }

  	$scope.patients	=	[];

  	$scope.registerPatient = function() {
  		console.log('registerPatient');
	    addPatient(
	    	$scope.patientName,
	    	$scope.patientNumber,
	    	$scope.treatmentType,
	    	$scope.timer.data.value
	    	);
	    $scope.patientName = '';
	    $scope.patientNumber = '';
  	};
  	$scope.waiting = function() {
	    var count = 0;
	    angular.forEach($scope.patients, function(patient) {
	      count += patient.startedTreatmentAt==null ? 1 : 0;
	    });
	    return count;
  	};
  	$scope.registerRandom = function(count){
  		var name,number,type,time;
  		for(var i=0;i<count;i++) {
  			name = 'Patient'+i+1;
  			number = Math.floor(Math.random() * 1000000) + 2;
  			type = (Math.floor(Math.random() * 10)%3) + 1;
  			if(type==1)
  				type='A';
  			else if(type==2)
  				type='B';
  			else
  				type='C';
  			time=$scope.timer.data.value;
  			//1000+Math.floor(Math.random() * 1000);
  			addPatient(name,number,type,time);
  		}
  	}

  }])
  .controller('MyCtrl2', [function() {

  }]);