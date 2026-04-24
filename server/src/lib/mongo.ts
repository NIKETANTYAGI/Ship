import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/swiftroute';

/**
 * MongoDB Client (Mongoose)
 * Specialized for high-velocity tracking events and audit logs.
 */
export const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: true
        });
        console.log('🍃 MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

/**
 * Tracking Event Schema
 */
const trackingEventSchema = new mongoose.Schema({
    awb_number: { type: String, required: true, index: true },
    shipment_id: { type: String, required: true, index: true },
    status: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    meta: { type: Map, of: String }
}, {
    timestamps: true,
    collection: 'tracking_events'
});

// TTL index for auto-cleanup after 6 months (optional)
// trackingEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15552000 });

export const TrackingEvent = mongoose.model('TrackingEvent', trackingEventSchema);

export default mongoose;
