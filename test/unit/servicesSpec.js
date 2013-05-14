'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('bedManagement.services', function($provide) {
    $provide.constant('SNOOZE_LENGTH',3);
    $provide.constant('SW_DELAI',1); 
    $provide.constant('BED_COUNT',2); 
    $provide.constant('A_TREATMENT',2); 
    $provide.constant('B_TREATMENT',3); 
    $provide.constant('C_TREATMENT',4);
  }));


  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
  describe('bedManager', function() {
    it('should return beds of the right count', inject(function(bedManager,BED_COUNT) {
      bedManager.reset(); 
      var beds = bedManager.getBeds(); 
      expect(beds.length).toEqual(BED_COUNT);

    }));
    it('should create beds with the state free', inject(function(bedManager) {
      bedManager.reset(); 
      var bed = bedManager.getBeds()[0];
      expect(bed.current).toEqual('free');
      expect(bed.alertStatus).toEqual('alert-success');
    }));
    it('should show free beds', inject(function(bedManager,stopwatch,BED_COUNT) {
      bedManager.reset(); 
      expect(bedManager.freeBeds()).toEqual(BED_COUNT);
      expect(bedManager.getBeds()[0].alertStatus).toEqual('alert-success');
    }));
    it('should assign free beds', inject(function(bedManager,stopwatch,BED_COUNT){
      bedManager.reset(); 
      var time = stopwatch.data.value; 
      var duration = 6;
      var patientNumber = 123456789;
      expect(bedManager.freeBeds()).toEqual(BED_COUNT);
      var bed = bedManager.assignBed(patientNumber,duration,time);
      expect(bed.current).toEqual('assigned');
      expect(bed.alertStatus).toEqual('alert-error');
      expect(bed.assignedPatientNumber).toEqual(patientNumber);
      expect(bed.assignedAt).toEqual(time);
      expect(bed.freeAt).toEqual(time+duration);
      expect(bed.checkedAt).toEqual(time);
      expect(bedManager.freeBeds()).toEqual(BED_COUNT-1);
    }));
    it('should return bed given patient number', inject(function(bedManager,stopwatch){
      bedManager.reset(); 
      var bed = bedManager.assignBed(123456789,120*60*1000,stopwatch.data.value);
      expect(bedManager.getBed(123456789)).toEqual(bed);
    }));
    it('should be able to release a bed', inject(function(bedManager,stopwatch,BED_COUNT){
      bedManager.reset(); 
      var time = stopwatch.data.value;
      var duration = 6;
      bedManager.assignBed(123456789,duration,time);
      expect(bedManager.freeBeds()).toEqual(BED_COUNT-1);
      var bed = bedManager.getBed(123456789);
      bed.release();
      //expect().toEqual()
      expect(bedManager.freeBeds()).toEqual(BED_COUNT);
      expect(bedManager.getBed(123456789)).toBeNull();
      expect(bed.alertStatus).toEqual('alert-success');
      expect(bed.current).toEqual('free');
      expect(bed.assignedPatientNumber).toEqual('unassigned');
      expect(bed.assignedAt).toBeNull();
      //expect(bed.freeAt).toBeNull();
      expect(bed.checkedAt).toBeNull();
      expect(bed.completion).toEqual(100);
    }));
    it('should be able to delay bed release', inject(function(bedManager,stopwatch,SNOOZE_LENGTH){
      bedManager.reset(); 
      var time = stopwatch.data.value;
      var duration = 6;
      bedManager.assignBed(123456789,duration,time);
      var bed = bedManager.getBed(123456789);
      expect(bed.freeAt).toEqual(time+duration);
      bed.delayRelease();
      expect(bed.freeAt).toEqual(time+duration+SNOOZE_LENGTH);
    }));
    it('should inform if a bed needs to be checked', inject(function(bedManager,stopwatch,$timeout,SNOOZE_LENGTH,SW_DELAI){
      stopwatch.start(SW_DELAI);
      bedManager.reset(); 
      var time = stopwatch.data.value;
      var duration = 6;
      bedManager.assignBed(123456789,duration,time);
      var bed = bedManager.getBed(123456789);
      expect(bed.checkRequired).toBeFalsy();
      for(var i=0;i<=(duration-SNOOZE_LENGTH);(i+=SW_DELAI)){
        $timeout.flush();
      }
      expect(bed.checkRequired).toBeTruthy();
      bed.checkBed();
      expect(bed.checkRequired).toBeFalsy();
    }));
    it('should warn if nearing or past completion time',inject(function(bedManager,stopwatch,$timeout,SNOOZE_LENGTH,SW_DELAI){
      stopwatch.start(SW_DELAI);
      bedManager.reset(); 
      var time = stopwatch.data.value;
      $timeout.flush(); 
      var duration = 4;
      bedManager.assignBed(123456789,duration,time);
      var bed = bedManager.getBed(123456789);
    }));
    it('should update bed completion %',inject(function(bedManager,stopwatch,$timeout,SNOOZE_LENGTH,SW_DELAI){
      stopwatch.start(SW_DELAI);
      bedManager.reset(); 
      var time = stopwatch.data.value;
      $timeout.flush(); 
      var duration = 4;
      bedManager.assignBed(123456789,duration,time);
      var bed = bedManager.getBed(123456789);
      expect(bed.completion).toEqual(100);
      expect(bed.warn).toBeFalsy();
      $timeout.flush();
      expect(bed.completion).toEqual(25);
      expect(bed.warn).toBeFalsy();
      $timeout.flush();
      expect(bed.completion).toEqual(50);
      expect(bed.warn).toBeTruthy();
      $timeout.flush();
      expect(bed.completion).toEqual(75);
      expect(bed.warn).toBeTruthy();
      $timeout.flush();
      expect(bed.completion).toEqual(100);
      expect(bed.warn).toBeTruthy();
      $timeout.flush();
      expect(bed.completion).toEqual(100);
      expect(bed.warn).toBeTruthy();
    }));
  });

  describe('patientStore', function() {
    beforeEach(function(){

    });
    it('should return patients', inject(function(patientStore) {
      patientStore.reset();
      expect(patientStore.getPatients()).toEqual([]);
    }));
    it('should register patients', inject(function(patientStore,stopwatch) {
      patientStore.reset();
      var time = stopwatch.data.value;
      patientStore.addPatient('Name',123456789,'A',time);
      var patients = patientStore.getPatients();
      expect(patients.length).toEqual(1);
      expect(patients[0]).toEqual(
        { 
          patientName: 'Name',
          patientNumber: 123456789,
          treatmentType: 'A',
          registrationTime: time,
          startedTreatmentAt: null,
          treated: false });
      }));
    
    it('should start treatment for patients', inject(function(patientStore,stopwatch) {
      patientStore.reset(); 
      var time = stopwatch.data.value;
      patientStore.addPatient('Name',123456789,'A',time);
      expect(patientStore.waiting()).toEqual(1);
      patientStore.startTreatment(123456789,time+10000);  
      expect(patientStore.waiting()).toEqual(0);
      expect(patientStore.getPatients().length).toEqual(1);
      patientStore.startTreatment(123456789,time+10000); 
    })); 

    it('should end treatment for patient',inject(function(patientStore,stopwatch) {
      patientStore.reset(); 
      var time = stopwatch.data.value;
      patientStore.addPatient('Name',123456789,'A',time);
      expect(patientStore.treated()).toEqual(0);
      patientStore.startTreatment(123456789,time+10000);
      expect(patientStore.treated()).toEqual(0);
      patientStore.endTreatment(123456789,time+20000);
      expect(patientStore.treated()).toEqual(1);
    }));
    it("should return waiting patients count", inject(function(patientStore,stopwatch) {
      patientStore.reset(); 
      var time = stopwatch.data.value;
      var patientNumber = 123456789;
      expect(patientStore.waiting()).toEqual(0);
      patientStore.addPatient('Name',patientNumber,'A',time);
      expect(patientStore.waiting()).toEqual(1);
      patientStore.addPatient('Name',patientNumber+=1,'A',time);
      expect(patientStore.waiting()).toEqual(2);
    })); 
    
  });
  
    describe('estimator', function() {

    beforeEach(function(){
  
    });

    it('should estimate patient waiting times', inject(function($timeout,SW_DELAI,estimator,bedManager,patientStore,stopwatch) {
      bedManager.reset(); 
      var patientNumber = 123456789;
      var patients = patientStore.getPatients();
      var beds = bedManager.getBeds();
      var time = stopwatch.data.value;
      stopwatch.start(SW_DELAI);
      $timeout.flush();
      //time ticks
      expect(beds.length).toEqual(2);
      patientStore.addPatient('Name',patientNumber++,'A',time);
      $timeout.flush();
      expect(patientsWaitingTimes(patientStore.getPatients())).toEqual([0]);
      bedManager.assignBed(123456789,1,time);
      $timeout.flush();
      $timeout.flush();

    }));

    function patientsWaitingTimes(patients){
      var times = [];
      for(var i=0;i<patients.length;i++){
        times.push(patients[i].waitingTime);
      }
      return times;
    }

    });

});
