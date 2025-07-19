import { NextResponse } from "next/server";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { toolsSchema } from '../../../tools/schemas.js';

function prepareMessagesForLLM(messages) {
  return messages.map(m => {
    if (m.role === 'user' && m.file?.targetLang) {
      return {
        role: m.role,
        content: `${m.content?.trim() || ''}

The user uploaded a document and requested translation. If the target language hasn't been specified,
translate into "${m.file.targetLang}".
Use the 'translate_text' tool if appropiate.`,
      };
    } else {
      return {
        role: m.role,
        content: m.content,
      }
    }
  })
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
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
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

        const systemPrompt = {
            role: "system",
            content: "You are a multilingual scientific assistant. If the user has uploaded a document \
and mentions translation, use the 'translate_text' tool. If no text is given, assume the most recent uploaded file is available.",
        };

        const finalMessages = [systemPrompt, ...prepareMessagesForLLM(messages)];

        const completion = await groq.chat.completions.create({
            model: "qwen/qwen3-32b",
            messages: finalMessages,
            tools: toolsSchema,
            tool_choice: 'auto'
        });
        const responseMessage = completion.choices[0].message;

        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const { name, arguments: args } = toolCall.function;

            const parsedArgs = JSON.parse(args);

            let textToTranslate = parsedArgs.text;
            let targetLang = parsedArgs.target_lang;

            if (!textToTranslate) {
                const latestFileMessage = [...messages].reverse().find(
                    m => m.role === 'user' && m.file?.text
                );

                if (!latestFileMessage) {
                    throw new Error("No file found to translate");
                }

                textToTranslate = latestFileMessage.file.text;
            }

            const translatedText = await translateText(textToTranslate, targetLang, userApiKey);

            messages.push(responseMessage);
            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: translatedText,
                file: null
            });

            const assistantReply = { role: 'assistant', content: `Translation:\n${translatedText}`, file: null};
            messages.push(assistantReply);

            return NextResponse.json( {response: assistantReply.content } );
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