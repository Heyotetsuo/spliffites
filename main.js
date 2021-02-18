var doc=document,win=window,SZ,seed;
var abs=Math.abs,round=Math.round,max=Math.max,min=Math.min,pow=Math.pow;
var ceil=Math.ceil,floor=Math.floor,sqrt=Math.sqrt;
var sin=Math.sin,cos=Math.cos,PI=Math.PI;
var CVS=doc.querySelector("#comp1"),CVS2=doc.querySelector("#comp2");
var C=CVS.getContext("2d"),C2=CVS2.getContext("2d");
function handleKeyPress(){}
function normInt(s){ return parseInt(s,32)-SZ }
function d2r(n){ return n*PI/180 }
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function clear( C ){ C.clearRect(0,0,SZ,SZ) }
function rand(){
	seed ^= seed << 13;
	seed ^= seed >> 17;
	seed ^= seed << 5;
	return ( (seed<0?~seed+1:seed)%1024) / 1024;
}
function printf( s, a ){
	var newS = s, i;
	for(i=0;i<a.length;i++){
		newS = newS.replace( "%s", a[i] );
	}
	return newS;
}
function canvasAction( callback ){
	C.save();
	C2.save();
	C.beginPath();
	callback( [].slice.call(arguments,1) );
	C.restore()
	C2.restore();
}
function addClump( args ){
	var x=args[0], y=args[1], s=args[2];
	var px, py, ax, ay, bx, by, cx, cy, i;
	var n=8, sz=40*s, spkSZ=2;
	px = x + sin( (0/n)*PI*2 )*sz;
	py = y + cos( (0/n)*PI*2 )*sz;
	C.beginPath();
	C.moveTo( px, py );
	for( i=1; i<=n; i++ ){
		cx = x + sin( (i/n)*PI*2 )*sz;
		cy = y + cos( (i/n)*PI*2 )*sz;
		ax = px + (px-x) * rand();
		ay = py + (py-y) * rand();
		bx = cx + (cx-x) * rand();
		by = cy + (cy-y) * rand();
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
function getPointInCircle( r, ang, rat ){
	var x = cos(ang)*r;
	var y = sin(ang)*r;
	return [
		SZ/2 + x,
		SZ/2 + (y*rat - y/2)
	];
}
function drawBG(){
	var grad = C.createRadialGradient( SZ/2, SZ/2, 1, 0, 0, SZ );
	grad.addColorStop( 0, "#eee" );
	grad.addColorStop( 1, "#ddd" );
	C.fillStyle = grad;
	C.fillRect( 0, 0, SZ, SZ );
}
function render(){
	var x, y, i, max, n=300, p=[];
	var w = rand()*(SZ*0.2)+SZ*0.2;
	var h = rand()*(SZ*0.2)+SZ*0.3;
	canvasAction( drawBG );
	for ( i=0; i<n/8; i++ ){
		p = getPointInCircle( w/2-(w/2)*(i/(n/8)), rand()*2*PI, h/w );
		canvasAction( addClump, p[0], p[1], (rand()/2)+0.5 );
	}
	for ( i=0; i<n; i++ ){
		p = getPointInCircle( w-w*(i/n*0.8), rand()*2*PI, h/w );
		canvasAction( addClump, p[0], p[1], (rand()/2)+0.5 );
	}
}
function init(){
	SZ = 800;
	CVS.width = SZ;
	CVS.height = SZ;
	seed = parseInt( tokenData.hash.slice(0,18) );
}
function main(){
	init();
	render();
}
main();
