/**
 * Class to run all animations only when visible in the browser window, not when document loads. 
 * This is the ONLY javascript which is used with the animations and is not required for them to run.
 * 
 * Animations have the play state property set to paused initially, and are started when they intersect the viewport.
 * The animation-delay property is not supported, since the animation will show in its default position until play starts. The default position is always set to
 *  the final animation position, to stop the animation re-setting to the start position when completed.
 */

(function( css3kfa, $, undefined ) {
	
	function runonvisible() {
		this.allAnims = [];
		this.$win = $(window);
		var $el, elements = css3kfa_vars.elements, 
			length = elements.length, 
			allAnims = this.allAnims;
		for (var i = 0; i < length; i++) {
			$el = $(elements[i]);
			if ($el.length > 0) allAnims.push($el);
		}
		this.testForPlay();
		var runOnVisible = this;
		$(window).on('scroll', function() {
			runOnVisible.testForPlay();
		});
	}
	css3kfa.runonvisible = runonvisible;

	runonvisible.prototype = {
		testForPlay: function() {
			var y, h, s, winH, $obj, 
				allAnims = this.allAnims, 
				length = allAnims.length;
			for (var i = 0; i < length; i++) {
				$obj = allAnims[i];
				if ($obj !== null) {
					y = $obj.offset().top;
					h = $obj.height();
					s = this.$win.scrollTop();
					winH = this.$win.height();
					if (s + winH > y && s < y + h) {
						this.playAnim($obj);
					}
					else {
						this.stopAnim($obj);
					}
				} 
			} 
		}, 
		stopAnim: function($obj) {
			$obj.css({'-ms-animation-play-state':'paused', '-o-animation-play-state':'paused', '-moz-animation-play-state':'paused', '-webkit-animation-play-state':'paused', 'animation-play-state':'paused'});
		},
		playAnim: function($obj) {
			$obj.css({'-ms-animation-play-state':'running', '-o-animation-play-state':'running', '-moz-animation-play-state':'running', '-webkit-animation-play-state':'running', 'animation-play-state':'running'});
		}
	};
	$(window).on('load', function() {
		if (typeof css3kfa_obj === 'undefined') {
			new css3kfa.runonvisible();
		}
	});
}( window.css3kfa = window.css3kfa || {}, jQuery ));	

