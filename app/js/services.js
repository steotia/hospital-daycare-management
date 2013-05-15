'use strict'; 

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bedManagement.services', []).
  value('version', '0.1').
  constant('SW_DELAI', 1000).
  constant('START_TIME', (new Date().getTime())).
  constant('BED_COUNT',6).
  constant('SNOOZE_LENGTH',30*60*1000).
  constant('A_TREATMENT',2*60*60*1000).
  constant('B_TREATMENT',4*60*60*1000).
  constant('C_TREATMENT',6*60*60*1000).
  factory('stopwatch', function (SW_DELAI,START_TIME,$timeout,$filter) {
    var data = { 
            value: START_TIME,
            start_time: START_TIME,
            laps: []
        },
        stopwatch = null;
        
    var start = function (val) {;
        stopwatch = $timeout(function() {
        	data.value+=val*SW_DELAI;
            start(val);
        }, SW_DELAI);
    };

    var stop = function () {
        $timeout.cancel(stopwatch);
        stopwatch = null;
    };

    var reset = function () {
        stop()
        data.value = START_TIME;
        data.laps = [];
    };

    return {
        data: data,
        start: start,
        stop: stop,
        reset: reset
    };
}).factory('treatmentLibrary',function(A_TREATMENT,B_TREATMENT,C_TREATMENT){
    var treatments = function(){
        return ['A','B','C'];
    }
    var treatmentTime = function(treatmentType){
        var duration;
        switch(treatmentType){
            case 'A':
                duration = A_TREATMENT;
                break;
            case 'B':
                duration = B_TREATMENT;
                break;
            case 'C':
                duration = C_TREATMENT;
                break;
            default:
                duration = B_TREATMENT;
        }
        return duration;
    }
    return {
        treatments: treatments,
        treatmentTime: treatmentTime
    }
}).factory('patientStore',function(){
    var patients = []; 

    var getPatients = function(){
        return patients;
    }

    var reset = function(){
        patients = [];
    }
    var addPatient = function(name,number,type,time){
        patients.push( 
            {
                patientName:name,
                patientNumber:number,
                treatmentType:type,
                registrationTime:time,
                startedTreatmentAt:null,
                treated:false
            });
    };

    var waiting = function() {
        var count = 0;
        angular.forEach(patients, function(patient) {

          count += patient.startedTreatmentAt==null ? 1 : 0;
        });
        return count;
    };

    var treated = function() {
        var count = 0;
        angular.forEach(patients, function(patient) {
          count += patient.endedTreatmentAt!=null ? 1 : 0;
        });
        return count;
    };
    /*
    var registerRandom = function(count){
        var name,number,type,time;
        var fName,sName;
        for(var i=0;i<count;i++) {
            number = Math.floor(Math.random() * 1000000) + 2;
            fName = Math.floor(Math.random() * 1000000) % 15
            name = 'Patient'+patients.length;
            type = (Math.floor(Math.random() * 10)%3) + 1;
            if(type==1)
                type='A';
            else if(type==2)
                type='B';
            else
                type='C';
            time=stopwatch.data.value;
            //1000+Math.floor(Math.random() * 1000);
            addPatient(name,number,type,time);
        }
    };
    */
    function patientIndex(patientNumber){
        var index=null;
        for(var i=0;i<patients.length;i++){
            if(patients[i].patientNumber==patientNumber){
                index=i;
                break;
            }
        }   
        return index; 
    }
    var startTreatment = function(patientNumber,time){
        var index = patientIndex(patientNumber);
        if(index!=null){
            patients[index].startedTreatmentAt = time;
            patients[index].beacon = false;
        }
    }
    var endTreatment = function(patientNumber,time){
        var index = patientIndex(patientNumber);
        if(index!=null){
            patients[index].endedTreatmentAt = time;
        }
    }  
    var callToReception = function(patientNumber){
        var index = patientIndex(patientNumber);
        if(index!=null){
            patients[index].beacon = true;
        }
    }
    //TODO add these methods into the prototype
    var checkMedicine = function(patientNumber){
        var index = patientIndex(patientNumber);
        if(index!=null){
            patients[index].checkMedicine = true;
        }
    }
    var mixMedicine = function(patientNumber){
        var index = patientIndex(patientNumber);
        if(index!=null){
            patients[index].mixMedicine = true;
        }
    }
    var fetchRecord = function(patientNumber){
        var index = patientIndex(patientNumber);
        if(index!=null){
            patients[index].fetchRecord = true;
        }
    }
    return {
        reset: reset,
        getPatients: getPatients,
        addPatient: addPatient,
        waiting: waiting,
        treated: treated,
        startTreatment: startTreatment,
        endTreatment: endTreatment,
        callToReception: callToReception,
        checkMedicine: checkMedicine,
        mixMedicine: mixMedicine,
        fetchRecord: fetchRecord
    }
  }).factory('bedManager',function(SW_DELAI,BED_COUNT,SNOOZE_LENGTH,$timeout,stopwatch,patientStore){
    var beds = [];
    function Bed(number){
        this.number = number;
        this.alertStatus = null;
        this.assignedPatientNumber = 'unassigned';
        this.assignedAt = null;
        this.freeAt = stopwatch.data.value;;
        this.checkedAt = null; 
        this.checkRequired = false;
        this.completion = 100;
        this.warn = false;
        // TODO
        Bed.prototype.reset = function(){
            this.alertStatus = null;
            this.assignedPatientNumber =  'unassigned';
            this.assignedAt = null;
            this.freeAt = stopwatch.data.value;
            this.checkedAt = null;
            this.warn = false;
        }
        Bed.prototype.delayRelease = function(){
            if(this.completion==100){
                this.freeAt = stopwatch.data.value;
            }
            this.freeAt+=SNOOZE_LENGTH;
            this.checkBed();
        }
        Bed.prototype.checkBed = function(time){
            this.checkedAt = stopwatch.data.value; 
            this.checkRequired = false;
        }
        Bed.prototype.timeLeft = function(){
            var left = this.freeAt-stopwatch.data.value;
            if(left<0)
                left = 0;
            return left;
        }
    }
    StateMachine.create({
            target: Bed.prototype,
            initial: 'none',
            events: [
                { name: 'commission',   from: 'none',   to: 'free'  },
                { name: 'assign',   from: 'free',       to: 'assigned'  },
                { name: 'release',   from: 'assigned',       to: 'free'  }
            ],
            callbacks: {
                oncommission:  function(event, from, to, msg) { 
                    this.alertStatus="alert-success"; 
                },
                onassign:  function(event, from, to, patientNumber,expectedDuration,time) {
                    this.alertStatus="alert-error"; 
                    this.assignedPatientNumber = patientNumber;
                    this.assignedAt = time;
                    this.freeAt = time+expectedDuration;
                    this.checkedAt = time; 
                },
                onrelease:  function(event, from, to) {
                    patientStore.endTreatment(this.assignedPatientNumber,stopwatch.data.value);
                    this.reset();
                    this.alertStatus="alert-success"; 
                    this.completion = 100;
                }
            }
        });
    var getBeds = function(){
        return beds;
    }
    var reset = function(){
        for(var i=0;i<BED_COUNT;i++) {
            var bed = new Bed(i+1);
            bed.commission();
            beds.push(bed);
        }
    }
    function getFreeBed(){
        var freeBed;
        for(var i=0;i<beds.length;i++) {
            if(beds[i].current=='free'){
                freeBed=beds[i];
                break;
            }
        }
        return freeBed;
    }
    var freeBeds = function(){
        var count = 0;
        for(var i=0;i<beds.length;i++) {
            count += beds[i].current=='free' ? 1 : 0;
        }
        return count;
    }
    var assignBed = function(patientNumber,expectedDuration,time){
        var freeBed = getFreeBed();
        if(freeBed){
            freeBed.assign(patientNumber,expectedDuration,time);
        } 
        return freeBed;
    }
    var getBed = function(patientNumber){
        var assignedBed=null;
        for(var i=0;i<beds.length;i++) {
            if(beds[i].assignedPatientNumber==patientNumber){
                assignedBed=beds[i];
                break;
            }
        }
        return assignedBed;
    }
    var checkEv;
    function checkBeds() {
        checkEv = $timeout(function() {
            var current_time = stopwatch.data.value;
            angular.forEach(beds, function(bed) {
                if((bed.current!='free')&&(current_time-bed.checkedAt)>(SNOOZE_LENGTH-1)){
                    bed.checkRequired=true;
                } else {
                    bed.checkRequired=false;
                }   
                if(bed.current!='free'){
                    bed.completion=(current_time-bed.assignedAt)*100/(bed.freeAt-bed.assignedAt);
                    if(bed.completion>100)
                        bed.completion=100;
                    if(bed.timeLeft()<SNOOZE_LENGTH){
                        bed.warn=true;
                    } else {
                        bed.warn=false;
                    }
                } 
            });
            checkBeds();
        }, SW_DELAI);
    }
    checkBeds();
    return {
        reset: reset,
        getBeds: getBeds,
        freeBeds: freeBeds,
        assignBed: assignBed,
        getBed: getBed 
    }
  }).factory('estimator',function($timeout,SW_DELAI,stopwatch,bedManager,patientStore,treatmentLibrary){
    var check;
    var waitingArray;
    function Bucket(lower,upper,msg){
        this.patients = [];
        this.lower = lower*60*SW_DELAI;
        this.upper = upper*60*SW_DELAI;
        this.msg = msg;
        Bucket.prototype.fitBucket = function(duration){
            return fitFunction(this.lower,this.upper,duration);
        }
        Bucket.prototype.addPatient = function(patient){
            this.patients.push(patient);
        }
        Bucket.prototype.reset = function(patient){
            this.patients = [];
        }
        Bucket.prototype.getPatientNames = function(){
            var names=[];
            for(var i=0;i<this.patients.length;i++){
                names.push(this.patients[i].patientName);
            }
            return names;
        }
        Bucket.prototype.getPatients = function(){
            return this.patients;
        }
    }
    var buckets = [
        new Bucket(-1,30,'less than 30 min'),
        new Bucket(30,60,'30 min - 1 hr'),
        new Bucket(60,120,'1 hr - 2 hr'),
        new Bucket(120,240,'2 hr - 4 hr'),
        new Bucket(240,2400,'more than 4 hrs')
    ]
    function resetBuckets(){
        for(var i=0;i<buckets.length;i++){
            buckets[i].reset();
        }
    }

    function fitFunction(lower,upper,val){
        if(val>lower&&val<=upper){
            return true;
        } else {
            return false;
        }
    }

    function addInBucket(patient){
        for(var i=0;i<buckets.length;i++){
            var bucket = buckets[i];
            var waitingTime = patient.waitingTime;
            if(bucket.fitBucket(waitingTime)){
                bucket.addPatient(patient);
                break;
            }
        }
    }

    function waitingMessage(time){
        //TODO constantize 60
        var minutes = time/(60*SW_DELAI);
        var message;
        if(minutes<=30){
            message = 'less than 30 min';
        } else if(minutes>30&&minutes<=60){
            message = '30 min - 1 hr';
        } else if(minutes>60&&minutes<=120){
            message = '1 hr - 2 hr';
        } else if(minutes>120&&minutes<=240){
            message = '2 hr - 4 hr';
        } else {
            message = 'more than 4 hrs';
        }
        return message
    }
    function getBuckets(){
        return buckets;
    }
    function estimate(){
        check = $timeout(function() {
            //console.log(stopwatch.data.value);
            var beds = bedManager.getBeds();
            var patients = patientStore.getPatients();
            resetBuckets();
            waitingArray = [];
            for(var i=0;i<beds.length;i++){
                waitingArray.push(beds[i].timeLeft());
            }
            function sortingFunction(a,b){return a-b}
            waitingArray.sort(sortingFunction);
            var j=0;
            while(j<patients.length){
                //console.log(waitingArray);
                for(i=0;i<waitingArray.length&&j<patients.length;j++){
                    var patient = patients[j];
                    var waitingTime = waitingArray[i];
                    if(patient.startedTreatmentAt==null){
                        //console.log(waitingArray[i]);
                        patients[j].waitingTime = waitingArray[i];
                        patients[j].waitingMsg = waitingMessage(waitingArray[i]);
                        waitingArray[i] += treatmentLibrary.treatmentTime(patients[j].treatmentType);
                        addInBucket(patients[j]);
                        i++;
                    }    
                }
                if(i==waitingArray.length){
                    i=0;
                    waitingArray.sort(sortingFunction);
                }
            }
            //console.log(waitingArray);
            estimate();
          }, SW_DELAI);  
    }
    estimate();
    function earliestPatientWaiting(){
        if(waitingArray){
            waitingArray.sort();
            return waitingArray[0];
        } else {
            return 0;
        }
    }
    return {
        getBuckets: getBuckets,
        earliestPatientWaiting: earliestPatientWaiting
    }
  });
