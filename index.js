const fs = require("fs");
const tf = require("@tensorflow/tfjs-node")
const cocossd = require("@tensorflow-models/coco-ssd");
const screenshot = require("screenshot-desktop");
// const BufferImage = require("buffer-image");
const Electron = require("electron");
const { overlayWindow } = require("electron-overlay-window");

// Main function
let width = 3240;
let height = 2160
let net;

async function startProgram() {
	Electron.app.on("ready", async () => {
		const { app, BrowserWindow } = Electron;
		const window = new BrowserWindow({
			width,
			height,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
			...overlayWindow.WINDOW_OPTS
		});

		window.loadURL(`file://${__dirname}/index.html`);
		// NOTE: if you close Dev Tools overlay window will lose transparency
		window.webContents.openDevTools({ mode: "detach", activate: false });
		overlayWindow.attachTo(window, "Untitled - Notepad");

		Electron.globalShortcut.register("CmdOrCtrl + f1", async () => {
			await cocossd.load();

			const toSend = { width, height };
			window.webContents.send("hello-world", toSend)
		});

		Electron.globalShortcut.register("CmdOrCtrl + f2", async () => {
			const imageBuffer = await screenshot();
			const imageTensor = tf.node.decodeImage(imageBuffer);

			// Make Detections
			const obj = await net.detect(imageTensor);
			const toSend = { image, class: obj.class, bbox: obj.bbox };
			window.webContents.send("draw", toSend);
		})
	});
}

startProgram();