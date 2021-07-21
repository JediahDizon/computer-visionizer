const fs = require("fs");
const tf = require("@tensorflow/tfjs-node")
const cocossd = require("@tensorflow-models/coco-ssd");
const screenshot = require("screenshot-desktop");
const BufferImage = require("buffer-image");

// Main function
async function startProgram() {
	const net = await cocossd.load();
	console.log("Setup complete. Looping Now");

	//  Loop and detect hands
	setInterval(async () => {
			const imageBuffer = await screenshot();
			const imageTensor = tf.node.decodeImage(new Uint8Array(results[1]), 3);

			// fs.writeFile("test.jpg", imageBuffer, (err) => {
			// 	if (err) return console.error(err)
			// 	console.log('file saved');
			// })

			// console.log(image);


			// Make Detections
			const obj = await net.detect(imageTensor);
			console.log(obj);
	}, 1000);
}

startProgram();