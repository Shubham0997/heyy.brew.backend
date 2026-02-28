import mongoose, { Schema, Document } from 'mongoose';

export interface IBrewRating extends Document {
    recipeId?: string;
    recipe: any;
    beanInfo: any;
    rating: number;
    timestamp: Date;
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
    brand: { type: String, required: true },
    roast: { type: String, required: true },
    origin: { type: String, required: true },
    processing: { type: String, required: true },
    altitude: { type: String, required: true },
    varietal: { type: String, required: true },
    roast_date: { type: String, required: true },
    tasting_notes: { type: [String], required: true }
}, { _id: false });

const BrewRatingSchema: Schema = new Schema({
    recipeId: { type: String, required: false },
    beanInfo: { type: NestedBeanInfoSchema, required: true },
    recipe: { type: NestedRecipeSchema, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    timestamp: { type: Date, required: true, default: Date.now }
});

export default mongoose.model<IBrewRating>('BrewRating', BrewRatingSchema);
