const puppeteer = require('puppeteer-core');
const chromium = require("@sparticuz/chromium");
const zlib = require('zlib'); // For compressing PDF if necessary

let browser = null; // Global browser instance for pooling

async function getBrowser() {
    if (browser) {
        console.log('Reusing existing browser instance');
        return browser;
    }
    console.log('Launching new browser instance');
    browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1200, height: 800 }, // Set explicit viewport
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });
    return browser;
}

async function generatePdfFromHtml(html) {
    console.log('Generating PDF from HTML...');
    let browserInstance;

    try {
        browserInstance = await getBrowser(); // Use the pooled browser instance
        const page = await browserInstance.newPage();

        // Set HTML content and wait for network to be idle
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF with specific options
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Include background colors
            margin: {
                top: '20px',
                bottom: '20px',
                left: '10px',
                right: '10px',
            },
        });

        await page.close(); // Close the page after PDF generation
        return pdfBuffer;
    } catch (error) {
        console.error('Error during PDF generation:', error);
        throw error;
    }
}

exports.handler = async (event) => {
    const html = event.body;

    if (!html) {
        return {
            statusCode: 400,
            body: 'HTML content is required',
        };
    }

    try {
        // Generate the PDF from the HTML input
        const pdfBuffer = await generatePdfFromHtml(html);

        // Compress the PDF buffer
        const compressedPdf = zlib.gzipSync(pdfBuffer);

        // Convert the compressed buffer to a base64 string
        const pdfBase64 = compressedPdf.toString('base64');

        // Return the compressed PDF as a base64 encoded string
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Encoding': 'gzip', // Indicating the response is gzipped
            },
            body: pdfBase64,
            isBase64Encoded: true, // Signals that the body is base64-encoded
        };
    } catch (err) {
        console.error('Error generating PDF:', err);
        return {
            statusCode: 500,
            body: 'Error generating PDF',
        };
    }
};
