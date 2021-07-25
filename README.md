# simple-ai-assist
Aim assist using AI


## Notes

### Microsoft Custom Vision
Can't seem to import TFJS and Custom Vision together. When using a model, construct the TF object within the propritary package.\
Change `\node_modules\@microsoft\customvision-tfjs-node\lib\index.js:97` to `return _this._preprocess(tf.browser.fromPixels(pixels));`\
This will process the image by its raw pixels instead of parsing it to an image file. Screenshots return raw pixel array without image encoding.

### Robot JS
http://robotjs.io/docs/electron


### TFJS Bindings
https://github.com/nodejs/node-gyp#on-windows\
Used for building the TFJS libraries. Maybe due to the wrong Python version, it fails to build from `npm install` command, therefore we use `node-pre-gyp` to manually build it\
node_modules/@tensorflow/tfjs-node > `node-pre-gyp rebuild`\
node_modules/@tensorflow/tfjs-node > https://github.com/tensorflow/tfjs/issues/4171#issuecomment-723415963\
root > `npm rebuild @tensorflow/tfjs-node --build-addon-from-source`\