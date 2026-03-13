import mongoose, { Schema, Document } from 'mongoose';

export interface IPalateProfile {
    flavorPreference: string[];
    acidityPreference: string[];
    bodyPreference: string[];
    strengthPreference: string[];
    bitternessTolerance: string[];
    customDescription?: string;
}

export interface IUserProfile extends Document {
    userId: string;
    palateProfile: IPalateProfile;
    createdAt: Date;
    updatedAt: Date;
}

const PalateProfileSchema = new Schema({
    flavorPreference: { type: [String], required: true },
    acidityPreference: { type: [String], required: true },
    bodyPreference: { type: [String], required: true },
    strengthPreference: { type: [String], required: true },
    bitternessTolerance: { type: [String], required: true },
    customDescription: { type: String, required: false, default: '' },
}, { _id: false });

const UserProfileSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true, index: true },
    palateProfile: { type: PalateProfileSchema, required: true },
}, {
    timestamps: true,
});

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
