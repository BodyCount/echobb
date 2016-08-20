angular
	.module('wuutApp')
	.factory('nprogressFactory', function() {

		NProgress.configure({
			minimum: 0.08,
	    easing: 'linear',
	    positionUsing: '',
	    speed: 350,
	    trickle: true,
	    trickleSpeed: 250,
	    showSpinner: false,
	    barSelector: '[role="bar"]',
	    spinnerSelector: '[role="spinner"]',
	    parent: '.nprogress-container',
	    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
		});

		return {
			start: function (){
				NProgress.start();
			},

			done: function (){
				NProgress.done();
			},

			set: function(value){
				NProgress.set(value);  				
			}
		}
	});