const fs = require("fs");
const tf = require("@tensorflow/tfjs-node")
const cocossd = require("@tensorflow-models/coco-ssd");
const screenshot = require("screenshot-desktop");
const robot = require("robotjs");
// const hotkeys = require("node-hotkeys");
// const Canvas = require("canvas");

const Electron = require("electron");
const Overlay = require("electron-overlay-window");

// Main function
let intervalCode = 0;
let isActive = false;
let myActor = null;
let sensitivity = 1;

async function startProgram() {
	// hotkeys.on({
	// 	hotkeys: "ctrl + shift + a",
	// 	matchAllModifiers: true,
	// 	callback: () => { 
	// 		myActor = new Actor();
	// 		isActive = !isActive;
	// 	}
	// });

	// hotkeys.on({
	// 	hotkeys: "ctrl + shift + q",
	// 	matchAllModifiers: true,
	// 	callback: () => { 
	// 		sensitivity++;
	// 	}
	// });

	// hotkeys.on({
	// 	hotkeys: "ctrl + shift + e",
	// 	matchAllModifiers: true,
	// 	callback: () => { 
	// 		if(sensitivity <= 1) return;
	// 		sensitivity--;
	// 	}
	// });

	const net = await cocossd.load();
	
	myActor = new Actor();
	isActive = !isActive;

	console.log("Setup complete");
	const callback = async () => {
		const imageBuffer = await screenshot();
		const imageTensor = tf.node.decodeImage(imageBuffer);

		// Make Detections
		const obj = await net.detect(imageTensor);
		await myActor.perform(imageBuffer, obj);
	};

	function callbackLoop(callback) {
		isActive && callback();
		clearTimeout(intervalCode);
		intervalCode = setTimeout(callbackLoop, 1000, callback);
	}

	callbackLoop(callback);
}

class Actor {
	artist;

	constructor() {
		this.artist = new Artist();
	}

	async perform(image, sensors) {
		if(sensors.length > 0) {
			const mouse = robot.getMousePos();
			const toFilter = sensors.filter(a => a.class === "person");
			for(let sensor of toFilter) {
				const moueDestX = sensor.bbox[0] + (sensor.bbox[2] / 2);
				const mouesDestY = sensor.bbox[1] + (sensor.bbox[3] / 2);
				// Transform mouse to center
				robot.moveMouse(mouseDestX / sensitivity, mouseDestY / sensitivity);
				await this.artist.box(image, sensor);
			}
			await this.artist.save(new Date().valueOf() + " - final.jpg");
		}
	}
}

class Artist {
	canvas;
	ctx;

	constructor(image) {

		const BrowserWindow = Electron.BrowserWindow;
		const window = new BrowserWindow({
			...Overlay.overlayWindow.WINDOW_OPTS,
			width: 3240,
			height: 2160,
			resizable: false
		});

		window.loadURL(`data:text/html;charset=utf-8,
			<head>
				<title>overlay-demo</title>
			</head>
			
			<body style="padding: 0; margin: 0;">
				<canvas>
				
				<script>
					this.canvas = document.createElement("canvas");
					this.canvas.width  = 3240 / 2;
					this.canvas.height = 2160 / 2;
					this.ctx = this.canvas.getContext("2d");
					this.ctx.font = "30px Arial";
					this.ctx.fillStyle = "red";
					this.ctx.strokeStyle = "rgba(254,0,0,1)";

					
					const toDraw = await Canvas.loadImage(image);
					this.ctx.drawImage(toDraw, 0, 0, this.canvas.width, this.canvas.height);
					
					const bbox = sensor.bbox;
					this.ctx.fillText(sensor.class, bbox[0] / 2, (bbox[1] / 2) + bbox[3] / 4);
					this.ctx.strokeRect(bbox[0] / 2, bbox[1] / 2, bbox[2] / 2, bbox[3] / 2);
				</script>
			</body>
		`)

		// NOTE: if you close Dev Tools overlay window will lose transparency 
		window.webContents.openDevTools({ mode: "detach", activate: false })
		window.setIgnoreMouseEvents(true)

		Overlay.overlayWindow.attachTo(window, "Battlefield™ V");
	}

	async box(image, sensor) {
		const toDraw = await Canvas.loadImage(image);
		this.ctx.drawImage(toDraw, 0, 0, this.canvas.width, this.canvas.height);
		
		const bbox = sensor.bbox;
		this.ctx.fillText(sensor.class, bbox[0] / 2, (bbox[1] / 2) + bbox[3] / 4);
		this.ctx.strokeRect(bbox[0] / 2, bbox[1] / 2, bbox[2] / 2, bbox[3] / 2);
	}
	
	async save(filename) {
		// const toSave = this.canvas.toDataURL();
		// const data = toSave.replace(/^data:image\/\w+;base64,/, "");
		// const buf = Buffer.from(data, "base64");
		// await fs.writeFile(filename, buf, () => {});
	}
}

startProgram();