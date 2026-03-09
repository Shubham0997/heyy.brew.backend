import mongoose, { Schema, Document } from 'mongoose';

export interface IGrinder extends Omit<Document, 'model'> {
    id: string; // Internal identifier like "timemore_c2"
    brand: string;
    model: string;
    min_setting: number;
    max_setting: number;
    is_custom?: boolean;
}

const GrinderSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    min_setting: { type: Number, required: true },
    max_setting: { type: Number, required: true },
    is_custom: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IGrinder>('Grinder', GrinderSchema);
