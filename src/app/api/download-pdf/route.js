// app/api/download-pdf/route.js
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

export async function POST(request) {
  try {
    // Parse JSON body instead of FormData
    const { text: fileText } = await request.json();

    if (!fileText) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    console.log('Received text length:', fileText.length);

    // Convert markdown to HTML
    const htmlContent = marked(fileText);
    
    // Create full HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.6;
              color: #333;
              max-width: 210mm;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2, h3 { 
              color: #2c3e50; 
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p { margin-bottom: 10px; }
            code { 
              background-color: #f4f4f4; 
              padding: 2px 4px; 
              border-radius: 3px;
            }
            pre { 
              background-color: #f4f4f4; 
              padding: 10px; 
              overflow-x: auto;
              border-radius: 5px;
            }
            ul, ol { margin-bottom: 15px; }
            li { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      printBackground: true
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"'
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}