angular
	.module('wuutApp')
	.factory('pageFactory', function($http) {

		var pages = {
			section: 1,
			discussion: 1
		};

		return {


			getPages: function(){
				return pages
			},

			resetHistory: function(){
				pages = {
					section: 1,
					discussion: 1
				};				
			},

			changeSectionPage: function(){
				pages.section++;
			},

			changeDiscussionPage: function(){
				pages.discussion++;
			},			

		};
	});
