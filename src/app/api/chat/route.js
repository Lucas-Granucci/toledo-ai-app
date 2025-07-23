import { NextResponse } from "next/server";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { toolsSchema } from '../../../tools/schemas.js';

function trimMessageHistory(messages, maxMessages = 10) {
    if (messages.length <= maxMessages) return messages;

    // keep first message (system message)
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const recentMessages = nonSystemMessages.slice(-maxMessages);
    return [...systemMessages, ...recentMessages];
}

class DocumentContextManager {
    constructor() {
        this.currentDocument = null;
        this.documentSummary = null;
    }

    setDocument(text) {
        this.currentDocument = text;
        this.documentSummary = null;
    }

    async createDocumentSummary(text, groq, userApiKey) {
        if (this.documentSummary) return this.documentSummary;

        try {
            const completion = await groq.chat.completions.create({
                model: "qwen/qwen3-32b",
                messages: [{
                    role: 'user',
                    content: `Create a concise summary of this document for context. Include key topics, main findings, \
                    and important details that might be referenced later:\n\n${text.substring(0, 2000)}...`
                }]
            });

            this.documentSummary = completion.choices[0].message.content;
            return this.documentSummary;
        } catch (error) {
            console.error("Summary creation failed:", error);
            return "Document uploaded but summary unavailable";
        }
    }

    getCurrentDocument() {
        return this.currentDocument;
    }

    getDocumentSummary() {
        return this.documentSummary;
    }
}

// Global document manager
const documentManager = new DocumentContextManager();

function findLatestUploadedDocument(messages) {
    const latestFileMessage = [...messages].reverse().find(
        m => m.role === 'user' && m.file?.text
    );
    return latestFileMessage?.file?.text || null;
}

// Smart message preparation
function prepareMessagesForLLM(messages, documentSummary = null, includeFullDocument = false) {
    const processedMessages =  messages.map(m => {
        if (m.role === 'user') {
            const baseContent = m.content?.trim() || '';

            if (m.file?.text) {
                return {
                    role: 'user',
                    content: `${baseContent}\n[Document uploaded: Available for analysis]`
                }
            }

            return { role: 'user', content: baseContent };
        }

        return {
            role: m.role,
            content: m.content
        };
    });

    // Add document context only when needed
    if (includeFullDocument && documentManager.getCurrentDocument()) {
        processedMessages.unshift({
            role: 'system',
            content: `Full-document content:\n${documentManager.getCurrentDocument()}`
        })
    } else if (documentSummary) {
        processedMessages.unshift({
            role: 'system',
            content: `Context: User has uploaded a document. Summary: ${documentSummary}`
        })
    }
    return processedMessages;
}

// Inteligent document usage
function shouldIncludeFullDocument(userMessage) {
    const translationKeywords = ['translate', 'translation', 'convert to'];
    const analysisKeywords = ['analyze', 'summarize', 'extract', 'find', 'search'];

    const message = userMessage.toLowerCase();
    return translationKeywords.some(keyword => message.includes(keyword)) || analysisKeywords.some(keyword => message.includes(keyword))
}

async function translateText(text, targetLang, userApiKey) {
    const groq = new Groq({ apiKey: userApiKey });

    const prompt = `
You are a professional scientific translator. Your task is to translate the following academic or scientific text into ${targetLang}.

Guidelines:
- Use precise and domain-specific terminology.
- Maintain a formal, academic tone.
- Preserve original paragraph structure, logical flow, and sentence complexity.
- If the source has strange spacing, fix it: ensure the output has clearly separated paragraphs.
- Do NOT interpret or summarize—only translate.
- If any term lacks a known equivalent, transliterate and include a brief note in parentheses.

Translate only. Do not include commentary.

--- START OF SOURCE TEXT ---
${text}
--- END OF SOURCE TEXT ---
`;


    try {
        const completion = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: [{ role: 'user', content: prompt }],
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("GroqCloud Error: ", error);
        return "GroqCloud API Error";
    }
}

export async function POST(req) {
    const { messages, userApiKey } = await req.json();

    if (!userApiKey) {
        return NextResponse.json({ error: "Missing API key"}, { status: 400 })
    }

    const openai = new OpenAI({ apiKey: userApiKey });
    const groq = new Groq({ apiKey: userApiKey });

    // For Groq Cloud
    try {

        const latestFileText = findLatestUploadedDocument(messages);
        if (latestFileText && latestFileText !== documentManager.getCurrentDocument()) {
            documentManager.setDocument(latestFileText);
            await documentManager.createDocumentSummary(latestFileText, groq, userApiKey);   
        }

        const trimmedMessages = trimMessageHistory(messages, 10);

        const currentUserMessage = messages[messages.length - 1]?.content || '';
        const needsFullDocument = shouldIncludeFullDocument(currentUserMessage);

        const systemPrompt = {
            role: "system",
            content: `You are a multilingual scientific assistant. ${documentManager.getCurrentDocument() ? 
                'The user has uploaded a document that is available for analysis and translation.' : 
                'No document is currently available.'} Use the 'translate_text' tool when translation is requested.`
        };

        const finalMessages = [
            systemPrompt,
            ...prepareMessagesForLLM(
                trimmedMessages, 
                documentManager.getDocumentSummary(),
                needsFullDocument
            )
        ]

        const completion = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: finalMessages,
            tools: toolsSchema,
            tool_choice: 'auto'
        });
        const responseMessage = completion.choices[0].message;

        // === TOOL HANDLING ===
        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const { name, arguments: args } = toolCall.function;

            const parsedArgs = JSON.parse(args);
            let textToTranslate = parsedArgs.text || documentManager.getCurrentDocument();
            let targetLang = parsedArgs.target_lang;

            if (!textToTranslate) {
                return NextResponse.json({ error: "No file found to translate" }, { status: 400 });
            }

            const translatedText = await translateText(textToTranslate, targetLang, userApiKey);

            const assistantReply = { 
                role: 'assistant', 
                content: "Translation completed! The translated document is ready for download.", 
                file: {
                    text: translatedText,
                    name: `translated_${targetLang}.txt`,
                    type: "text/plain"
                }
            };

            return NextResponse.json( {response: assistantReply.content, file: assistantReply.file} );
        }
        return NextResponse.json( {response: completion.choices[0].message.content} );

    } catch (error) {
        console.error("GroqCloud Error: ", error);
        return NextResponse.json({error: "GroqCloud API Error" }, {status: 500});
    }

    // For OpenAI
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages
        });

        return NextResponse.json( {response: completion.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI Error: ", error);
        return NextResponse.json({error: "OpenAI API Error" }, {status: 500});
    }
}