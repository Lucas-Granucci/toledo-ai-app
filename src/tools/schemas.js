export const toolsSchema = [
        {
            type: "function",
            function: {
                name: "translate_text",
                description: "Translate the given text or the most recently uploaded document.",
                parameters: {
                    type: "object",
                    properties: {
                        text: {
                            type: "string",
                            description: "The text to translate. If omitted, the most recent uploaded document will be used."
                        },
                        target_lang: {
                            type: "string",
                            description: "The target language code, e.g. 'hi', 'fa' or 'he'"
                        }
                    },
                    required: ["target_lang"]
                }
            }
        }
    ]