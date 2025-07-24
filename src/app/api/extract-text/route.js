import { NextResponse } from 'next/server';
import { PDFDocument, ReparseError } from 'pdf-lib';
import pdf from 'pdf-parse';
import TurndownService from 'turndown';

async function repairPDF(buffer) {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newPDF = await pdfDoc.save();
  return Buffer.from(newPDF);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const repairedBuffer = await repairPDF(buffer)

    const data = await pdf(repairedBuffer);
    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
    const markdown = turndown.turndown(data.text.replace(/\n/g, '<br>'));
    return NextResponse.json({ text: markdown });

  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
}
