var app = angular.module("my-app",[]);

app.service('HvadService', function($q, $timeout) {
    var HVAD,speechEndTimeout,vm=this,speechStartPromise,speechEndPromise;

    vm.start= function() {
        var deferred=$q.defer();
        if(HVAD){
            HVAD.start();
            deferred.resolve();
        }
        else{
            init()
            .then(function(_hvad){
                HVAD=_hvad;
                HVAD.start();
                deferred.resolve();
            })
            .catch(function(error){
                deferred.reject('VAD not initialized');
            })
        }
        return deferred.promise;
    }

    vm.pause = function() {
        var deferred=$q.defer();
      if (HVAD) {
        HVAD.pause();
        deferred.resolve();
      } else {
        deferred.reject('VAD not initialized');
      }
      return deferred.promise;
    };

    vm.stop = function() {
        var deferred=$q.defer();
        if (HVAD) {
            HVAD.destroy();
            HVAD = null;
            deferred.resolve();
        }
        return deferred.promise;
    };

    vm.onSpeechStart = function() {
        speechStartPromise=$q.defer();
        return speechStartPromise.promise;
    }

    vm.onSpeechEnd = function() {
      speechEndPromise = $q.defer();
      return speechEndPromise.promise;
    };

    function init() {
      return vad.MicVAD.new({
        positiveSpeechThreshold: 0.8,
        minSpeechFrames: 5,
        preSpeechPadFrames: 20,
        // silenceThreshold: 0.25,
        noise: true,
        onSpeechStart: function() {
            if(speechEndTimeout)
                $timeout.cancel(speechEndTimeout);
            // speechStartPromise.resolve();
        },
        onSpeechEnd: function() {
            // vm.onSpeechEnd();
            speechEndTimeout = $timeout(function(){
                speechEndPromise.resolve();
            }, 2000);
        },
        // onVADMisfire: function() {
        //   console.log("VAD misfire");
        // }
      });
    }
  });


app.controller("appController", function ($scope, HvadService) {
    $scope.start=function(){
        HvadService.start()
        .then(function(){
            $scope.msg='starting';
            // HvadService.onSpeechStart()
            // .then(function(){
            //     $scope.msg='speach start'
                HvadService.onSpeechEnd()
                .then(function(){
                    $scope.msg='speech end';
                })
            // })
        })
    }
    $scope.pause=function(){
        HvadService.pause()
        .then(function(){
            $scope.msg='pausing';
        })
    }
    $scope.stop=function(){
        HvadService.stop()
        .then(function(){
            $scope.msg='stoping';
        })
    }
});
