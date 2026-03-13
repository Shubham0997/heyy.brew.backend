import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedRecipe extends Document {
    userId: string; // Firebase UID
    beanInfo: any;
    recipe: any;
    rating?: number;
    tastedNotes?: string[];
    createdAt: Date;
}

const RecipeStepSchema = new Schema({
    step_number: { type: Number, required: true },
    name: { type: String, required: true },
    instruction: { type: String, required: true },
    duration_seconds: { type: Number, required: false }
}, { _id: false });

const NestedRecipeSchema = new Schema({
    method: { type: String, required: true },
    dose: { type: Number, required: true },
    water: { type: Number, required: true },
    ratio: { type: String, required: true },
    grind: { type: String, required: true },
    temperature: { type: Number, required: true },
    steps: { type: [RecipeStepSchema], required: false }
}, { _id: false });

const NestedBeanInfoSchema = new Schema({
    name: { type: String, required: true, default: 'Unknown' },
    brand: { type: String, required: true },
    roast: { type: String, required: true },
    origin: { type: String, required: true },
    processing: { type: String, required: true },
    altitude: { type: String, required: false },
    varietal: { type: String, required: false },
    roast_date: { type: String, required: false },
    tasting_notes: { type: [String], required: true }
}, { _id: false });

const SavedRecipeSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    beanInfo: { type: NestedBeanInfoSchema, required: true },
    recipe: { type: NestedRecipeSchema, required: true },
    rating: { type: Number, required: false },
    tastedNotes: { type: [String], required: false, default: [] },
    createdAt: { type: Date, required: true, default: Date.now }
});

// Trigger taste analysis when a recipe is saved with a rating
SavedRecipeSchema.post('save', function(doc) {
    if (doc?.rating && doc?.userId) {
        const { triggerAnalysisIfReady } = require('../services/tasteAnalysisService');
        triggerAnalysisIfReady(doc.userId).catch(() => {}); // fire-and-forget
    }
});

// Trigger taste analysis when a rating is updated via findOneAndUpdate
SavedRecipeSchema.post('findOneAndUpdate', async function(doc) {
    if (doc?.rating && doc?.userId) {
        const { triggerAnalysisIfReady } = require('../services/tasteAnalysisService');
        triggerAnalysisIfReady(doc.userId).catch(() => {}); // fire-and-forget
    }
});

export default mongoose.model<ISavedRecipe>('SavedRecipe', SavedRecipeSchema);
