// abbreviations
var doc=document,win=window,SZ,abs=Math.abs,round=Math.round,max=Math.max,min=Math.min,pow=Math.pow,ceil=Math.ceil,floor=Math.floor,sqrt=Math.sqrt,sin=Math.sin,cos=Math.cos,atan=Math.atan,PI=Math.PI;

var CVS=doc.querySelector("#comp1"),CVS2=doc.querySelector("#comp2");
var C=CVS.getContext("2d"),C2=CVS2.getContext("2d");
var SZ,seed,DATA;
function handleKeyPress(){}
function normInt(s){ return parseInt(s,32)-SZ }
function d2r(n){ return n*PI/180 }
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function clear( C ){ C.clearRect(0,0,SZ,SZ) }
function ellipseArea(w,h){ return PI*(w*(h||w)) }
function randint(){
	seed ^= seed << 13;
	seed ^= seed >> 17;
	seed ^= seed << 5;
	return seed;
}
function randuint(){
	return abs(randint());
}
function urand(){
	var seed = randint();
	return ( (seed<0?~seed+1:seed)%1024) / 1024;
}
function rand(){
	return urand()*2-1;
}
function printf( s, a ){
	var newS = s, i;
	for(i=0;i<a.length;i++) newS = newS.replace("%s",a[i]);
	return newS;
}
function makeClump( s ){
	var obj={shape:{verts:[],ins:[],outs:[]}},i;
	var n=round( urand()*16 )+4;
	var ax,ay,bx,by,cx,cy,i,clrs;
	for(i=0;i<n;i++){
		cx = sin( (i/n)*PI*2 )*s;
		cy = cos( (i/n)*PI*2 )*s;
		ax = cx*(urand()*1.5-.5);
		ay = cy*(urand()*1.5-.5);
		bx = cx*(urand()*1.5-.5);
		by = cy*(urand()*1.5-.5);
		obj.shape.ins.push( [ax,ay] );
		obj.shape.outs.push( [bx,by] );
		obj.shape.verts.push( [cx,cy] );
	}
	clrs = DATA.colors.common;
	obj.fill = clrs[ randuint()%clrs.length ];
	obj.stroke = { w: 2, style: obj.fill }
	return obj;
}
function renderLayer(layer,s,o,C){
	var shape,path,p,q;
	for( p in layer ){
		shape = layer[p];
		for( q in shape ){
			if ( !q.match(/stroke|fill/) ){
				canvasAction(C, ()=>{
					addShape( shape[q], s, o, C );
				});
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
function getPointInCircle( r, ang, rat ){
	var x = cos(ang)*r, y = sin(ang)*r;
	return [ SZ/2+x, SZ/2+(y*rat-y/2) ];
}
function drawBG(){
	var grad = C.createRadialGradient( SZ/2, SZ/2, 1, 0, 0, SZ );
	grad.addColorStop( 0, "#eee" );
	grad.addColorStop( 1, "#ddd" );
	C.fillStyle = grad;
	C.fillRect( 0, 0, SZ, SZ );
}
function addShape(shape,s,o,C){
	var vs = shape.verts;
	var l = vs.length;
	var is = shape.ins || null;
	var os = shape.outs || null;
	var x = (o?o[0]:0), y = (o?o[1]:0);
	var ax, ay, bx, by, cx, cy;
	var i,j,k;
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
function paintShape(shape, C){
	C.fillStyle = shape.fill;
	C.fill();
	C.lineWidth = shape.stroke.w;
	C.strokeStyle = shape.stroke.style;
	C.stroke();
}
function addShadow( C ){
	C.shadowOffsetX = 0;
	C.shadowOffsetY = 0.00625*SZ;
	C.shadowBlur = 0.0125*SZ;
	C.shadowColor = "#00000040";
}
function canvasAction( C, callback ){
	C.save();
	C.beginPath();
	callback();
	C.restore()
}
function drawClump(s, o, C){
	canvasAction( C, ()=>{
		C.translate( o[0], o[1] );
		C.rotate( randuint()%360*PI/180 );
		addShape( DATA.clump.shape, [1,1], [0,0], C );
		addShadow( C );
		paintShape( DATA.clump, C );
		C.globalCompositeOperation = "multiply";
		C.stroke();
	});
}
function render(){
	var x, y, i, p=[];
	var w = DATA.nugWidth, h = DATA.nugHeight;
	var a = ellipseArea(w,h);
	var b = ellipseArea(DATA.clumpSZ);
	var n = (a/b)*PI*2;
	canvasAction( C, drawBG );
	for ( i=0; i<n; i++ ){
		p = getPointInCircle( urand()*w, urand()*2*PI, h/w );
		drawClump( [1,1], p, C );
	}
}
function initData(){
	DATA = {
		clumpSZ: floor( urand()*0.025*SZ ) + 0.03*SZ,
		nugWidth: urand()*(SZ*0.2)+SZ*0.2,
		nugHeight: urand()*(SZ*0.2)+SZ*0.3,
		colors: {
			common:[
				"#dd7fff","#e8a7ff","#f0c5ff",
				"#e1ff26","#eaff68","#fdffa4",
				"#ff1ab1","#ff3ebd","#ff85d5"
			],
			uncommon:[
				"#ff1313","#ff4545","#ff8383",
				"#50ea38","#6bff53","#92ff81",
				"#17ccf3","#3adcff","#98edff"
			],
			rare:[
				"#c1640d","#d78d48","#d6ab84",
				"#dddddd","#ececec","#f0f0f0"
			],
			mythic:["#febc14","#fdcc4e","#ffdc83"]
		}
	};
	DATA.clump = makeClump( DATA.clumpSZ );
	DATA.clumpRad = DATA.clumpSZ * 1.5;
}
function init(){
	SZ = 800;
	CVS.width = SZ;
	CVS.height = SZ;
	seed = parseInt( tokenData.hash.slice(0,18) );
	initData();
}
function main(){
	init();
	render();
}
main();
