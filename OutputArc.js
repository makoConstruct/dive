/*
	Nature: a bespoke text output overlay.
	Author: mako yass.
*/

function OutputArc(container, minOpacity){
	if(minOpacity !== undefined) this.minOpacity = minOpacity;
	this.container = container;
	this.lines = new Array(Math.floor(this.container.offsetHeight/this.lineHeight));
	//populate the array;
	for (var i = this.lines.length - 1; i >= 0; i--) {
		var cur = document.createElement('code');
		cur.style.position = 'absolute';
		cur.style['white-space'] = 'pre';
		var pxTop = this.lineHeight*i;
		cur.style.top = (pxTop)+'px';
		cur.style.left = this.curveOffset(pxTop)+'px';
		this.container.appendChild(cur);
		this.lines[i] = cur;
	};
}

OutputArc.prototype = {
lineHeight: 12,
container:null,
lines: null,
head:0,
/*configurables start here:*/
minOpacity: 0.6,
curveProminence: 15,
fadeOutIn: 0, //if 0, doesn't fade out. Unit is milliseconds.
curveOffset: function(y){return Math.pow((2*(y-this.container.offsetHeight/2))/(this.container.offsetHeight*Math.SQRT2), 2)*this.curveProminence;},
qIndex: function(index){return (Math.abs(index))%this.lines.length;},
write: function(text){
	var cur = this.lines[this.qIndex(this.head)];
	if(cur.firstChild !== null) cur.removeChild(cur.firstChild);
	cur.appendChild(document.createTextNode(text));
	cur.style.opacity = 1;
	//set earlier few to a lower opacity
	var nPrev = 8;
	for(var i=nPrev; i>=1; --i){
		this.lines[this.qIndex(this.head - i)].style.opacity =
			(((nPrev - i)/(nPrev-1))*(1 - this.minOpacity) + this.minOpacity);
	}
	++this.head;
},
};