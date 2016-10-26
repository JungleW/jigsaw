var canvas = document.getElementById('canvas');
	canvas.height = canvas.width = document.body.clientWidth;
var	context = canvas.getContext('2d'),
	scoreboard = document.getElementById('scoreboard'),
	launchAngleOutput = document.getElementById('launchAngleOutput'),
	launchVelocityOutput = document.getElementById('launchVelocityOutput'),

	elapsedTime = undefined,
	launchTime = undefined,

	score = 0,
	lastScore = 0,

	threePointer = false,
	needInstructions = true,
	LAUNCHPAD_X = context.canvas.width/3,
	LAUNCHPAD_Y = context.canvas.height/3*2,
	lastMouse = {left: LAUNCHPAD_X, top: LAUNCHPAD_Y},
	LAUNCHPAD_WIDTH = 50,
	LAUNCHPAD_HEIGHT = 12,
	LAUNCHPAD_RADIUS = 12,
	BALL_RADIUS = 12,
	ARENA_LENGTH_IN_METERS = 10,
	INITIAL_LAUNCH_ANGLE = Math.PI / 4,

	launchAngle = INITIAL_LAUNCH_ANGLE,

	pixelsPerMeter = canvas.width / ARENA_LENGTH_IN_METERS,

	launchPadPainter = {
		LAUNCHPAD_FILL_STYLE: 'rgb(100, 140, 230)',

		paint: function(ledge, context) {
			context.save();
			context.fillStyle = this.LAUNCHPAD_FILL_STYLE;
			context.beginPath();
			context.arc(LAUNCHPAD_X, LAUNCHPAD_Y, 
							3, 0, Math.PI*2, false);
			context.fill();
			context.restore();
		}
	},

	launchPad = new Sprite('launchPad', launchPadPainter), 

	ballPainter = {
		BALL_FILL_STYLE: 'rgb(255, 255, 0)',
		BALL_STROKE_STYLE: 'rgb(0, 0, 0, 0.4)',

		paint: function (ball, context) {
			context.save();
			context.shadowColor = undefined;
			context.lineWidth = 2;
			context.fillStyle = this.BALL_FILL_STYLE;
			context.strokeStyle = this.BALL_STROKE_STYLE;

			context.beginPath();
			context.arc(ball.left, ball.top, 
						ball.radius, 0, Math.PI*2, false);
			context.clip();
			context.fill();
			context.stroke();
			context.restore();
		}
	}, 

	lob = {
		lastTime: 0,
		GRAVITY_FORCE: 9.81,

		applyGravity: function (elapsed) {
			ball.velocityY =  (launchVelocity * Math.sin(launchAngle)) +
								(this.GRAVITY_FORCE * elapsed);
		},

		updateBallPosition: function (updateDelta) {
			ball.left += ball.velocityX*(updateDelta)*pixelsPerMeter;
			ball.top += ball.velocityY*(updateDelta)*pixelsPerMeter;
		},

		checkForThreePointer: function () {
			if(ball.top < 0) {
				threePointer = true;
			}
		}, 

		checkBallBounds: function () {
			if (ball.top > canvas.height || ball.left > canvas.width || ball.left < 0) {
				reset();
			}
		},
		execute: function (ball, context, time) {
			var elapsedFrameTime,
				elapsedFlightTime;

			if (ballInFlight && this.lastTime) {
				elapsedFrameTime = (time - this.lastTime)/1000;
				elapsedFlightTime = (time - launchTime)/1000;
				this.applyGravity(elapsedFlightTime);
				this.updateBallPosition(elapsedFrameTime);
				this.checkBallBounds();
			}
			this.lastTime = time;
		}
	},
	ball = new Sprite('ball', ballPainter, [lob]),
	ballInFlight = false,

	catchBall = {
		ballInBucket: function() {
			return ball.left > bucket.left &&
					ball.left+ball.radius/2 < bucket.left + bucket.width &&
					ball.top+ball.height > bucket.top+10 && ball.top < bucket.top+10;
		},

		adjustScore: function() {
			if (threePointer) lastScore = 3;
			else lastScore = 2;
			score += lastScore;
			scoreboard.innnerText = score;
		},
		execute: function (bucket, context, time) {
			if (ballInFlight && this.ballInBucket()) {
				reset();
				this.adjustScore();
			}
		}
	},
	BUCKET_X = canvas.width - 100,
	BUCKET_Y = canvas.height - 100,
	bucketImage = new Image(),
	bucket = new Sprite(
		'bucket', 
		{
			paint: function (sprite, context) {
				context.drawImage(bucketImage, BUCKET_X, BUCKET_Y);
			}
		}, 
		[ catchBall ]
	);	

function windowToCanvas(x, y) {
	var bbox = canvas.getBoundingClientRect();
	console.log(x, ",", y)
	return {
		x: x - bbox.left * (canvas.width / bbox.width),
		y: y - bbox.top * (canvas.height / bbox.height)
	};
}
function reset() {
	ball.left = LAUNCHPAD_X;
	ball.top = LAUNCHPAD_Y;
	ball.velocityX = 0;
	ball.velocityY = 0;
	ballInFlight = false;
	needInsructions = false;
	lastScore = 0;
	lastMouse = {left: LAUNCHPAD_X, top: LAUNCHPAD_Y};
}
function showText(text) {
	var metrics;

	context.font = '24px Helvetica';
	metrics = context.measureText(text);

	context.save();
	context.shadowColor = undefined;
	context.strokeStyle = 'rgb(80, 120, 210)';;
	context.fillStyle = 'rgba(100, 140, 230, 0.5)';

	context.fillText(text, canvas.width/2 - metrics.width/2, canvas.height/2);
	context.strokeText(text, canvas.width/2 - metrics.width/2, canvas.height/2);
	context.restore();
}
function drawGuidewire() {
	context.moveTo(LAUNCHPAD_X, LAUNCHPAD_Y);
	context.lineTo(lastMouse.left, lastMouse.top);
	context.stroke();
}
function updateBackgroundText() {
	if (lastScore == 3) showText('Three pointer!');
	else if (lastScore == 2) showText('Nice shot!');
	else if(needInstructions) showText('Drag to launch ball');
}
function resetScoreLater() {
	setTimeout(function(){
		lastScore = 0;
	}, 1000);
};
function updateSpreites(time) {
	bucket.update(context, time);
	launchPad.update(context, time);
	ball.update(context, time);
}
function paintSprites() {
	launchPad.paint(context);
	bucket.paint(context);
	ball.paint(context);
}

var draging = false;
var selecting = false;
function releaseBall(e) {
	var rect;
	e.preventDefault();

	if ( ! ballInFlight && draging) {
		ball.velocityX = launchVelocity * Math.cos(launchAngle);
		ball.velocityY = launchVelocity * Math.sin(launchAngle);
		ballInFlight = true;
		threePointer = false;
		launchTime = new Date().getTime();
	}
	draging = false;
	selecting = false;
}
function selectBall(e) {
	var rect;
	e.preventDefault();

	if(e.clientX){
		loc = windowToCanvas(e.clientX, e.clientY);
	}else{
		loc = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
	}
	if( Math.pow(loc.x-LAUNCHPAD_X, 2) + Math.pow(loc.y-LAUNCHPAD_Y, 2) < Math.pow(BALL_RADIUS, 2)) {
		selecting = true;
	}
}
function dragBall(e) {
	var rect;
	e.preventDefault();
	if ( ! ballInFlight && selecting) {	
		if(e.clientX){
			loc = windowToCanvas(e.clientX, e.clientY);
		}else{
			loc = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
		}
		lastMouse.left = loc.x;
		lastMouse.top = loc.y;

		ball.left = lastMouse.left;
		ball.top = lastMouse.top;

		deltaX = LAUNCHPAD_X - lastMouse.left;
		deltaY = LAUNCHPAD_Y - lastMouse.top;

		launchAngle = Math.atan(parseFloat(deltaY) / parseFloat(deltaX));
		launchVelocity = 4 * deltaY / Math.sin(launchAngle) / pixelsPerMeter;

		launchVelocityOutput.innerText = launchVelocity.toFixed(2);
		launchAngleOutput.innerText = Math.abs((launchAngle * 180/Math.PI).toFixed(2));
		draging = true;
	}
}
canvas.addEventListener('mousedown', selectBall);
canvas.addEventListener('mousemove', dragBall);
canvas.addEventListener('mouseup', releaseBall);
canvas.addEventListener('touchstart', selectBall);
canvas.addEventListener('touchmove', dragBall);
canvas.addEventListener('touchend', releaseBall);

function animate() {
	var time = new Date().getTime();
	elapsedTime = (time - launchTime) / 1000;
	context.clearRect(0, 0, canvas.width, canvas.height);

	if ( ! ballInFlight ) {
		drawGuidewire();
		updateBackgroundText();

		if (lastScore !== 0 ) {
			resetScoreLater();
		}
	}
	updateSpreites(time);
	paintSprites();
	window.requestNextAnimationFrame(animate);
}


ball.width = BALL_RADIUS/2;
ball.height = ball.width;
ball.left = LAUNCHPAD_X;
ball.top = LAUNCHPAD_Y;
ball.radius = BALL_RADIUS;

context.lineWidth = 0.5;
context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
context.shadowColor = 'rgba(0, 0, 0, 0.5)';
context.shadowOffsetX = 2;
context.shadowOffsetY = 2;
context.shadowBlur = 4;
context.stroke();

bucketImage.src = '/images/bucket.png';
bucketImage.onload = function() {
	bucket.left = BUCKET_X;
	bucket.top = BUCKET_Y;
	bucket.width = bucketImage.width;
	bucket.height = bucketImage.height;
}
window.requestNextAnimationFrame(animate);

