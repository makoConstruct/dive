//author: mako yass

function FractalDepths(shade, hash, planeBufferLen){
	this.shade = shade;
	this.hash = hash;
	this.planeq = new Array(planeBufferLen);
	this.planeSpan = Math.pow(2, this.planeMagnitude);
	this.viewPortSpan = Math.pow(2, this.viewPortMagnitude);
	var dif = this.viewPortMagnitude - this.planeMagnitude + 1;
	var cornerAddress = '';
	while(dif > 0){cornerAddress+='w'; --dif;}
	this.phaseCornerAddress = cornerAddress;
	this.renderWorker = new Worker('fractalRenderWorker.js');
	var closure = this;
	this.renderWorker.addEventListener('message', function(idat){FractalDepths.prototype.produceVisionViaWorkerCallback.call(closure, idat);}, false);
}

FractalDepths.areaOfOutX = 0;
FractalDepths.areaOfOutY = 0;
FractalDepths.areaOfOutSpan = 0;
//the directions are like this:
//w n
//s e
//where up is negative on the canvas.
//I'm not sure whether I'm using these but I'll define a more dense representation:
//w r t n
//q y u k
//x c v b
//s a l e
FractalDepths.areaOf = function(address, rootExponent){
	for(var i=0; i<address.length; ++i){
		var off = Math.pow(2,rootExponent-i-1);
		switch(address[i]){
		case 'n':
			FractalDepths.areaOfOutX += off;
			FractalDepths.areaOfOutY += off;
		break;
		case 'e':
			FractalDepths.areaOfOutX += off;
		break;
		case 's':
		break;
		case 'w':
			FractalDepths.areaOfOutY += off;
		break;
		}
	}
	FractalDepths.areaOfOutSpan = Math.pow(2, rootExponent - address.length);
}

FractalDepths.Spiraler = function(Northward, Eastward, Southward, Westward, context){ //4 callbacks and the context in which to execute them;
	this.Nf=Northward;  this.Ef=Eastward;  this.Sf=Southward;  this.Wf=Westward;  this.cThis=context;
}
FractalDepths.Spiraler.prototype = {
	layer:1,
	leg:0,
	x:0, y:0, //you may wish to supply inert callbacks and merely use these as your output.
	Nf: null,
	Ef: null,
	Sf: null,
	Wf: null,
	cThis: null,
	goNext: function(){
		switch(this.leg){
		case 0:
			++this.y;
			if(this.cThis) this.Nf.call(this.cThis);
			else if(this.Nf) this.Nf();
			if(this.y  == this.layer) ++this.leg;
		break;
		case 1:
			++this.x;
			if(this.cThis) this.Ef.call(this.cThis);
			else if(this.Ef) this.Ef();
			if(this.x  == this.layer){ this.leg = 0; ++this.layer; }
		break;
		case 2:
			--this.y;
			if(this.cThis) this.Sf.call(this.cThis);
			else if(this.Sf) this.Sf();
			if(-this.y == this.layer) ++this.leg;
		break;
		case 3:
			--this.x;
			if(this.cThis) this.Wf.call(this.cThis);
			else if(this.Wf) this.Wf();
			if(-this.x == this.layer) ++this.leg;
		break;
		}
	}
}


FractalDepths.SimpleSpiraler = function(){
}
FractalDepths.SimpleSpiraler.prototype = {
	layer:1,
	leg:0,
	x:0, y:0,
	cThis: null,
	goNext: function(){
		switch(this.leg){
		case 0:
			++this.y;
			if(this.y  == this.layer) ++this.leg;
		break;
		case 1:
			++this.x;
			if(this.x == this.layer) ++this.leg;
		break;
		case 2:
			--this.y;
			if(-this.y == this.layer) ++this.leg;
		break;
		case 3:
			--this.x;
			if(-this.x  == this.layer){ this.leg = 0; ++this.layer; }
		break;
		}
	}
}





FractalDepths.LetterReflectionVert = function(letter){
	switch(letter){
	case 'n':
		return 'e';
	case 'w':
		return 's';
	case 's':
		return 'w';
	case 'e':
		return 'n';
	default:
		throw 'invalid cardinal denotation given to LetterReflectionVert function';
	}
}
FractalDepths.LetterReflectionHor = function(letter){
	switch(letter){
	case 'w':
		return 'n';
	case 's':
		return 'e';
	case 'e':
		return 's';
	case 'n':
		return 'w';
	default:
		throw 'invalid cardinal denotation given to LetterReflectionHor function';
	}
}
FractalDepths.UpperNeighbor = function(address){
	for(var i=address.length; i>=0; --i){
		var curLet = address[i];
		if(curLet === 'e' || curLet === 's'){ //we've reached a chance to produce a address more in the correct direction.
			var newString = address.substr(0,i);
			while(i < address.length){
				newString += FractalDepths.LetterReflectionVert(address[i]);
				++i;}
			return newString;}}
	return null;}
FractalDepths.RightNeighbor = function(address){
	for(var i=address.length; i>=0; --i){
		var curLet = address[i];
		if(curLet === 'w' || curLet === 's'){ //we've reached a chance to produce a address more in the correct direction.
			var newString = address.substr(0,i);
			while(i < address.length){
				newString += FractalDepths.LetterReflectionHor(address[i]);
				++i;}
			return newString;}}
	return null;}
FractalDepths.LowerNeighbor = function(address){
	for(var i=address.length; i>=0; --i){
		var curLet = address[i];
		if(curLet === 'n' || curLet === 'w'){ //we've reached a chance to produce a address more in the correct direction.
			var newString = address.substr(0,i);
			while(i < address.length){
				newString += FractalDepths.LetterReflectionVert(address[i]);
				++i;}
			return newString;}}
	return null;}
FractalDepths.LeftNeigbor = function(address){
	for(var i=address.length; i>=0; --i){
		var curLet = address[i];
		if(curLet === 'n' || curLet === 'e'){ //we've reached a chance to produce a address more in the correct direction.
			var newString = address.substr(0,i);
			while(i < address.length){
				newString += FractalDepths.LetterReflectionHor(address[i]);
				++i;}
			return newString;}}
	return null;}


FractalDepths.RightNeighborRecordDeepestCleftDepth = 0;
FractalDepths.RightNeighborRecordDeepestCleft = function(address){
	for(var i=address.length; i>=0; --i){
		var curLet = address[i];
		if(curLet === 'w' || curLet === 's'){ //we've reached a chance to produce an address more in the correct direction.
			FractalDepths.RightNeighborRecordDeepestCleftDepth = address.length-i-1;
			var newString = address.substr(0,i);
			while(i < address.length){
				newString += FractalDepths.LetterReflectionHor(address[i]);
				++i;}
			return newString;}}
	return null;};

FractalDepths.generateSheet = function(rootAddress, width, height, sheet){ //the unit of width and height planes is planespan. Returns an array of the string names for the planes in this sheet.
	var deepestCleftX =0;
	var deepestCleftMagnitude =0;
	var outArr = (sheet)?
		sheet:
		new Array(width*height);
	outArr[0] = rootAddress;
	//the manner in which I do this is informed by a directive to avoid crossing the deepest clefts separating the planes we cover as much as is reasonable. We divide the generation into 2 stages. First we run a line across the top during which we record the deepest cleft we cross, that we may generate the rest of our boxes without crossing it again.
	//Was it sophistication for sophistication's sake? Perhaps. Perhaps.
	//first we fill out the top edge, storing a deepestCleftX.
	for(var i=1; i<width; ++i){
		// hold.push([i, outArr[i-1], width, height]);
		outArr[i] = FractalDepths.RightNeighborRecordDeepestCleft(outArr[i-1]);
		if(FractalDepths.RightNeighborRecordDeepestCleftDepth > deepestCleftMagnitude){
			deepestCleftMagnitude = FractalDepths.RightNeighborRecordDeepestCleftDepth;
			deepestCleftX = i;}}
	if(height == 1) return outArr;
	//now if there is a non-zero left portion we fill out its backbone, then extend out from that to fill the left section
	if(deepestCleftX > 0){
		for(var i=1; i<height; ++i){
			outArr[width*i] = FractalDepths.LowerNeighbor(outArr[width*(i-1)]);
			for(var j=1; j<deepestCleftX; ++j){
				outArr[width*i + j] = FractalDepths.RightNeighbor(outArr[width*i + j - 1]);}}
	}
	//now the right section, likewise
	if(deepestCleftX < width){
		for(var i=1; i<height; ++i){
			outArr[width*i + deepestCleftX] = FractalDepths.LowerNeighbor(outArr[width*(i-1) + deepestCleftX]);
			for(var j=deepestCleftX+1; j<width; ++j){
				outArr[width*i + j] = FractalDepths.RightNeighbor(outArr[width*i + j - 1]);}}
	}
	return outArr;
};

FractalDepths.repeatedMagnification = function(n, mag){
	var ret = 0;
	var powerest = mag;
	for(var i=0; i<n; ++i)
		ret += (powerest /= mag);
	return ret;
}

FractalDepths.nextCellOutX=0;
FractalDepths.nextCellOutY=0;
FractalDepths.nextCell = function(xv,yv, xo,yo, xc,yc){ //v are the velocity vector, magnitude not important; o are a grounding point for the vector;  c are the current cell[the current position rounded to the lowest integer]
	if(xv === 0){
		if(yv > 0){
			FractalDepths.nextCellOutY = yc + 1;
			FractalDepths.nextCellOutX = xc;
		}else if(yv < 0){
			FractalDepths.nextCellOutY = yc - 1;
			FractalDepths.nextCellOutX = xc;
		}else{
			FractalDepths.nextCellOutY = yc;
			FractalDepths.nextCellOutX = xc;
		}
	}else{
		var h;
		var xAlong;
		if(xv > 0){
			h = yv*((xc+1-xo)/xv);
			xAlong = 1;
		}else{
			h = yv*((xc-xo)/xv);
			xAlong = -1;
		}
		if(yv>0){
			if(h > yc+1){
				FractalDepths.nextCellOutY = yc + 1;
				FractalDepths.nextCellOutX = xc;
			}else if(h < yc+1){
				FractalDepths.nextCellOutY = yc;
				FractalDepths.nextCellOutX = xc + xAlong;
			}else{
				FractalDepths.nextCellOutY = yc + 1;
				FractalDepths.nextCellOutX = xc + xAlong;
			}
		}else if(yv<0){
			if(h < yc){
				FractalDepths.nextCellOutY = yc - 1;
				FractalDepths.nextCellOutX = xc;
			}else if(h > yc){
				FractalDepths.nextCellOutY = yc;
				FractalDepths.nextCellOutX = xc + xAlong;
			}else{
				FractalDepths.nextCellOutY = yc - 1;
				FractalDepths.nextCellOutX = xc + xAlong;
			}
		}else{
			FractalDepths.nextCellOutY = yc;
			FractalDepths.nextCellOutX = xc + xAlong;
		}
	}
}

FractalDepths.nextCellAndAddressOutX = 0;
FractalDepths.nextCellAndAddressOutY = 0;
FractalDepths.nextCellAndAddressOutAddress = null;
FractalDepths.nextCellAndAddress = function(xv,yv, xo,yo, xc,yc, address){ //v are the velocity vector, magnitude not important; o are a grounding point for the vector;  c are the current cell[the current position rounded to the lowest integer];  address is the address of the current cell;
	if(xv === 0){
		if(yv > 0){
			//down
			FractalDepths.nextCellAndAddressOutY = yc + 1;
			FractalDepths.nextCellAndAddressOutX = xc;
			FractalDepths.nextCellAndAddressOutAddress = FractalDepths.LowerNeighbor(address);
		}else if(yv < 0){
			//up
			FractalDepths.nextCellAndAddressOutY = yc - 1;
			FractalDepths.nextCellAndAddressOutX = xc;
			FractalDepths.nextCellAndAddressOutAddress = FractalDepths.UpperNeighbor(address);
		}else{ //maybe I should just make this undefined behavior.
			//no movement
			FractalDepths.nextCellAndAddressOutY = yc;
			FractalDepths.nextCellAndAddressOutX = xc;
			FractalDepths.nextCellAndAddressOutAddress = address;
		}
	}else{
		var h;
		var xAlong;
		var xAlongfunc;
		if(xv > 0){
			h = yv*((xc+1-xo)/xv);
			xAlong = 1;
			xAlongfunc = FractalDepths.RightNeighbor;
		}else{
			h = yv*((xc-xo)/xv);
			xAlong = -1;
			xAlongfunc = FractalDepths.LeftNeigbor;
		}
		if(yv>0){
			if(h > yc+1){
				FractalDepths.nextCellAndAddressOutY = yc + 1;
				FractalDepths.nextCellAndAddressOutX = xc;
				FractalDepths.nextCellAndAddressOutAddress = FractalDepths.LowerNeighbor(address);
			}else if(h < yc+1){
				FractalDepths.nextCellAndAddressOutY = yc;
				FractalDepths.nextCellAndAddressOutX = xc + xAlong;
				FractalDepths.nextCellAndAddressOutAddress = xAlongfunc(address);
			}else{
				FractalDepths.nextCellAndAddressOutY = yc + 1;
				FractalDepths.nextCellAndAddressOutX = xc + xAlong;
				FractalDepths.nextCellAndAddressOutAddress = FractalDepths.LowerNeighbor(xAlongfunc(address));
			}
		}else if(yv<0){
			if(h < yc){
				//up
			}else if(h > yc){
				FractalDepths.nextCellAndAddressOutY = yc;
				FractalDepths.nextCellAndAddressOutX = xc + xAlong;
				FractalDepths.nextCellAndAddressOutAddress = xAlongfunc(address);
			}else{
				FractalDepths.nextCellAndAddressOutY = yc - 1;
				FractalDepths.nextCellAndAddressOutX = xc + xAlong;
				FractalDepths.nextCellAndAddressOutAddress = FractalDepths.UpperNeighbor(xAlongfunc(address));
			}
		}else{
			FractalDepths.nextCellAndAddressOutY = yc;
			FractalDepths.nextCellAndAddressOutX = xc + xAlong;
			FractalDepths.nextCellAndAddressOutAddress = xAlongfunc(address);
		}
	}
}

FractalDepths.seekToAddress = function(dx, dy, originAddress){
	var idx = dx;
	var idy = dy;
	while(idx > 0){originAddress = FractalDepths.RightNeighbor(originAddress); --idx;}
	while(idx < 0){originAddress = FractalDepths.LeftNeigbor(originAddress); ++idx;}
	while(idy > 0){originAddress = FractalDepths.LowerNeighbor(originAddress); --idy;}
	while(idy < 0){originAddress = FractalDepths.UpperNeighbor(originAddress); ++idy;}
}

FractalDepths.coPointOutX = 0;
FractalDepths.coPointOutY = 0;
FractalDepths.coPoint = function(pxa,pya,vxa,vya, pxb,pyb,vxb,vyb){ //returns the point where these vectors could meet if scaled.
	var d = ((pya-pyb)*vxb - (pxa - pxb)*vyb)/(vyb*vxa - vxb*vya);
	FractalDepths.coPointOutX = pxa + vxa*d;
	FractalDepths.coPointOutY = pya + vya*d;
}


FractalDepths.getPlaneByAddressOutShade = 0;
FractalDepths.getPlaneByAddressOutHash = 0;
FractalDepths.getPlaneDetailsByAddress = function(shade, hash, address){
	for (var i = address.length - 1; i >= 0; i--) {
		descendFrom(shade,hash);
		var curDir = address[i];
		switch(curDir){
		case 'w':
			shade = shadeUL;  hash = hashUL;  break;
		case 'n':
			shade = shadeUR;  hash = hashUR;  break;
		case 's':
			shade = shadeBL;  hash = hashBL;  break;
		case 'e':
			shade = shadeBR;  hash = hashBR;  break;
		}
	}
	FractalDepths.getPlaneByAddressOutShade = shade;
	FractalDepths.getPlaneByAddressOutHash = hash;
}

FractalDepths.drawImageDebug = function(cancon, canvas, x, y, w, h){ //draws it with an outline.
	cancon.drawImage(canvas, x,y,w,h);
	var quCenterCrossThickness = 0.03;
	var quCenterCrossRad = 0.24;
	cancon.strokeStyle = '#9CD3CE';
	cancon.lineWidth = w*quCenterCrossThickness;
	cancon.beginPath();
	cancon.moveTo(x+ w*(1 - quCenterCrossRad)/2,   y+h/2);
	cancon.lineTo(x+ w*(1 + quCenterCrossRad)/2,   y+h/2);
	cancon.moveTo(x+w/2,   y+ h*(1 - quCenterCrossRad)/2);
	cancon.lineTo(x+w/2,   y+ h*(1 + quCenterCrossRad)/2);
	cancon.stroke();
}

FractalDepths.prototype = {
shade:0, hash:0,
planes: {}, //contain pairs, can: the canvas, index: the absolute position in planeq. indexed by address
planeqhead: 0,
planeqbroadest: 0, //denotes which plane the rendering starts with. It's the first one that covers the view
planeq: null,
getPlaneDetailsByAddressOutShade: 0,
getPlaneDetailsByAddressOutHash: 0,
phaseX:0, //phase vars denote the zoom and pan with respect to the planes that are currently in front of us.
phaseY:0,
phaseMag:0.5,
phaseCornerAddress: null,
defaultMagnificaiton: 1.1,
viewPortMagnitude: 9,
viewPortSpan: null,
planeMagnitude: 8,
planeSpan: null,
debugCrosses: false,

isProcessingOrder: false,
curVisibilitySheet: null,
curVisibilitySpiraler: null,
curVisibilityH: null,
curVisibilityW: null,
curVisibilityToRender: 0,
orders: null, //linked list;
ordersend: null,
currentOrder: null,
renderWorker: null,
pushTile: function(pair){ //takes {can: canvas, addr: address}. puts the tile into planeq and planes.
	if(pair.addr.length <= 3){ //don't put it in the recycling queue, we want these to be permanent;
		this.planes[pair.addr] = {can: pair.can,  index: null};
	}else{
		++this.planeqhead; if(this.planeqhead >= this.planeq.length) this.planeqhead = 0;
		var oldestTile = this.planeq[this.planeqhead];
		this.planes[oldestTile] = undefined;
		this.planeq[this.planeqhead] = pair.addr;
		this.planes[pair.addr] = {can: pair.can,  index: this.planeqhead};
	}
},
freshenTile: function(address){ //Moves the tile to the back of the recycling queue. assumes address is already in, returns the item corresponding to address
	var item = this.planes[address];
	if(item.index === null) return; //it's not in the queue.
	var i1 = item.index;
	var i2 = (this.planeqhead+1)%this.planeq.length;
	var otherItem = this.planeq[i2];
	var hold = this.planeq[i1];
	this.planeq[i1] = this.planeq[i2];
	this.planeq[i2] = hold;
	this.planeqhead = i2;
	item.index = i2;
	if(otherItem) otherItem.index = i1;
	return item;
},
startProcessing: function(){
	if(this.curVisibilityToRender > 0){
		do{
			var cx = Math.floor((this.curVisibilityW-1)/2);
			var cy = Math.floor((this.curVisibilityH-1)/2);
			var px = cx + this.curVisibilitySpiraler.x;
			var py = cy + this.curVisibilitySpiraler.y;
			this.curVisibilitySpiraler.goNext();
			if(
				px >= 0 && px < this.curVisibilityW &&
				py >= 0 && py < this.curVisibilityH
			){
				var curAddr = this.curVisibilitySheet[ px + this.curVisibilityW*py ];
				--this.curVisibilityToRender;
				var pair = this.planes[curAddr];
				if(pair){
					this.freshenTile(curAddr);
				}else{
					this.produceVisionViaWorkerOfOrder(this.produceOrderFrom(curAddr));
					return;
				}
			}
		}while(this.curVisibilityToRender > 0);
	}
	if(this.orders){
		this.produceVisionViaWorkerLaunchFrontOrder();
	}else{
		this.currentOrder = null;
	}
},
produceVisionViaWorkerCallback: function(ev){
	this.currentOrder.cancon.putImageData(ev.data, 0,0);
	this.pushTile({can:this.currentOrder.canvas, addr:this.currentOrder.addr});
	if(this.currentOrder.callback) this.currentOrder.callback(this.currentOrder.canvas);
	this.startProcessing();
},
produceVisionViaWorkerOfOrder: function(order){ //Very internal. Assumes there's no order running right now.
	this.currentOrder = order;
	var canv = document.createElement('canvas');
	var span = Math.pow(2, this.currentOrder.magnitude);
	canv.width =
	canv.height = span;
	this.currentOrder.canvas = canv;
	this.currentOrder.cancon = canv.getContext('2d');
	// hold.push(
	// 	'shade: '+ order.shade + ', ' +
	// 	'hash: '+ order.hash + ', ' +
	// 	'magnitude: '+ order.magnitude
	// );
	this.renderWorker.postMessage({shade:this.currentOrder.shade, hash:this.currentOrder.hash, magnitude:this.currentOrder.magnitude, imgdat: this.currentOrder.cancon.getImageData(0,0,canv.width,canv.height)});
},
produceVisionViaWorkerLaunchFrontOrder: function(){ //more internal than pushOrderBack/Front
	var order = this.orders;
	this.orders = this.orders.next;
	if(!this.orders) this.ordersend = null;
	this.produceVisionViaWorkerOfOrder(order);
},
pushOrderBack: function(order){ //order :: {address, shade, hash, magnitude, canvas [,callback]}
	order.next = null;
	if(this.currentOrder){
		if(this.orders){
			this.ordersend.next =
			this.ordersend =
				order;
		}else{
			this.orders =
			this.ordersend =
				order;
		}
	}else{
		this.orders =
		this.ordersend =
			order;
		this.produceVisionViaWorkerLaunchFrontOrder();
	}
},
pushOrderFront: function(order){ //order :: {shade, hash, magnitude, callback}
	if(this.currentOrder){
		if(this.orders){
			order.next = this.orders;
			this.orders = order;
		}else{
			order.next = null;
			this.orders =
			this.ordersend =
				order;
		}
	}else{
		this.orders =
		this.ordersend =
			order;
		this.produceVisionViaWorkerLaunchFrontOrder();
	}
},
produceOrderFrom: function(address, callback){ //returns the corresponding order
	descendDeeplyFrom(this.shade, this.hash, address);
	var closure = this;
	return {
		addr:address,
		shade:descendDeeplyFromOutShade,
		hash:descendDeeplyFromOutHash,
		magnitude:this.planeMagnitude,
		callback: (callback)?callback:null
	};
},
launchVisionProductionIfNotCached: function(address, callback){ //callback was run immediately[as addressed tile was already cached] iff returns true. Else runs after tile is genned and cached;
	if(this.planes[address] !== undefined){
		//if it is cached, move it forward in the queue so it doesn't get overwrit while we still want it. We put the previous last element, threatened with removal in the refereshed element's old position because why not.
		callback(this.freshenTile(address).can);
		return true;
	}else{
		this.pushOrderBack(this.produceOrderFrom(address,callback));
		return false;
	}
},

quInd: function(index){return (planeqhead+index)%planeq.length;},

shiftViewPoint: function(dx,dy, magnify){ //dx, dy are panning motion, in terms of the span of the viewport[probably going to be 512 in most applications]. Magnification about the center is the first thing to happen. If you want to magnify from a user-specified center of magnification, zoomInto provides a wrapper around this function that simulates.. or.. well it translates your coords to do that exactly.
	//if dx, or dy cause phaseX or phaseY to cross over either 0, or the width of a plane, the sheet must be shifted over by one.
	var nmag = this.phaseMag*magnify;
	var halfVPSpan = this.viewPortSpan/2;
	var nx = this.phaseX + dx/nmag - halfVPSpan/nmag + halfVPSpan/this.phaseMag;
	var ny = this.phaseY + dy/nmag - halfVPSpan/nmag + halfVPSpan/this.phaseMag;
	var addr = this.phaseCornerAddress;
	if(nmag < 0.5 && addr.length === 1 + this.viewPortMagnitude - this.planeMagnitude){
		//the frame just fills the top, standard measurements;
		nmag = 0.5;
		nx = 0;
		ny = 0;
		addr = 'ww';
	}else{
		var faddr = addr;
		var ixn = Math.ceil((this.phaseX + (this.viewPortSpan/this.phaseMag))/this.planeSpan) - 1;
		var iyn = Math.ceil((this.phaseY + (this.viewPortSpan/this.phaseMag))/this.planeSpan) - 1;
		for(var ix=0; ix<ixn; ++ix) faddr = FractalDepths.RightNeighbor(faddr);
		for(var iy=0; iy<iyn; ++iy) faddr = FractalDepths.LowerNeighbor(faddr);
		var nfx = nx + this.viewPortSpan/nmag;
		var nfy = ny + this.viewPortSpan/nmag;
		//faddr is now the lower right of the phase view.
		if(nx < 0){
			if(FractalDepths.LeftNeigbor(addr)===null){
				nx = 0;}}
		if(nfx > (ixn+1)*this.planeSpan){
			if(FractalDepths.RightNeighbor(faddr)   ===   null){
				nx -= nfx - (ixn+1)*this.planeSpan;}}
		if(ny < 0){
			if(FractalDepths.UpperNeighbor(addr)===null){
				ny = 0;}}
		if(nfy > (iyn+1)*this.planeSpan){
			if(FractalDepths.LowerNeighbor(faddr)   ===   null){
				ny -= nfy - (iyn+1)*this.planeSpan;}}
	}
	//nx, ny, and nmag are now shifted such that the view is inside the frame
	var idx = Math.floor(nx/this.planeSpan);
	var idy = Math.floor(ny/this.planeSpan);
	while(idx > 0){//shift one to the right
		addr = FractalDepths.RightNeighbor(addr);
		nx -= this.planeSpan;
		--idx;
	}
	while(idx < 0){//shift one to the left
		addr = FractalDepths.LeftNeigbor(addr);
		nx += this.planeSpan;
		++idx;
	}
	//written by m a koy as s;
	while(idy > 0){//shift one downwards
		addr = FractalDepths.LowerNeighbor(addr);
		ny -= this.planeSpan;
		--idy;
	}
	while(idy < 0){//shift one to the upwards
		addr = FractalDepths.UpperNeighbor(addr);
		ny += this.planeSpan;
		++idy;
	}
	//likewise if magnify causes planeMagnitude to cross 1x, the next planes must be shifted into view.
	if(magnify !== 1){ //otherwise, nothing change
		if(nmag >= 1){
			nmag /= 2;
			nx *= 2;
			ny *= 2;
			if(nx >= this.planeSpan){
				nx -= this.planeSpan;
				if(ny >= this.planeSpan){
					ny -= this.planeSpan;
					addr += 'e';
				}else{
					addr += 'n';
				}
			}else{
				if(ny >= this.planeSpan){
					ny -= this.planeSpan;
					addr += 's';
				}else{
					addr += 'w';
				}
			}
		}else if(nmag < 0.5){
			nmag *= 2;
			var finalTurn = addr[addr.length-1];
			switch(finalTurn){
			case 'n':
				nx += this.planeSpan;
			break;
			case 'e':
				nx += this.planeSpan;
				ny += this.planeSpan;
			break;
			case 'w':
			break;
			case 's':
				ny += this.planeSpan;
			break;
			}
			nx /= 2;
			ny /= 2;
			addr = addr.substr(0, addr.length - 1);
		}
		this.phaseMag = nmag;
	}
	var nw = Math.ceil((nx + this.viewPortSpan/nmag)/this.planeSpan);
	var nh = Math.ceil((ny + this.viewPortSpan/nmag)/this.planeSpan);
	if(
		(addr !== this.phaseCornerAddress) ||
		(nw !== Math.ceil((this.phaseX + this.viewPortSpan/this.phaseMag)/this.planeSpan)) ||
		(nh !== Math.ceil((this.phaseY + this.viewPortSpan/this.phaseMag)/this.planeSpan))
	){
		//alter the immediate draw sheet
		this.curVisibilitySpiraler = new FractalDepths.SimpleSpiraler;
		this.curVisibilityW = nw;
		this.curVisibilityH = nh;
		this.curVisibilityToRender = nw*nh;
		this.curVisibilitySheet = FractalDepths.generateSheet(addr, nw, nh);
		if(!this.currentOrder) this.startProcessing();
	}
	this.phaseX = nx;
	this.phaseY = ny;
	this.phaseCornerAddress = addr;
},
zoomInto: function(cx,cy, magnification){
	var relatavism = this.viewPortSpan/2;
	var mag = (magnification - 1);
	this.shiftViewPoint(
		(cx - relatavism)*mag,
		(cy - relatavism)*mag,
		magnification );
},
draw: function(canContext){
	var frameAddr = this.phaseCornerAddress;
	var frameTilespan = this.planeSpan*this.phaseMag;
	var frameViewSpan = this.viewPortSpan;
	var frameOffsetX = -(this.phaseX*this.phaseMag);
	var frameOffsetY = -(this.phaseY*this.phaseMag);
	var frameW = Math.ceil((frameViewSpan/this.phaseMag + this.phaseX)/this.planeSpan);
	var frameH = Math.ceil((frameViewSpan/this.phaseMag + this.phaseY)/this.planeSpan);
	var drawqueue = [];
	var stackClimbLimit = 8;
	var closure = this;
	recessionLoop: for(var stackHeight=0; stackHeight<stackClimbLimit; ++stackHeight){
		var sheet = FractalDepths.generateSheet(frameAddr, frameW, frameH);
		var fullSheet = true; //if this is still true after sheetLoop, don't receed any further, nothing in the behind would be visible;
		var thisseq = [];
		//sheetLoop:
		for(var yi=0; yi<frameH; ++yi){
			for(var xi=0; xi<frameW; ++xi){
				var curAddr = sheet[xi + yi*frameW];
				if(this.planes[curAddr]){
					// it was cached
					thisseq.push({
						x: frameOffsetX + xi*frameTilespan, //
						y: frameOffsetY + yi*frameTilespan, // where x and y are relative to the viewport ul corner
						can: this.planes[curAddr].can
					});
				}else{
					// it was not cached. Can't finish the sheet so signal recession
					fullSheet = false;
				}
			}
		}
		drawqueue.push({tilespan:frameTilespan, seq:thisseq});
		if(fullSheet || (frameAddr.length  <=  this.viewPortMagnitude - this.planeMagnitude + 1))
			break recessionLoop;
		//now receed upwards
		var finalTurn = frameAddr[frameAddr.length-1];
		switch(finalTurn){
		case 'n':
			frameOffsetX -= frameTilespan;
			frameW = Math.floor(frameW/2) + 1;
			frameH = Math.ceil(frameH/2);
		break;
		case 'e':
			frameOffsetX -= frameTilespan;
			frameOffsetY -= frameTilespan;
			frameW = Math.floor(frameW/2) + 1;
			frameH = Math.floor(frameH/2) + 1;
		break;
		case 'w':
			frameW = Math.ceil(frameW/2);
			frameH = Math.ceil(frameH/2);
		break;
		case 's':
			frameOffsetY -= frameTilespan;
			frameW = Math.ceil(frameW/2);
			frameH = Math.floor(frameH/2) + 1;
		break;
		}
		frameAddr = frameAddr.substr(0, frameAddr.length - 1);
		frameTilespan *= 2;
	}
	//now render the draw orders, in the opposite order[that was the whole point of recording them rather than just doing them]
	for(var i=drawqueue.length-1; i>=0; --i){
		var cursheet = drawqueue[i];
		var curseq = cursheet.seq;
		for(var j=0;  j<cursheet.seq.length;  ++j)
			if(this.debugCrosses)
				FractalDepths.drawImageDebug(
					canContext,
					curseq[j].can,
					curseq[j].x,
					curseq[j].y,
					cursheet.tilespan,
					cursheet.tilespan );
			else
				canContext.drawImage(
					curseq[j].can,
					curseq[j].x,
					curseq[j].y,
					cursheet.tilespan,
					cursheet.tilespan );
	}
}
};