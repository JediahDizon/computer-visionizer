# Computer Visionizer
(Work-In-Progress) Let your computer see your screen and interpret it using TFJS models

## Installation
`npm install`

After package installations, perform the following changes:

### Microsoft Custom Vision

Change `\node_modules\@microsoft\customvision-tfjs-node\lib\index.js:97` to `return _this._preprocess(tf.browser.fromPixels(pixels));`

This will process the image by its raw pixels instead of parsing it to an image file. Screenshots return raw pixel array without image encoding.

### Robot JS
http://robotjs.io/docs/electron

### Finally
`npm start`

## Troubleshoot
### TFJS Bindings Errors
`npm install node-pre-gyp -g`

Used for building the TFJS libraries. Maybe due to the wrong Python version, it fails to build from `npm install` command, therefore we use `node-pre-gyp` to manually build it

### Rebuild TFJS
node_modules/@tensorflow/tfjs-node > `node-pre-gyp rebuild`

node_modules/@tensorflow/tfjs-node > https://github.com/tensorflow/tfjs/issues/4171#issuecomment-723415963

root > `npm rebuild @tensorflow/tfjs-node --build-addon-from-source`

## Notes
When using a model, construct the TF object within the propritary package. Can't seem to import TFJS and Custom Vision together.
