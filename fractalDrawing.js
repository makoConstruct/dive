var canvas;
var cancon;

var shadeStray = 0.7;

var idat;
function pixel(x,y,  shade){ //depends idat
	var pixp = 4*idat.width*y + 4*x;
	var dat = idat.data;
	dat[pixp] = shade;
	dat[++pixp] = shade;
	dat[++pixp] = shade;
	dat[++pixp] = 255; //because this one is alpha.
}

function mongle(previous){
	return ((2148135791*(previous) + 0xB8D29D9A)%0xFFFFFFFF);
}

invexp32 = 1/0xFFFFFFFF;
function mongleRange(previous){return mongle(previous)*invexp32;}

function skewDegree(fraction, skew){
	if(fraction < (skew - 1)/(skew -1/skew)){
		return fraction/skew;
	}else{
		return (fraction-1)*skew + 1;
	}
}

function fractalRecurseOldWhole(x,y, shade,hash, elevation){ //relies on idat
	var zoneSpan  =  ((shade >= 128)? (255 - shade) : shade)*shadeStray;
	var seed = mongle(hash);
	var od = Math.round((zoneSpan*2)*mongleRange(seed) - zoneSpan);
	var orbit1 = shade - od;
	var orbit2 = shade + od;
	var or1dZone = Math.min(orbit1, 255 - orbit1)*shadeStray;
	var or2dZone = Math.min(orbit2, 255 - orbit2)*shadeStray;
	var or1d = Math.round((or1dZone*2)*mongleRange(++seed) - or1dZone);
	var or2d = Math.round((or2dZone*2)*mongleRange(++seed) - or2dZone);
	var shade1 = (orbit1 + or1d);
	var shade2 = (orbit1 - or1d);
	var shade3 = (orbit2 + or2d);
	var shade4 = (orbit2 - or2d);
	var nextel = elevation-1;
	if(nextel == 0){
		var pixp = 4*idat.width*y + 4*x;
		var dat = idat.data;
		dat[pixp] = shade1;
		dat[++pixp] = shade1;
		dat[++pixp] = shade1;
		dat[++pixp] = 255;
		dat[++pixp] = shade2;
		dat[++pixp] = shade2;
		dat[++pixp] = shade2;
		dat[++pixp] = 255;
		pixp += 4*idat.width -7;
		dat[pixp] = shade3;
		dat[++pixp] = shade3;
		dat[++pixp] = shade3;
		dat[++pixp] = 255;
		dat[++pixp] = shade4;
		dat[++pixp] = shade4;
		dat[++pixp] = shade4;
		dat[++pixp] = 255;
	}else{
		var scale = Math.pow(2, nextel);
		arguments.callee(x,       y,       shade1, ++seed,  nextel); //(In other words; this_function(...) )
		arguments.callee(x+scale, y,       shade2, ++seed,  nextel);
		arguments.callee(x,       y+scale, shade3, ++seed,  nextel);
		arguments.callee(x+scale, y+scale, shade4, ++seed,  nextel);
	}
}

var fractalRecurseOldWholeExtWorkhorseShade1;
var fractalRecurseOldWholeExtWorkhorseShade2;
var fractalRecurseOldWholeExtWorkhorseShade3;
var fractalRecurseOldWholeExtWorkhorseShade4;
var fractalRecurseOldWholeExtWorkhorseSeed;
function fractalRecurseOldWholeExtWorkhorse(shade, hash){
	var zoneSpan  =  ((shade >= 128)? (255 - shade) : shade)*shadeStray;
	var seed = mongle(hash);
	var od = Math.round((zoneSpan*2)*mongleRange(seed) - zoneSpan);
	var orbit1 = shade - od;
	var orbit2 = shade + od;
	var or1dZone = Math.min(orbit1, 255 - orbit1)*shadeStray;
	var or2dZone = Math.min(orbit2, 255 - orbit2)*shadeStray;
	var or1d = Math.round((or1dZone*2)*mongleRange(++seed) - or1dZone);
	var or2d = Math.round((or2dZone*2)*mongleRange(++seed) - or2dZone);
	fractalRecurseOldWholeExtWorkhorseShade1 = (orbit1 + or1d);
	fractalRecurseOldWholeExtWorkhorseShade2 = (orbit1 - or1d);
	fractalRecurseOldWholeExtWorkhorseShade3 = (orbit2 + or2d);
	fractalRecurseOldWholeExtWorkhorseShade4 = (orbit2 - or2d);
	fractalRecurseOldWholeExtWorkhorseSeed = seed;
}
function fractalRecurseOldWholeExt(x,y, shade,hash, elevation){ //relies on idat
	fractalRecurseOldWholeExtWorkhorse(shade, hash);
	var s1 = fractalRecurseOldWholeExtWorkhorseShade1;
	var s2 = fractalRecurseOldWholeExtWorkhorseShade2;
	var s3 = fractalRecurseOldWholeExtWorkhorseShade3;
	var s4 = fractalRecurseOldWholeExtWorkhorseShade4;
	var seed = fractalRecurseOldWholeExtWorkhorseSeed;
	var nextel = elevation-1;
	if(nextel == 0){
		var pixp = 4*idat.width*y + 4*x;
		var dat = idat.data;
		dat[pixp] = s1;
		dat[++pixp] = s1;
		dat[++pixp] = s1;
		dat[++pixp] = 255;
		dat[++pixp] = s2;
		dat[++pixp] = s2;
		dat[++pixp] = s2;
		dat[++pixp] = 255;
		pixp += 4*idat.width -7;
		dat[pixp] = s3;
		dat[++pixp] = s3;
		dat[++pixp] = s3;
		dat[++pixp] = 255;
		dat[++pixp] = s4;
		dat[++pixp] = s4;
		dat[++pixp] = s4;
		dat[++pixp] = 255;
	}else{
		var scale = Math.pow(2, nextel);
		arguments.callee(x,       y,       s1, ++seed,  nextel); //(In other words; this_function(...) )
		arguments.callee(x+scale, y,       s2, ++seed,  nextel);
		arguments.callee(x,       y+scale, s3, ++seed,  nextel);
		arguments.callee(x+scale, y+scale, s4, ++seed,  nextel);
	}
}

var fractalRecurseOldWholeExtWorkhorseCAShades = new Uint8ClampedArray(4);
var fractalRecurseOldWholeExtWorkhorseCASeed;
function fractalRecurseOldWholeExtWorkhorseCA(shade, hash){
	var zoneSpan  =  shadeStray*((shade >= 128)? (255 - shade) : shade);
	var seed = mongle(hash);
	var od = Math.round((zoneSpan*2)*mongleRange(seed) - zoneSpan);
	var orbit1 = -od + shade;
	var orbit2 =  od + shade;
	var or1dZone = Math.min(orbit1, 255 - orbit1)*shadeStray;
	var or2dZone = Math.min(orbit2, 255 - orbit2)*shadeStray;
	var or1d = Math.round((or1dZone*2)*mongleRange(++seed) - or1dZone);
	var or2d = Math.round((or2dZone*2)*mongleRange(++seed) - or2dZone);
	fractalRecurseOldWholeExtWorkhorseCAShades[0] = (orbit1 + or1d);
	fractalRecurseOldWholeExtWorkhorseCAShades[1] = (orbit1 - or1d);
	fractalRecurseOldWholeExtWorkhorseCAShades[2] = (orbit2 + or2d);
	fractalRecurseOldWholeExtWorkhorseCAShades[3] = (orbit2 - or2d);
	fractalRecurseOldWholeExtWorkhorseCASeed = seed;
}
function fractalRecurseOldWholeExtCA(x,y, shade,hash, elevation){ //relies on idat
	if(hold.length < 12) hold.push(shade);
	fractalRecurseOldWholeExtWorkhorseCA(shade, hash);
	var seed = fractalRecurseOldWholeExtWorkhorseCASeed;
	var heldShades = new Uint8ClampedArray(4);
	heldShades[0] = fractalRecurseOldWholeExtWorkhorseCAShades[0];
	heldShades[1] = fractalRecurseOldWholeExtWorkhorseCAShades[1];
	heldShades[2] = fractalRecurseOldWholeExtWorkhorseCAShades[2];
	heldShades[3] = fractalRecurseOldWholeExtWorkhorseCAShades[3];
	var nextel = elevation-1;
	if(nextel === 0){
		var pixp = 4*idat.width*y + 4*x;
		var dat = idat.data;
		dat[pixp] = heldShades[0];
		dat[++pixp] = heldShades[0];
		dat[++pixp] = heldShades[0];
		dat[++pixp] = 255;
		dat[++pixp] = heldShades[1];
		dat[++pixp] = heldShades[1];
		dat[++pixp] = heldShades[1];
		dat[++pixp] = 255;
		pixp += 4*idat.width -7;
		dat[pixp] = heldShades[2];
		dat[++pixp] = heldShades[2];
		dat[++pixp] = heldShades[2];
		dat[++pixp] = 255;
		dat[++pixp] = heldShades[3];
		dat[++pixp] = heldShades[3];
		dat[++pixp] = heldShades[3];
		dat[++pixp] = 255;
	}else{
		var scale = Math.pow(2, nextel);
		arguments.callee(x,       y,       heldShades[0], ++seed,  nextel);
		arguments.callee(x+scale, y,       heldShades[1], ++seed,  nextel);
		arguments.callee(x,       y+scale, heldShades[2], ++seed,  nextel);
		arguments.callee(x+scale, y+scale, heldShades[3], ++seed,  nextel);
	}
}


var shadeUL;
var hashUL;
var shadeUR;
var hashUR;
var shadeBL;
var hashBL;
var shadeBR;
var hashBR;
var mutagenUpper = 1;
var mutagenLower = 0.3;
var mutagenDiff = mutagenUpper - mutagenLower;
function descendFrom(shade, hash){ //outputs to the globals listed above.
	var variance = (shade >= 128)? 1 : 0.64;
	var zoneSpan =  ((shade >= 128)? (255 - shade) : shade)*variance;
	var seed = mongle(hash);
	var mongran;
	var mutagen;
	var altSeed = mongle(seed);
	mongran = mongleRange(++seed);
	mutagen = mutagenLower + (1 - mongran)*mutagenDiff;
	var od = Math.round(zoneSpan*Math.pow(mongran,mutagen));
	var orbit1;
	var orbit2;
	if((altSeed&1) > 0){
		orbit1 = shade + od;
		orbit2 = shade - od;
	}else{
		orbit1 = shade - od;
		orbit2 = shade + od;
	}
	var or1dZone = Math.min(orbit1, 255 - orbit1)*variance;
	var or2dZone = Math.min(orbit2, 255 - orbit2)*variance;
	mongran = mongleRange(++seed);
	mutagen = mutagenLower + (1 - mongran)*mutagenDiff;
	var or1d = Math.round(or1dZone*Math.pow(mongran,mutagen));
	mongran = mongleRange(++seed);
	mutagen = mutagenLower + (1 - mongran)*mutagenDiff;
	var or2d = Math.round(or2dZone*Math.pow(mongran,mutagen));
	if((altSeed&2) > 0){
		shadeUL = (orbit1 + or1d);
		shadeUR = (orbit1 - or1d);
	}else{
		shadeUL = (orbit1 - or1d);
		shadeUR = (orbit1 + or1d);
	}
	if((altSeed&4) > 0){
		shadeBL = (orbit2 + or2d);
		shadeBR = (orbit2 - or2d);
	}else{
		shadeBL = (orbit2 - or2d);
		shadeBR = (orbit2 + or2d);
	}
	hashUL = ++seed;
	hashUR = ++seed;
	hashBL = ++seed;
	hashBR = ++seed;
}
function fractalRecurse(x,y,shade,hash, elevation){ //relies on idat
	descendFrom(shade, hash);
	var sUL = shadeUL; var hUL = hashUL;
	var sUR = shadeUR; var hUR = hashUR;
	var sBL = shadeBL; var hBL = hashBL;
	var sBR = shadeBR; var hBR = hashBR;
	var nextel = elevation-1;
	if(nextel == 0){
		var pixp = 4*idat.width*y + 4*x;
		var dat = idat.data;
		dat[pixp] = sUL;
		dat[++pixp] = sUL;
		dat[++pixp] = sUL;
		dat[++pixp] = 255;
		dat[++pixp] = sUR;
		dat[++pixp] = sUR;
		dat[++pixp] = sUR;
		dat[++pixp] = 255;
		pixp += 4*idat.width -7;
		dat[pixp] = sBL;
		dat[++pixp] = sBL;
		dat[++pixp] = sBL;
		dat[++pixp] = 255;
		dat[++pixp] = sBR;
		dat[++pixp] = sBR;
		dat[++pixp] = sBR;
		dat[++pixp] = 255;
	}else{
		var scale = Math.pow(2, nextel);
		arguments.callee(x,       y,       sUL, hUL,  nextel); //(In other words; this_function(...) )
		arguments.callee(x+scale, y,       sUR, hUR,  nextel);
		arguments.callee(x,       y+scale, sBL, hBL,  nextel);
		arguments.callee(x+scale, y+scale, sBR, hBR,  nextel);
	}
}

function drawFractal(canvasContext, x,y,shade,hash,elevation){
	idat = canvasContext.getImageData(0,0, canvasContext.canvas.width, canvasContext.canvas.height  );
	fractalRecurse(x,y,shade,hash,elevation  );
	canvasContext.putImageData(idat, 0,0  );
}

var descendDeeplyFromOutShade;
var descendDeeplyFromOutHash;
function descendDeeplyFrom(shade, hash, address){
	var s = shade, h = hash;
	for(var i=0; i<address.length; ++i){
		descendFrom(s, h);
		var curDir = address[i];
		switch(curDir){
		case 'w':
			s = shadeUL;  h = hashUL;  break;
		case 'n':
			s = shadeUR;  h = hashUR;  break;
		case 's':
			s = shadeBL;  h = hashBL;  break;
		case 'e':
			s = shadeBR;  h = hashBR;  break;
		}
	}
	descendDeeplyFromOutShade = s;
	descendDeeplyFromOutHash = h;
}

function produceVision(shade, hash, magnitude){
	var renderedCan = document.createElement('canvas');
	var span = Math.pow(2,magnitude);
	renderedCan.width = span;
	renderedCan.height = span;
	var renderedCon = renderedCan.getContext('2d');
	drawFractal(renderedCon, 0,0, shade, hash, magnitude);
	return renderedCan;
}
