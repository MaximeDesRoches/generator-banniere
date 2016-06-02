
		var q = function(p){return document.querySelector(p)};

		var _isBtnLegal = false;
        var legalButton = document.getElementById('legalButton');
        var legalContainer = document.getElementById('legalContainer');
        var legalClose = document.getElementById('legalClose');

		function init(){
			_animateInStep1();
		}

		function _animateInStep1(){

		}

        function _enableLegal(){
            _isBtnLegal = true;
        }

        legalButton.onmouseover = function() {
            if (_isBtnLegal) TweenLite.to('#legalButton', 0.3, {alpha:'0.8', ease:Linear.easeNone});
        }

        legalButton.onmouseout = function() {
            if (_isBtnLegal) TweenLite.to('#legalButton', 0.2, {alpha:'1', ease:Linear.easeNone});
        }

        legalButton.onclick = function(event) {
            if (_isBtnLegal) {
                event.stopPropagation();
                event.preventDefault();
                TweenLite.to('#legalContainer', 0.5, {left:'0px', ease:Cubic.easeInOut});
            }
        }

        legalClose.onmouseover = function() {
            TweenLite.to('#legalClose', 0.3, {alpha:'0.8', ease:Linear.easeNone});
        }

        legalClose.onmouseout = function() {
            TweenLite.to('#legalClose', 0.2, {alpha:'1', ease:Linear.easeNone});
        }

        legalClose.onclick = function(event) {
        	event.preventDefault();
            event.stopPropagation();
            TweenLite.to('#legalContainer', 0.5, {left:'310px', ease:Cubic.easeInOut});
        }
