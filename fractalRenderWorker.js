var idat;

function mongle(previous){
	// we cannot return home
	// return ((2148135791*previous)&0xFFFFFFFF + 0xB8D29D9A)&0xFFFFFFFF;
	return ((2148135791*previous)&0x7FFFFFFF + 0xB8D29D9A)&0x7FFFFFFF;
}
// invexp32 = 1/0xFFFFFFFF;
//the home that we cannot return to: the seeds never used to go negative.
// function mongleRange(previous){return mongle(previous)*invexp32;}
invexp32i = 1/0x7FFFFFFF;
function mongleRange(previous){return mongle(previous)*invexp32i;}

//outputs:
var shadeUL;
var hashUL;
var shadeUR;
var hashUR;
var shadeBL;
var hashBL;
var shadeBR;
var hashBR;
//tunings:
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

var descendDeeplyFromOutShade;
var descendDeeplyFromOutHash;
function descendDeeplyFrom(shade, hash, address){
	var s = shade;
	var h = hash;
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







self.addEventListener('message', function(ev){

idat = ev.data.imgdat;
fractalRecurse(0,0, ev.data.shade, ev.data.hash, ev.data.magnitude);
self.postMessage(ev.data.imgdat);
return false;

},false);