import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

interface EDDPredictionRequest {
    origin_pincode: string;
    dest_pincode: string;
    weight_grams: number;
    carrier_id: string;
}

interface EDDPredictionResponse {
    predicted_days: number;
    confidence: number;
    features_used: string[];
}

/**
 * Predicts the Estimated Delivery Date length by querying the internal Python ML Service.
 */
export const predictDeliveryDays = async (data: EDDPredictionRequest): Promise<EDDPredictionResponse | null> => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/predict-edd`, data, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000 // ML Service response SLA
        });
        
        return response.data;
    } catch (error: any) {
        console.error('❌ AI EDD Predictor Failed:', error.message);
        return null;
    }
};
