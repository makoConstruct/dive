var hold = [];

var arc;
var arcOutd = true;
function arcOut(){
	arcOutd=true;
	arc.container.classList.add('arcHolderOut');
	arc.container.classList.remove('arcHolderIn'); }
function arcIn(){
	arcOutd=false;
	arc.container.classList.add('arcHolderIn');
	arc.container.classList.remove('arcHolderOut'); }
var arcActive = false;
var arcTickerID = 0;
var arcMsgq = null;
var arcMsgqend = null;
function sayCallback(){
	if(arcMsgq !== null){
		arc.write(arcMsgq.txt);
		if(arcMsgq.onceSaidCallback)
			arcMsgq.onceSaidCallback();
		arcMsgq = arcMsgq.next;
	}else{
		arcActive = false;
		clearTimeout(arcTickerID);
	}
}
function say(text, onceSaidCallback){ //this causes the arc to take a very breif moment between printings
	if(arcActive){
		var nextLine = {txt:text, next:null};
		if(onceSaidCallback)
			nextLine.onceSaidCallback = onceSaidCallback;
		if(arcMsgq === null){
			arcMsgq = nextLine;
		}else{
			arcMsgqend.next = nextLine;
		}
		arcMsgqend = nextLine;
	}else{
		arc.write(text);
		if(onceSaidCallback)
			onceSaidCallback();
		arcActive = true;
		arcTickerID = setInterval(sayCallback, 8);
	}
}



function drawFractalWith(frac, canvasContext, x,y,shade,hash,elevation){
	idat = canvasContext.getImageData(0,0, canvasContext.canvas.width, canvasContext.canvas.height  );
	frac(x,y,shade,hash,elevation  );
	canvasContext.putImageData(idat, 0,0  );
}

function produceVisionWith(frac, shade, hash, magnitude){
	var renderedCan = document.createElement('canvas');
	var span = Math.pow(2,magnitude);
	renderedCan.width = span;
	renderedCan.height = span;
	var renderedCon = renderedCan.getContext('2d');
	drawFractalWith(frac, renderedCon, 0,0, shade, hash, magnitude);
	return renderedCan;
}
function drawOn(img){cancon.drawImage(img, 0,0,canvas.width,canvas.height);}


function elementLocation(el){
	var parent = el.parentElement
	if(parent === null){
		return {x:el.offsetLeft, y:el.offsetTop};
	}else{
		var o = elementLocation(parent);
		return {x:el.offsetLeft+o.x, y:el.offsetTop+o.y};
	}
}

function Zoomer(theCanvasObject, theFractalDescender){
	this.fractalDescender = theFractalDescender;
	this.canvasObject = theCanvasObject;
	var closure = this;
	this.canvasObject.addEventListener('mousedown', function(ev){closure.mouseDown(ev);});
	this.canvasObject.addEventListener('contextmenu', function(ev){ev.preventDefault(); return false;});
	this.moveListener = function(ev){closure.mouseMove(ev)};
	this.frameTickFunction = function(){closure.movementFrame();};
	this.mouseUpListener = function(ev){closure.mouseUp(ev);};
}
Zoomer.prototype = {
	fractalDescender: null,
	canvasObject: null,
	mouseXAbs:0, mouseYAbs:0,
	mouseX:0, mouseY:0, //relative to the box ul corner
	magRate:1, acceleration:0,
	focalBoxRad: 64, //the radius in pixels of the frame the user's zooming into.. I cbf explaining this fully, it's a bit of a subtlety
	magMaxSpeed:1.034, magMinSpeed:0.8, magSlowingRate:0.002, magSpeedingRate:0.0018,
	moveListener: null,
	mouseUpListener: null,
	running: false,
	frameTickerID: 0,
	frameTickFunction: null,
	mouseMove: function(ev){
		this.mouseXAbs = ev.clientX;
		this.mouseYAbs = ev.clientY;
	},
	mouseDown: function(mev){
		var o = elementLocation(this.canvasObject);
		if(mev.button === 0){
			this.acceleration  =  this.magSpeedingRate;
		}else if(mev.button === 2){
			this.acceleration  = -this.magSpeedingRate;
		}
		this.canvasObject.addEventListener('mousemove', this.moveListener);
		document.body.addEventListener('mouseup', this.mouseUpListener);
		this.mouseXAbs = mev.clientX;
		this.mouseYAbs = mev.clientY;
		mev.preventDefault();
		mev.stopPropagation();
		if(!this.running){
			this.running = true;
			this.frameTickerID = setInterval(this.frameTickFunction, 16);
		}
	},
	mouseUp: function(mev){
		this.canvasObject.removeEventListener('mousemove', this.moveListener);
		document.body.removeEventListener('mouseup', this.mouseUpListener);
		this.acceleration = 0;
	},
	movementFrame: function(){
		if(this.acceleration !== 0){
			this.magRate += this.acceleration;
			if(this.magRate > this.magMaxSpeed) this.magRate = this.magMaxSpeed;
			if(this.magRate < this.magMinSpeed) this.magRate = this.magMinSpeed;
		}else{ //else friction
			if(this.magRate !== 1){
				if(Math.abs(this.magRate - 1) <= this.magSlowingRate){
					this.magRate = 1;
					clearInterval(this.frameTickerID);
					this.running = false;
				}else{
					if(this.magRate > 1) this.magRate -= this.magSlowingRate;
					else                 this.magRate += this.magSlowingRate;
				}
			}
		}
		if(this.magRate !== 1){
			var o = elementLocation(this.canvasObject);
			var mouseX = this.mouseXAbs - o.x;
			var mouseY = this.mouseYAbs - o.y;
			var cx =
				((mouseX < this.focalBoxRad)?
					0:
					((mouseX > this.canvasObject.width - this.focalBoxRad)?
						this.canvasObject.width - 2*this.focalBoxRad:
						mouseX - this.focalBoxRad)) *
				(this.canvasObject.width / (this.canvasObject.width - 2*this.focalBoxRad));
			var cy =
				((mouseY < this.focalBoxRad)?
					0:
					((mouseY > this.canvasObject.height - this.focalBoxRad)?
						this.canvasObject.height - 2*this.focalBoxRad:
						mouseY - this.focalBoxRad)) *
				(this.canvasObject.height / (this.canvasObject.height - 2*this.focalBoxRad));
			this.fractalDescender.zoomInto(cx,cy,this.magRate);
		}
		var cancon = this.canvasObject.getContext('2d');
		cancon.clearRect(0, 0, this.canvasObject.width, this.canvasObject.height);
		this.fractalDescender.draw(cancon);
	},
};



function desc(addr){ descendDeeplyFrom(8,37,addr); drawOn(produceVision(descendDeeplyFromOutShade, descendDeeplyFromOutHash ,9)); }



function timeSequenceRecurse(seq, i){
	seq[i]();
	if(i+2 < seq.length)
		setTimeout(function(){timeSequenceRecurse(seq,i+2);}, seq[i+1]);
}
function timeSequence(seq){ //[function, time[, function, time]*] where times are the amount of time between the previous function and the next;
	if(seq.length >= 2) timeSequenceRecurse(seq,0);
	else seq[0]();
}

var fractalDiver;
var zoomer;

window.onload = function(){
	canvas = document.getElementById('view');
	cancon = canvas.getContext('2d');
	arc = new OutputArc(document.getElementById('arcHolder'), 0.28);
	document.getElementById('centerLogo').style.opacity = 0.19;
	say('current funding:0$/h');
	say('generating overview..');
	document.getElementById('details').addEventListener(
		'mouseover',
		function(ev){ ev.srcElement.classList.add('noted'); } );
	var sheet = FractalDepths.generateSheet('ww', 4, 4);
	var ss = new FractalDepths.SimpleSpiraler;
	var cx = 1, cy = 1;
	var preRenderCount = 0;
	//fractalDiver = new FractalDepths(8, 37, 468);
	fractalDiver = new FractalDepths(2, 2136422757, 468);
	// var actualBlinkies = false;
	//v blinky =
	// 	(actualBlinkies)?
	// 		new Blinky(document.getElementById('mainOverlay')):
	// 		{pulse: function(){}};
	// blinko =
	// 	(actualBlinkies)?
	// 		new Blinky(document.getElementById('mainOverlay')):
	// 		{pulse: function(){}};
	zoomer = new Zoomer(canvas, fractalDiver);
	var transitionVisibility = function(){
		say('overview drawn');
		say('ready to dive.', function(){ //the function argument gets called when this is said; which could be well after it's posted, the arc has a maximum cascade speed such that if things are said faster than that, it queues them.
			timeSequence([
				function(){
					// document.getElementById('centerLogo').style.opacity = 1;
					document.getElementById('cornerul').style.opacity = 1;
					document.getElementById('cornerur').style.opacity = 1;
					document.getElementById('cornerbl').style.opacity = 1;
					document.getElementById('cornerbr').style.opacity = 1;
					document.getElementById('centerLogo').style.opacity = 0;
				}, 300,
				function(){
					fractalDiver.draw(cancon);
					canvas.style.opacity = 1;
				}, 1700,
				function(){
					arcOut();
				}, 30000,
				function(){
					document.getElementById('details').style.opacity = 0.4;
				}, 20
			]);
		});
	}
	var renderNext = function(){
		var curx = cx + ss.x;
		var cury = cy + ss.y;
		var addr = sheet[curx + 4*(cury)];
		ss.goNext();
		fractalDiver.launchVisionProductionIfNotCached(addr, function(){
			say("prepped tile [" + addr + "], at (" + curx + ", " + cury + "), "+ (preRenderCount+1) +"/16");
			if(++preRenderCount < 16){
				if(arcOutd) arcIn();
				renderNext();
			}
			else {
				transitionVisibility();
			}
		});
	}
	renderNext();
}