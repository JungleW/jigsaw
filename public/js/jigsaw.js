var canvas = document.getElementById("board"),
	context = canvas.getContext('2d'),
	image = new Image(),
	sky = new Image(),

	resetButton = document.getElementById("resetButton"),

	imageData,
	imageDataCopy = context.createImageData(canvas.width, canvas.height),

	mousedown = {},
	rubberbandRectangle = {},
	dragging = false,

	sunglassesOn = false,
	sunglassFilter = new Worker('/js/test.js'),

	offscreenCanvas = document.createElement('canvas'),
	offscreenContext = offscreenCanvas.getContext('2d');

	LENS_RADIUS = canvas.width/5,
	video,
	paused = true,
	discs = [
		{
			x:80,
			y:100,
			lastX:150,
			lastY:250,
			velocityX: 2.2,
			velocityY: 1.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:180,
			y:180,
			lastX:150,
			lastY:250,
			velocityX: 2.2,
			velocityY: 1.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:80,
			y:120,
			lastX:150,
			lastY:250,
			velocityX: 2.2,
			velocityY: 2.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:80,
			y:180,
			lastX:150,
			lastY:250,
			velocityX: 2.2,
			velocityY: 3.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:120,
			y:150,
			lastX:150,
			lastY:250,
			velocityX: 1.2,
			velocityY: 3.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:180,
			y:200,
			lastX:150,
			lastY:250,
			velocityX: 1.2,
			velocityY: 4.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:100,
			y:250,
			lastX:150,
			lastY:250,
			velocityX: 1.2,
			velocityY: 3.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:50,
			y:200,
			lastX:200,
			lastY:250,
			velocityX: -3.5,
			velocityY: 1.5,
			radius: 25,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(155, 255, 0, 0.7)',
			outerColor: 'rgba(255, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:150,
			y:200,
			lastX:250,
			lastY:250,
			velocityX: 1.2,
			velocityY: 2.5,
			radius: 55,
			innerColor: 'rgba(255,255, 0, 1)',
			middleColor: 'rgba(255, 255, 0, 0.7)',
			outerColor: 'rgba(155, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:150,
			y:150,
			lastX:190,
			lastY:250,
			velocityX: 2.2,
			velocityY: -1.5,
			radius: 25,
			innerColor: 'rgba(155,255, 0, 1)',
			middleColor: 'rgba(155, 255, 0, 0.7)',
			outerColor: 'rgba(155, 255, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:150,
			y:250,
			lastX:50,
			lastY:250,
			velocityX: 2.2,
			velocityY: 2.5,
			radius: 25,
			innerColor: 'rgba(100, 145, 230, 1)',
			middleColor: 'rgba(100, 145, 0, 0.7)',
			outerColor: 'rgba(100, 145, 0, 0.5)',
			strokeStyle: 'gray',
		},
		{
			x:150,
			y:750,
			lastX:150,
			lastY:200,
			velocityX: 1.2,
			velocityY: 1.5,
			radius: 25,
			innerColor: 'rgba(255, 0, 0, 1)',
			middleColor: 'rgba(255, 0, 0, 0.7)',
			outerColor: 'rgba(255, 0, 0, 0.5)',
			strokeStyle: 'orange',
		}
	],
	numDiscs = discs.length;


window.onload = function() {
	canvas.height = canvas.width = document.body.clientWidth;
	offscreenCanvas.width = canvas.width;
	offscreenCanvas.height = canvas.height;
	image.src = '/images/test.jpg';
	/*image.onload = function() {
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
	};*/
	sky.src = 'images/sky.jpg';
	video = document.getElementById("video");
	/*video.play();
	window.requestNextAnimationFrame(animate);*/
}

resetButton.onclick = function() {
	paused = paused ? false : true;
	if(paused) {
		resetButton.value = "Animate";
	}else{
		window.requestNextAnimationFrame(animate);
		resetButton.value = "Pause";
	}
}
context.strokeStyle = 'navy';
context.lineWidth = 1.0;

function copyCanvasPixels() {
	var i = 0;

	for(i=0; i < 3; i++) {
		imageDataCopy.data[i] = imageData.data[i];
	}

	for(i=3; i < imageData.data.length-4; i+=4) {
		imageDataCopy.data[i] = imageData.data[i]/10;
		imageDataCopy.data[i+1] = imageData.data[i+1]-20;
		imageDataCopy.data[i+2] = imageData.data[i+2]-40;
		imageDataCopy.data[i+3] = imageData.data[i+3];
	}
}

function captureCanvasPixels() {
	imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	copyCanvasPixels();
}

function restoreRubberbandPixels() {
	var deviceWidthOverCSSPixels = imageData.width / canvas.width,
		deviceHeightOverCSSPixels = imageData.height / canvas.height;

		context.putImageData(imageData, 0 , 0);
		context.putImageData(imageDataCopy, 0, 0, 
			rubberbandRectangle.left + context.lineWidth,
			rubberbandRectangle.top + context.lineWidth,
			(rubberbandRectangle.width - 2*context.lineWidth) * deviceWidthOverCSSPixels,
			(rubberbandRectangle.height - 2*context.lineWidth)*deviceHeightOverCSSPixels);
}

function setRubbrbandRectangle(x, y) {
	rubberbandRectangle.left = Math.min(x, mousedown.x);
	rubberbandRectangle.top = Math.min(y, mousedown.y);
	rubberbandRectangle.width = Math.abs(x - mousedown.x);
	rubberbandRectangle.height = Math.abs(y - mousedown.y);
}

function drawRubberband() {
	context.strokeRect( rubberbandRectangle.left + context.lineWidth,
						rubberbandRectangle.top + context.lineWidth,
						rubberbandRectangle.width - 2*context.lineWidth,
						rubberbandRectangle.height - 2*context.lineWidth);
}

function rubberbandStart(x, y) {
	mousedown.x = x;
	mousedown.y = y;

	rubberbandRectangle.left = mousedown.x;
	rubberbandRectangle.top = mousedown.y;
	rubberbandRectangle.width = 0;
	rubberbandRectangle.height = 0;

	dragging = true;

	captureCanvasPixels();
}

function rubberbandStretch(x, y) {
	if(rubberbandRectangle.width > 2 * context.lineWidth &&
		rubberbandRectangle.height > 2 * context.lineWidth) {
		if(imageData !== undefined) {
			restoreRubberbandPixels();
		}
	}

	setRubbrbandRectangle(x, y);

	if(rubberbandRectangle.width > 2*context.lineWidth &&
		rubberbandRectangle.height > 2*context.lineWidth) {
		drawRubberband();
	}
}

function rubberbandEnd() {
	context.putImageData(imageData, 0, 0);

	context.drawImage(	canvas,
						rubberbandRectangle.left + context.lineWidth * 2,
						rubberbandRectangle.top + context.lineWidth * 2,
						rubberbandRectangle.width - 4 * context.lineWidth,
						rubberbandRectangle.height - 4 * context.lineWidth,
						rubberbandRectangle.left + context.lineWidth * 2,
						rubberbandRectangle.top + context.lineWidth * 2,
						rubberbandRectangle.width - 4 * context.lineWidth,
						rubberbandRectangle.height - 4 * context.lineWidth);
						//0, 0, canvas.width, canvas.height);
	dragging = false;
	imageData = undefined;
}

/* 绘制圆 */
function drawCircle() {
	context.beginPath();
	context.arc(canvas.width/2, canvas.height/2, 30, 0, Math.PI * 2, true);
	context.fill();
}

/* 添加事件 */
canvas.addEventListener("mousedown", function(e) {
	var loc = windowToCanvas(canvas, e.clientX, e.clientY);
	e.preventDefault();
	rubberbandStart(loc.x, loc.y);
});
canvas.addEventListener("mousemove", function(e) {
	var loc;
	if( dragging ) {
		loc = windowToCanvas(canvas, e.clientX, e.clientY);
		rubberbandStretch(loc.x, loc.y);
	} 
});
canvas.addEventListener("mouseup", function(e) {
	rubberbandEnd();
});

function windowToCanvas(canvas, x, y) {
	var bbox = canvas.getBoundingClientRect();

	return {
		x: x-bbox.left * (canvas.width / bbox.width),
		y: y-bbox.top * (canvas.height / bbox.height)
	}
}

function negativeFilt() {
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
		data = imageData.data;

	for(var i=0; i<=data.length-4; i+=4) {
		data[i] = 255 - data[i];
		data[i+1] = 255 - data[i+1];
		data[i+1] = 255 - data[i+1];
	}

	context.putImageData(imageData, 0, 0);
}

function blackAndWhiteFilt() {
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
		data = imageData.data;

	for(var i=0; i<=data.length-4; i+=4) {
		var average = (data[i] + data[i+1] + data[i+2])/3;
		data[i] = average;
		data[i+1] = average;
		data[i+1] = average;
	}

	context.putImageData(imageData, 0, 0);
}

function emboss() {
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
		data = imageData.data,
		width = imageData.width,
		length = data.length;
	for(var i=0; i < length; i++) {
		if( (i+1) % 4 !== 0 ){
			data[i] = 255 / 2
						+ 2 * data[i]
						- data[i + 4]
						- data[i + width * 4];
		}
	}
	context.putImageData(imageData, 0, 0);
}

function drawOriginalImage() {
	context.drawImage(image, 0, 0, 
						image.width, image.height, 0, 0,
						canvas.width, canvas.height);
}

function drawLenses(leftLensLocation, rightLensLocation){
	context.save();
	context.beginPath();
	context.arc(leftLensLocation.x, leftLensLocation.y,
				LENS_RADIUS, 0, Math.PI*2, true);
	context.stroke();

	moveTo(rightLensLocation.x, rightLensLocation.y);

	context.arc(rightLensLocation.x, rightLensLocation.y,
				LENS_RADIUS, 0, Math.PI*2, true);
	context.stroke();

	context.clip();

	context.drawImage(offscreenCanvas, 0, 0,
					canvas.width, canvas.height);
	context.restore();
}
function drawWire(center) {
	context.beginPath();
	context.moveTo(center.x - LENS_RADIUS/4, center.y - LENS_RADIUS/2);
	context.quadraticCurveTo(center.x, center.y - LENS_RADIUS + 20,
							center.x + LENS_RADIUS/4,
							center.y - LENS_RADIUS/2);
	context.stroke();
}
function putSunglassesOn() {
	var imageData,
		center = {
			x: canvas.width/2,
			y: canvas.height/2
		},
		leftLensLocation = {
			x: center.x - LENS_RADIUS -10,
			y: center.y
		},
		rightLensLocation = {
			x: center.x + LENS_RADIUS +10,
			y: center.y
		};
	imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	
	sunglassFilter.postMessage(imageData);
	
	sunglassFilter.onmessage = function(event) {
		offscreenContext.putImageData(event.data.result, 0, 0);
		drawLenses(leftLensLocation, rightLensLocation);
		drawWire(center);
	}
}
function sunglassFilt() {
	if(sunglassesOn) {
		drawOriginalImage();
		sunglassesOn = false;
	}else{
		putSunglassesOn();
		sunglassesOn = true;
	}
}

//fileSystem
canvas.addEventListener("dragenter", function (e) {
	e.preventDefault();
	e.dataTransfer.effectAllowed = 'copy';
}, false);
canvas.addEventListener('dragover', function (e) {
	e.preventDefault();
}, false);
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
canvas.addEventListener("drop", function (e) {
	var file = e.dataTransfer.files[0];
	window.requestFileSystem(window.TEMPORARY, 5*1024*1024,
		function (fs) {
			fs.root.getFile(file.name, {create: true},
				function (fileEntry) {
					fileEntry.createWriter( function (writer) {
						writer.write(file);
					});
					image.src = fileEntry.toURL();
				},
				function (e) {
					alert(e.code);
				});
		},
		function (e) {
			alert(e.code);
		});
}, false);

//video
function animate() {
	if (!video.ended) {
		context.drawImage(video, 0, 0, canvas.width, canvas.height);
		window.requestNextAnimationFrame(animate);
	}
}

//动画
var skyOffset = 0,
	SKY_VELOCITY = 30;
function drawBackground(fps) {
	if(fps == 0) fps = 30;
	skyOffset = skyOffset < canvas.width ? 
				skyOffset + SKY_VELOCITY/fps : 0;
	context.save();
	context.translate(-skyOffset, 0);
	context.drawImage(sky, 0, 0, canvas.width, canvas.height*1.20);
	context.drawImage(sky, canvas.width, 0, canvas.width, canvas.height*1.20);
	context.restore();
}
function update() {
	var disc = null;
	for(var i=0; i<numDiscs; ++i) {
		disc = discs[i];
		if(disc.x + disc.velocityX + disc.radius > 
			context.canvas.width ||
			disc.x + disc.velocityX - disc.radius < 0) {
			disc.velocityX = -disc.velocityX;
		}
		if(disc.y + disc.velocityY + disc.radius >
			context.canvas.height ||
			disc.y + disc.velocityY - disc.radius< 0){
			disc.velocityY = -disc.velocityY;
		}
		disc.x += disc.velocityX;
		disc.y += disc.velocityY;
	}
}
function draw() {
	var disc = null;
	for(var i=0; i<numDiscs; ++i) {
		drawDisc(discs[i]);
	}
}
function drawDisc(disc){
		gradient = context.createRadialGradient(disc.x, disc.y, 0,
											disc.x, disc.y, disc.radius);
		gradient.addColorStop(0.3, disc.innerColor);
		gradient.addColorStop(0.5, disc.middleColor);
		gradient.addColorStop(1.0, disc.outerColor);

		context.save();
		context.beginPath();

		context.arc(disc.x, disc.y, disc.radius, 0, Math.PI*2, false);
		context.fillStyle = gradient;
		context.strokeStyle = disc.strokeStyle;
		context.fill();
		context.stroke();
		context.restore();
}
//计算帧速率
var lastTime = 0;
function calculateFps() {
	var now = new Date();
		fps = 1000 / (now - lastTime);

		lastTime = now;

		return fps;
}
var lastFpsUpdateTime = 0,
	lastFpsUpdate = 0;
function animate(time) {
	var fps = 0;

	if(time == undefined) {
		time = new Date();
	}

	if(!paused) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawBackground(fps);
		update();
		draw();

		fps = calculateFps();
		if(time - lastFpsUpdateTime > 1000){
			lastFpsUpdateTime = time;
			lastFpsUpdate = fps;
		}

		context.fillStyle = 'cornflowerblue';
		context.fillText(lastFpsUpdate.toFixed() + ' fps', 50, 48);
		window.requestNextAnimationFrame(animate);
	}
}
//双缓冲技术
function draw1() {
	var disc = null;

	for(var i=0; i<numDiscs; ++i) {
		drawDisc1(discs[i]);
	}
}
function drawDisc1(disc){
		gradient = offscreenContext.createRadialGradient(disc.x, disc.y, 0,
											disc.x, disc.y, disc.radius);
		gradient.addColorStop(0.3, disc.innerColor);
		gradient.addColorStop(0.5, disc.middleColor);
		gradient.addColorStop(1.0, disc.outerColor);

		offscreenContext.save();
		offscreenContext.beginPath();

		offscreenContext.arc(disc.x, disc.y, disc.radius, 0, Math.PI*2, false);
		offscreenContext.fillStyle = gradient;
		offscreenContext.strokeStyle = disc.strokeStyle;
		offscreenContext.fill();
		offscreenContext.stroke();
		offscreenContext.restore();
}
function animate1(time) {
	var fps = 0;

	if(time == undefined) {
		time = new Date();
	}

	if(!paused) {
		offscreenContext.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
		update();
		draw1();

		fps = calculateFps();
		if(time - lastFpsUpdateTime > 1000){
			lastFpsUpdateTime = time;
			lastFpsUpdate = fps;
		}

		offscreenContext.fillStyle = 'cornflowerblue';
		offscreenContext.fillText(lastFpsUpdate.toFixed() + ' fps', 50, 48);
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(offscreenCanvas, 0, 0);

		window.requestNextAnimationFrame(animate1);
	}
}
