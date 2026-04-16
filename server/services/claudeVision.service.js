const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../config/logger.config');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const PROMPT = `You are analyzing an image of a household item for an inventory management app.

Extract as much detail as you can and return ONLY a valid JSON object with these fields:
{
  "name": "item name (required)",
  "brand": "brand name or null",
  "model": "model name/number or null",
  "category": "one of: Electronics, Furniture, Appliances, Clothing, Books, Tools, Sports, Kitchen, Decor, Collectibles, Jewelry, Other",
  "description": "brief description (1-2 sentences) or null",
  "estimatedValue": number in USD or null,
  "condition": "one of: new, like_new, good, fair, poor — your best estimate",
  "notes": "any other useful details (serial numbers visible, color, size, etc.) or null"
}

Be concise. If you cannot identify the item clearly, use your best guess for name and category.
Return ONLY the JSON object, no other text.`;

const analyzeItem = async (imageBase64, mimeType = 'image/jpeg') => {
    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 512,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mimeType,
                                data: imageBase64
                            }
                        },
                        { type: 'text', text: PROMPT }
                    ]
                }
            ]
        });

        const text = response.content[0].text.trim();

        // Strip markdown code blocks if Claude wraps the JSON
        const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(cleaned);

        return parsed;
    } catch (err) {
        logger.error('Claude Vision error', { message: err.message });
        throw new Error('Failed to analyze image: ' + err.message);
    }
};

module.exports = { analyzeItem };
