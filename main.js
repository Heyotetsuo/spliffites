var doc=document,win=window,SZ,nums,temp;
var abs=Math.abs,rnd=Math.random,round=Math.round,max=Math.max,min=Math.min;
var ceil=Math.ceil,floor=Math.floor,sin=Math.sin,cos=Math.cos,PI=Math.PI;
var CVS=doc.querySelector("#comp1"),CVS2=doc.querySelector("#comp2");
var C=CVS.getContext("2d"),C2=CVS2.getContext("2d");
function normInt(s){ return parseInt(s,32)-SZ }
function d2r(n){ return n*PI/180 }
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function clear( C ){ C.clearRect(0,0,SZ,SZ) }
function getNums2(){
	var hashSingles=[],seed,rvs,i=0;
	seed = parseInt( tokenData.hash.slice(0,16), 16 );
	for(i=0;i<64;i++) hashPairs.push(tokenData.hash.charAt(i));
	rvs = hashPairs.map(n=>parseInt(n,16));
	return rvs;
}
function getNums(){
	var hashPairs=[],seed,rvs,i=0;
	seed = parseInt( tokenData.hash.slice(0,16), 16 );
	for(i=0;i<32;i++){
		hashPairs.push(
			tokenData.hash.slice( 2+(i*2),4+(i*2) )
		);
	}
	rvs = hashPairs.map(n=>parseInt(n,16));
	return rvs;
}
function xhrIsReady( xhr ){ return xhr.readyState === 4 && xhr.status === 200; }
function xhrPOST( url, callback ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if ( xhrIsReady(xhr) ){
			callback( xhr.response );
		}
	}
	xhr.open( "POST", url );
	xhr.send();
}
function canvasAction( callback ){
	C.save();
	C2.save();
	C.beginPath();
	callback( [].slice.call(arguments,1) );
	C.restore()
	C2.restore();
}
function addClump(x, y, s){
	var px, py, ax, ay, bx, by, cx, cy, i;
	var n=8, sz=40*s, spkSZ=2;
	px = x + sin( (0/n)*PI*2 )*sz;
	py = y + cos( (0/n)*PI*2 )*sz;
	C.beginPath();
	C.moveTo( px, py );
	for( i=1; i<=n; i++ ){
		cx = x + sin( (i/n)*PI*2 )*sz;
		cy = y + cos( (i/n)*PI*2 )*sz;
		ax = px + (px-x) * rnd();
		ay = py + (py-y) * rnd();
		bx = cx + (cx-x) * rnd();
		by = cy + (cy-y) * rnd();
		C.bezierCurveTo( ax, ay, bx, by, cx, cy );
		px = cx, py = cy;
	}
	C.fillStyle = "#cef";
	C.fill();
	C.lineWidth = 2;
	C.strokeStyle = "#08f";
	C.stroke();
}
function addShape(shape, s, o, C){
	var vs = shape.verts;
	var l = vs.length;
	var is = shape.ins || null;
	var os = shape.outs || null;
	var x = (o?o[0]:0), y = (o?o[1]:0);
	var ax, ay, bx, by, cx, cy;
	var i,j,k;
	C.beginPath();
	C.moveTo( x+vs[l-1][0]*s[0], y+vs[l-1][1]*s[1] );
	for( i=l; i<=l*2+(0); i++ ){
		j = (i-1)%l, k = i%l;
		os ? ax = x+(vs[j][0]+os[j][0])*s[0]:null;
		os ? ay = y+(vs[j][1]+os[j][1])*s[1]:null;
		is ? bx = x+(vs[k][0]+is[k][0])*s[0]:null;
		is ? by = y+(vs[k][1]+is[k][1])*s[1]:null;
		cx = x+vs[k][0]*s[0];
		cy = y+vs[k][1]*s[1];
		if ( is && os ){
			C.bezierCurveTo( ax, ay, bx, by, cx, cy );
		} else {
			C.lineTo( cx, cy );
		}
	}
}
function renderLayer( layer, s, o, C ){
	var shape,path,p,q;
	for( p in layer ){
		shape = layer[p];
		for( q in shape ){
			if ( !q.match(/stroke|fill/) ){
				addShape( shape[q], s, o, C );
				C.lineJoin = "round";
				C.fillStyle = shape.fill;
				if ( shape.stroke ){
					C.lineWidth = shape.stroke.w;
					C.strokeStyle = shape.stroke.style;
				}
				C.fill();
				C.stroke();
			}
		}
	}
}
function transWithAnchor( x, y, C, callback ){
	C.translate( x, y );
	callback( [].slice.call(arguments,3) );
	C.translate( x*-1, y*-1 );
}
function init(){
	CVS.width = 800;
	CVS.height = 800;
	getNums();
}
function render(){
	var x, y, i;
	for ( i=0; i<100; i++ ){
		x = 400 + rnd()*400-200;
		y = 400 + rnd()*200-100;
		addClump( x, y, (rnd()/2)+0.5 );
	}
}
function main(){
	init();
	render();
}
main();
