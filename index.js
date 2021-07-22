// const tf = require("@tensorflow/tfjs-node");
const tf = require("@tensorflow/tfjs-node-gpu");
const cocossd = require("@tensorflow-models/coco-ssd");
const Electron = require("electron");
const { overlayWindow } = require("electron-overlay-window");
const { DesktopDuplication } = require('windows-desktop-duplication');

let net;
let width = 3240;
let height = 2160;
let windowName = "Origin"; // "Battlefield™ V";

function startProgram() {
	Electron.app.on("ready", async () => {	
		// Load Neural Network
		net = await cocossd.load();

		const { app, BrowserWindow } = Electron;
		const window = new BrowserWindow({
			webPreferences: {
				width,
				height,
				nodeIntegration: true,
				contextIsolation: false,
			},
			...overlayWindow.WINDOW_OPTS
		});

		window.loadURL(`file://${__dirname}/index.html`);
		// NOTE: if you close Dev Tools overlay window will lose transparency
		window.webContents.openDevTools({ mode: "detach", activate: false });
		window.setIgnoreMouseEvents(true);
		overlayWindow.attachTo(window, windowName);

		// Send Config to front-end
		const dimensions = { width, height }
		window.webContents.send("hello-world", dimensions);


		// ========================================================
		// DEPREATED
		// Screenshot function too slow
		
		// async function loop() {
		// 	// Slow but works
		// 	const imageBuffer = await screenshot({ screen: windowName });
		// 	const imageTensor = tf.node.decodeImage(imageBuffer);
		// 	const detections = await net.detect(imageTensor);
		// 	setTimeout(loop, 10);

		// 	const toSend = { detections };
		// 	window.webContents.send("draw", toSend);
		// }
		// setTimeout(loop, 10);

		// ========================================================
		// DEPRECATED
		// Can't stream direct video to model because model needs complete picture everytime

		// const process = spawn(
		// 	ffmpeg, 
		// 	[
		// 		"-f", "gdigrab",
    //     "-i", "desktop",
		// 		"-f", "image2",
    //     "-"
    // 	], 
		// 	{ stdio: "pipe" }
		// );

		// process.stdout.on("data", async chunk => {
		// 	try {
		// 		// Fast but not work lmao
		// 		const imageBuffer = new Uint8Array(chunk);
		// 		// const imageTensor = tf.node.decodeImage(imageBuffer);
		// 		const detections = await net.detect({ data: imageBuffer, width, height });

		// 		const toSend = { detections };
		// 		window.webContents.send("draw", toSend);
		// 	} catch(e) {
		// 		console.error(e);
		// 	} 
		// });

		// process.stdout.on("end", async () => {
		// 	// const imageBuffer = new Uint8Array(accumulator);
		// 	// const imageTensor = tf.node.decodeImage(imageBuffer);
		// 	// const detections = await net.detect(imageTensor);
		// 	// console.log(detections);

		// 	// const toSend = {
		// 	// 	detections
		// 	// };
		// 	// window.webContents.send("draw", toSend);
		// 	console.log("All the data in the file has been read");
		// })
		// process.stdout.on('close', function (err) {
		// 	console.log('Stream has been destroyed and file has been closed');
		// });

		
		// ========================================================
		// WORKING
		// Still slow but maybe just a GPU problem

		let duplicateDesktop = new DesktopDuplication(0);
		duplicateDesktop.initialize();
		duplicateDesktop.startAutoCapture(10);
		duplicateDesktop.on("frame", async frame => {
			// Compressing doesn't speed up performance, it slows it down
			//
			// const jpegImage = jpeg.encode(frame, 100);
			// const imageTensor = tf.node.decodeImage(jpegImage.data);
			// const detections = await net.detect(imageTensor);
			
			const detections = await net.detect(frame);

			const toSend = { detections };
			window.webContents.send("draw", toSend);
		});
	});
}

startProgram();