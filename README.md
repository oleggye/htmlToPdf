# htmlToPdf
node.js AWS Lambda that coverts html to pdf

Steps to create a right layer:
- mkdir puppeteer-layer
- cd puppeteer-layer
- mkdir nodejs
- cd nodejs
- npm init -y
- npm install puppeteer-core@22.15.0 @sparticuz/chromium
- cd ..
- zip -r puppeteer-layer.zip nodejs

NOTE: the problem is that we should generate dependent libraries in one shot and upload them as the single AWS Lambda layer to prevent any compatability issues (use S3 uload if the size of the achive is more that allowed for the layer direct upload).

use Node.js 18 runtime!
