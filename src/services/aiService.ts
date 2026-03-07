import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { BeanInfo, Equipment, Recipe } from '../types';

let _openai: OpenAI | null = null;
const getOpenAI = () => {
    if (!_openai) _openai = new OpenAI();
    return _openai;
};

const BeanInfoSchema = z.object({
    name: z.string().describe("The specific name of the coffee blend or beans (e.g., 'Pink Bloom Coffee', 'Pink Bourbon Coffee', 'Holiday Blend')."),
    brand: z.string().describe("The brand or roaster name (e.g., 'Caramelly', 'Blue Bottle')."),
    roast: z.string(),
    origin: z.string(),
    processing: z.string(),
    altitude: z.string(),
    varietal: z.string(),
    roast_date: z.string(),
    tasting_notes: z.array(z.string()),
});

const RecipeStepSchema = z.object({
    step_number: z.number(),
    name: z.string(),
    instruction: z.string(),
    duration_seconds: z.number().nullable(),
});

const RecipeSchema = z.object({
    method: z.string(),
    dose: z.number(),
    water: z.number(),
    ratio: z.string(),
    grind: z.string(),
    temperature: z.number(),
    steps: z.array(RecipeStepSchema),
});

export const extractBeanInfo = async (description?: string, imageBase64?: string): Promise<BeanInfo> => {

    // Construct the user message content. If there's an image, use the multimodal array format.
    const userContent: any[] | string = imageBase64
        ? [
            { type: "text", text: description ? `Additional user notes: ${description}` : "Please analyze this coffee bag image and extract the details." },
            { type: "image_url", image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
        ]
        : (description || "No description provided");

    // Check if the input is a URL and we don't have an image
    const isUrl = description && !imageBase64 && (description.startsWith('http://') || description.startsWith('https://'));
    const targetModel = isUrl ? "gpt-5-search-api" : "gpt-4o-mini";

    const completion = await getOpenAI().chat.completions.create({
        model: targetModel, // Cost-effective model for extraction, supports vision!
        messages: [
            { role: "system", content: "You are a professional coffee expert. Extract the following information from the user's coffee bag description or image. ONLY extract information that is explicitly stated or clearly visible. DO NOT guess or hallucinate missing parameters; instead, return 'Unknown' or 'N/A'. For 'name', capture the exact specific coffee blend or bean name printed (e.g., 'Pink Bourbon Coffee'). For 'brand', capture the roaster or brand name. For 'origin', capture the specific farm, region, or estate if printed (e.g., compile 'Baarbara, Chikmagalur' if Farm and Region are listed) rather than just saying 'Single Origin'. Ensure strictly correct JSON." },
            { role: "user", content: userContent as any } // Cast to any to satisfy TS for multimodal arrays
        ],
        response_format: zodResponseFormat(BeanInfoSchema, "bean_info"),
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
        throw new Error("Failed to parse bean info");
    }

    const beanInfo = JSON.parse(rawContent);
    return beanInfo as BeanInfo;
};

export const generateRecipe = async (beanInfo: BeanInfo, equipment: Equipment, preferences?: any): Promise<Recipe> => {
    const systemPrompt = `You are a world-class barista. Create a step-by-step custom coffee brewing recipe formatted as JSON.
The user is brewing using a: ${equipment.name}.
The coffee beans are:
- Name/Blend: ${beanInfo.name}
- Brand: ${beanInfo.brand}
- Roast: ${beanInfo.roast}
- Origin: ${beanInfo.origin}
- Processing: ${beanInfo.processing}
- Altitude: ${beanInfo.altitude}
- Varietal: ${beanInfo.varietal}
- Roast Date: ${beanInfo.roast_date}
- Tasting Notes: ${beanInfo.tasting_notes.join(', ')}

Preferences: ${JSON.stringify(preferences || {})}
Please design the optimal brew recipe taking all these parameters into account (e.g., lower temp for darker roast, finer grind for lighter roast).
CRITICAL RULE: The \`dose\` (grams of coffee), \`water\` (ml of water), and \`ratio\` (like "1:15") MUST be mathematically consistent. For example, if the dose is 18g and the ratio is "1:15", the total water MUST be exactly 270ml. Pick a standard starting dose (e.g., 15g-18g for pour-over, 18g for espresso) and calculate the water based on the optimal ratio.
Provide steps including pre-wetting/blooming, pouring, and finishing.`;

    const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o", // High quality reasoning model
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Please generate the recipe JSON." }
        ],
        response_format: zodResponseFormat(RecipeSchema, "recipe"),
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
        throw new Error("Failed to generate recipe");
    }

    const recipe = JSON.parse(rawContent);
    return recipe as Recipe;
};
