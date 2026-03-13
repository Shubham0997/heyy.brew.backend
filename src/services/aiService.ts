import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { BeanInfo, Equipment, Recipe } from '../types';

import { GoogleGenerativeAI } from '@google/generative-ai';

let _openai: OpenAI | null = null;
const getOpenAI = () => {
    if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return _openai;
};

let _gemini: GoogleGenerativeAI | null = null;
const getGemini = () => {
    if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    return _gemini;
}

const getAIProvider = () => {
    return (process.env.DEFAULT_AI_PROVIDER || 'openai').toLowerCase();
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
    description: z.string().describe("A brief 1-2 sentence explanation of why this recipe is designed this way — what flavors or characteristics it aims to bring out from these specific beans, and how the brewing parameters achieve that."),
    dose: z.number(),
    water: z.number(),
    ratio: z.string(),
    grind: z.string(),
    grind_level: z.string().describe("A string from: extra_coarse, coarse, medium_coarse, medium, medium_fine, fine, extra_fine"),
    grind_scale: z.number().min(0).max(100).describe("A normalized integer from 0 (finest possible) to 100 (coarsest possible) based on the target micron size for this brew method."),
    temperature: z.number(),
    steps: z.array(RecipeStepSchema),
});

export const extractBeanInfo = async (description?: string, imageBase64?: string): Promise<BeanInfo> => {
    const provider = getAIProvider();
    const systemPrompt = "You are a professional coffee expert. Extract the following information from the user's coffee bag description or image. ONLY extract information that is explicitly stated or clearly visible. DO NOT guess or hallucinate missing parameters; instead, return 'Unknown' or 'N/A'. For 'name', capture the exact specific coffee blend or bean name printed (e.g., 'Pink Bourbon Coffee'). For 'brand', capture the roaster or brand name. For 'origin', capture the specific farm, region, or estate if printed (e.g., compile 'Baarbara, Chikmagalur' if Farm and Region are listed) rather than just saying 'Single Origin'. Ensure strictly correct JSON. Return ONLY A SINGLE JSON OBJECT, NOT AN ARRAY of objects.";

    let rawContent: string | null = null;

    if (provider === 'gemini') {
        const isUrl = description && !imageBase64 && (description.startsWith('http://') || description.startsWith('https://'));
        const targetModel = isUrl ? "gemini-3.1-pro-preview" : "gemini-2.5-flash"; // Use flash for cost-effective standard extraction, 3.1 pro for complex URL/reasoning
        console.log(`[extractBeanInfo] Executing via Gemini API (Model: ${targetModel})...`);

        const genAI = getGemini();
        const { SchemaType } = require('@google/generative-ai'); // Inline to avoid global scope clutter

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-pro-preview", // Use the confirmed working model
            systemInstruction: systemPrompt,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        brand: { type: SchemaType.STRING },
                        roast: { type: SchemaType.STRING },
                        origin: { type: SchemaType.STRING },
                        processing: { type: SchemaType.STRING },
                        altitude: { type: SchemaType.STRING },
                        varietal: { type: SchemaType.STRING },
                        roast_date: { type: SchemaType.STRING },
                        tasting_notes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    },
                    required: ["name", "brand", "roast", "origin", "processing", "altitude", "varietal", "roast_date", "tasting_notes"]
                }
            }
        });

        const promptParts: any[] = [];
        if (imageBase64) {
            const base64Data = imageBase64.startsWith('data:') ? imageBase64.split(',')[1] : imageBase64;
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: imageBase64.startsWith('data:') ? imageBase64.split(';')[0].split(':')[1] : "image/jpeg"
                }
            });
            promptParts.push({ text: description ? `Additional user notes: ${description}` : "Please analyze this coffee bag image and extract the details." });
        } else if (isUrl && description) {
            try {
                console.log(`[extractBeanInfo] Fetching URL content for extraction: ${description}`);
                const response = await fetch(description);
                const textInfo = await response.text();
                promptParts.push({ text: `Please analyze the textual content of this coffee product webpage:\n\n${textInfo}` });
            } catch (e) {
                console.warn(`[extractBeanInfo] Failed to fetch URL natively. Sending URL to model anyway.`);
                promptParts.push({ text: description });
            }
        } else {
            promptParts.push({ text: description || "No description provided" });
        }

        const result = await model.generateContent(promptParts);
        rawContent = result.response.text();

    } else {
        // OpenAI Fallback
        const userContent: any[] | string = imageBase64
            ? [
                { type: "text", text: description ? `Additional user notes: ${description}` : "Please analyze this coffee bag image and extract the details." },
                { type: "image_url", image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
            ]
            : (description || "No description provided");

        const isUrl = description && !imageBase64 && (description.startsWith('http://') || description.startsWith('https://'));
        const targetModel = isUrl ? "gpt-5-search-api" : "gpt-4o-mini";
        console.log(`[extractBeanInfo] Executing via OpenAI API (Model: ${targetModel})...`);

        const completion = await getOpenAI().chat.completions.create({
            model: targetModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent as any }
            ],
            response_format: zodResponseFormat(BeanInfoSchema, "bean_info"),
        });

        rawContent = completion.choices[0]?.message?.content || null;
    }

    if (!rawContent) throw new Error("Failed to parse bean info");

    console.log("\n=== AI RESPONSE PAYLOAD ===");
    console.log(rawContent);
    console.log("===========================\n");

    // Clean markdown formatting if Gemini wrapped it in ```json
    const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedContent) as BeanInfo;
};

export const generateRecipe = async (beanInfo: BeanInfo, equipment: Equipment, preferences?: any): Promise<Recipe> => {
    const { grinder, palateProfile, drinkType: rawDrinkType, userId, ...safePreferences } = preferences || {};
    const drinkType = rawDrinkType || 'black';
    const grinderText = grinder ? `\n- Grinder: ${grinder.brand} ${grinder.model}` : '';
    const provider = getAIProvider();

    // Build palate profile prompt section
    let palateText = '';
    if (palateProfile) {
        const lines: string[] = [];
        if (palateProfile.flavorPreference?.length) lines.push(`- Flavor preferences: ${palateProfile.flavorPreference.join(', ')}`);
        if (palateProfile.acidityPreference?.length) lines.push(`- Acidity preference: ${palateProfile.acidityPreference.join(', ')}`);
        if (palateProfile.bodyPreference?.length) lines.push(`- Body/texture preference: ${palateProfile.bodyPreference.join(', ')}`);
        if (palateProfile.strengthPreference?.length) lines.push(`- Strength preference: ${palateProfile.strengthPreference.join(', ')}`);
        if (palateProfile.bitternessTolerance?.length) lines.push(`- Bitterness tolerance: ${palateProfile.bitternessTolerance.join(', ')}`);
        if (palateProfile.customDescription) lines.push(`- Additional notes from user: "${palateProfile.customDescription}"`);
        if (lines.length > 0) {
            palateText = `\n\n## User's Taste Profile\nThe user has described their coffee taste preferences. Use this to fine-tune the recipe — adjust brew ratio, water temperature, extraction time, and agitation to match their palate:\n${lines.join('\n')}`;
        }
    }

    // Build drink type prompt section
    let drinkTypeText = '';
    if (drinkType && drinkType !== 'black') {
        const drinkInstructions: Record<string, string> = {
            espresso: `The user wants a straight ESPRESSO shot.
- Design for a concentrated extraction: typical dose 18-20g, yield 36-40g liquid, extraction time 25-30 seconds.
- The \`water\` field should reflect the total liquid yield (espresso output), NOT the water input.
- The \`ratio\` should be an espresso ratio like "1:2" or "1:2.2".
- Steps should cover: grinding, tamping/distribution, pulling the shot, and serving.`,
            americano: `The user wants an AMERICANO (espresso + hot water).
- First design the espresso extraction (dose 18-20g, yield ~36-40g, 25-30s).
- Then add a step for diluting with hot water (typically 120-180ml of hot water added to the espresso).
- The \`water\` field should reflect the TOTAL liquid in the final drink (espresso yield + added hot water).
- Steps should cover: grinding, pulling the shot, heating water, and combining.`,
            latte: `The user wants a LATTE (espresso + steamed milk).
- First design the espresso extraction (dose 18-20g, yield ~36-40g, 25-30s).
- Then add steps for steaming milk (typically 180-240ml whole milk, steamed to 60-65°C with a thin layer of microfoam).
- The \`water\` field should reflect the TOTAL liquid volume (espresso yield + milk).
- Steps should cover: grinding, pulling the shot, steaming milk, and pouring with a thin layer of foam on top.`,
            cappuccino: `The user wants a CAPPUCCINO (espresso + equal parts steamed milk and foam).
- First design the espresso extraction (dose 18-20g, yield ~36-40g, 25-30s).
- Then add steps for steaming milk with thick foam (typically 120-150ml milk, steamed to 55-65°C with thick, velvety foam).
- A traditional cappuccino is roughly equal thirds: espresso, steamed milk, and milk foam.
- The \`water\` field should reflect the TOTAL liquid volume (espresso yield + milk).
- Steps should cover: grinding, pulling the shot, steaming/frothing milk, and pouring with thick foam.`,
            vietnamese: `The user wants VIETNAMESE COFFEE (strong coffee + sweetened condensed milk).
- Use a strong brew method appropriate to the equipment.
- For ESPRESSO MACHINE: Pull a double lungo shot (yield ~60-80ml liquid).
- For MOKA POT or OTHER brewers: Brew a concentrated base (yield ~100-150ml liquid).
- Dose can be higher (18-22g) for extra strength.
- Add a step for adding 2-3 tablespoons of sweetened condensed milk to the cup BEFORE the coffee is added.
- Include the option to serve over ice (iced Vietnamese coffee / Cà Phê Sữa Đá) in the steps.
- The \`water\` field should reflect just the coffee liquid (not the condensed milk). For espresso machines, this should be the lungo yield (~60-80ml).
- Steps should cover: preparing condensed milk in cup, brewing the coffee, combining, and optionally serving over ice.`,
        };
        if (drinkInstructions[drinkType]) {
            drinkTypeText = `\n\n## Drink Type: ${drinkType.charAt(0).toUpperCase() + drinkType.slice(1)}
${drinkInstructions[drinkType]}`;
        }
    }

    // AI-driven taste analysis (historical inferences) removed per request.

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
- Tasting Notes: ${beanInfo.tasting_notes.join(', ')}${grinderText}

Preferences: ${JSON.stringify(safePreferences)}${palateText}${drinkTypeText}

## Brew Method Micron Targets & Grind Scale
To establish a normalization baseline, use the following target micron ranges to determine the ideal grind:
- Turkish Coffee (40-220 μm) -> Grind Scale: 0 - 5
- Espresso (180-380 μm) -> Grind Scale: 5 - 25
- AeroPress (320-960 μm) -> Grind Scale: 20 - 70
- Moka Pot (360-660 μm) -> Grind Scale: 25 - 50
- V60 / Pour Over (400-930 μm) -> Grind Scale: 30 - 70 (Finer for V60, coarser for flat-bottom/Chemex)
- French Press (690-1300 μm) -> Grind Scale: 60 - 90
- Cold Brew (800-1400 μm) -> Grind Scale: 85 - 100

Please design the optimal brew recipe taking all these parameters into account (e.g., lower temp for darker roast, finer grind for lighter roast). 
Calculate a \`grind_scale\` (0-100) based on the micron targets above for the chosen brew method, and select the appropriate \`grind_level\` string (e.g., "medium_fine").
CRITICAL RULES:
1. The \`dose\` (grams of coffee), \`water\` (ml of water), and \`ratio\` (like "1:15") MUST be mathematically consistent. For example, if the dose is 18g and the ratio is "1:15", the total water MUST be exactly 270ml. Pick a standard starting dose (e.g., 15g-18g for pour-over, 18g for espresso) and calculate the water based on the optimal ratio.
2. When telling the user to grind the coffee in the step instructions, if they are using a specific Grinder, you MUST explicitly tell them to use "setting [GRINDER_SETTING]" EXACTLY like that using the bracketed placeholder. Do NOT guess a number yourself. The backend will mathematically replace this placeholder with the exact physical dial setting based on your \`grind_scale\`.
Provide steps including pre-wetting/blooming, pouring, and finishing.
Also generate a \`description\` field: a brief 1-2 sentence explanation of why this recipe is designed this way — what flavors it aims to extract from these beans and how the chosen parameters (temperature, grind, ratio) achieve that.`;

    console.log(`=== FINAL AI PROMPT (${provider.toUpperCase()}) ===`);
    console.log(systemPrompt);
    console.log("=======================");

    let rawContent: string | null = null;

    if (provider === 'gemini') {
        console.log(`[generateRecipe] Executing via Gemini API (Model: gemini-3.1-pro-preview)...`);
        const genAI = getGemini();
        const { SchemaType } = require('@google/generative-ai');

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-pro-preview", // Use the confirmed working model
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        method: { type: SchemaType.STRING },
                        description: { type: SchemaType.STRING, description: "A brief 1-2 sentence explanation of why this recipe is designed this way — what flavors or characteristics it aims to bring out, and how the brewing parameters achieve that." },
                        dose: { type: SchemaType.NUMBER },
                        water: { type: SchemaType.NUMBER },
                        ratio: { type: SchemaType.STRING },
                        grind: { type: SchemaType.STRING },
                        grind_level: { type: SchemaType.STRING, description: "A string from: extra_coarse, coarse, medium_coarse, medium, medium_fine, fine, extra_fine" },
                        grind_scale: { type: SchemaType.NUMBER, description: "A normalized integer from 0 (finest possible) to 100 (coarsest possible) based on the target micron size for this brew method." },
                        temperature: { type: SchemaType.NUMBER },
                        steps: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    step_number: { type: SchemaType.NUMBER },
                                    name: { type: SchemaType.STRING },
                                    instruction: { type: SchemaType.STRING },
                                    duration_seconds: { type: SchemaType.NUMBER, nullable: true }
                                },
                                required: ["step_number", "name", "instruction"]
                            }
                        }
                    },
                    required: ["method", "description", "dose", "water", "ratio", "grind", "grind_level", "grind_scale", "temperature", "steps"]
                }
            }
        });

        const result = await model.generateContent(systemPrompt);
        rawContent = result.response.text();
    } else {
        console.log(`[generateRecipe] Executing via OpenAI API (Model: gpt-4o)...`);
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o", // High quality reasoning model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Please generate the recipe JSON." }
            ],
            response_format: zodResponseFormat(RecipeSchema, "recipe"),
        });
        rawContent = completion.choices[0]?.message?.content || null;
    }

    if (!rawContent) throw new Error("Failed to generate recipe");

    console.log("\n=== AI RESPONSE PAYLOAD ===");
    console.log(rawContent);
    console.log("===========================\n");

    const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const recipe = JSON.parse(cleanedContent);

    // Post-process to inject accurate physical grinder setting
    if (grinder && recipe.grind_scale !== undefined) {
        const { min_setting, max_setting } = grinder;
        const scale = recipe.grind_scale;
        const exactSetting = Math.round(min_setting + (scale / 100) * (max_setting - min_setting));

        recipe.steps = recipe.steps.map((step: any) => ({
            ...step,
            instruction: typeof step.instruction === 'string'
                ? step.instruction.replace(/\[GRINDER_SETTING\]/g, exactSetting.toString())
                : step.instruction
        }));
    }

    return recipe as Recipe;
};

export const generateSpeech = async (text: string): Promise<Response> => {
    const response = await getOpenAI().audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
    });

    // We return the raw Response to stream it back to the client
    return response as unknown as Response;
};
