import os
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import uvicorn
import logging

# Initialize FastAPI app
app = FastAPI(title="SwiftRoute AI Embedder", version="1.0.0")

# Setup generic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request Models
class EmbedRequest(BaseModel):
    text: str

class EmbedBatchRequest(BaseModel):
    texts: list[str]

class EDDPredictRequest(BaseModel):
    origin_pincode: str
    dest_pincode: str
    weight_grams: int
    carrier_id: str

# Response Models
class EmbedResponse(BaseModel):
    text: str
    vector: list[float]
    dimensions: int

class EmbedBatchResponse(BaseModel):
    vectors: list[list[float]]
    dimensions: int

# Load the ML model (loads on boot)
logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("Model loaded successfully!")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/embed", response_model=EmbedResponse)
def get_embedding(req: EmbedRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        # Generate dense vector
        embeddings = model.encode([req.text])
        vector = embeddings[0].tolist()
        
        return EmbedResponse(
            text=req.text,
            vector=vector,
            dimensions=len(vector)
        )
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-edd")
def predict_edd(req: EDDPredictRequest):
    try:
        # High-Fidelity Logistics Simulation (Simulating a trained LightGBM model)
        # Features used: origin_pincode, dest_pincode, weight, carrier
        
        base_days = 3.5
        features_impact = []

        # 1. Geographic Distance (Tiered by Pincode Regions)
        origin_region = req.origin_pincode[0]
        dest_region = req.dest_pincode[0]
        
        if origin_region == dest_region:
            base_days -= 1.0
            features_impact.append("Intra-region speedup")
        else:
            base_days += 1.5
            features_impact.append("Inter-region transit")

        # 2. Carrier Performance Coefficient
        carrier = req.carrier_id.lower()
        carrier_slas = {
            "delhivery": -0.5,
            "bluedart": -1.0,
            "xpressbees": 0.5,
            "dtdc": 0.0,
            "ecom": 0.2
        }
        
        bonus = carrier_slas.get(carrier, 0)
        base_days += bonus
        if bonus < 0:
            features_impact.append(f"Carrier efficiency ({carrier})")
        elif bonus > 0:
            features_impact.append(f"Carrier delay risk ({carrier})")

        # 3. Volumetric/Weight Impact
        if req.weight_grams > 20000:
            base_days += 2.5
            features_impact.append("Heavy load handling")
        elif req.weight_grams > 5000:
            base_days += 1.0
            features_impact.append("Medium load overhead")

        # 4. Weekend/Cutoff Simulation (Deterministic based on current logic)
        # (In a real model, this would be based on timestamp)
        
        # Predicted Days final calculation
        predicted_days = round(max(1, min(base_days, 12)), 1)
        
        return {
            "predicted_days": int(round(predicted_days)),
            "raw_score": predicted_days,
            "confidence": 0.92 if predicted_days < 5 else 0.81,
            "insights": features_impact,
            "model_version": "v1.2-lightgbm-sim"
        }
    except Exception as e:
        logger.error(f"EDD Prediction error: {e}")
        raise HTTPException(status_code=500, detail="EDD Prediction Core Failure")

@app.post("/embed-batch", response_model=EmbedBatchResponse)
def get_embedding_batch(req: EmbedBatchRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    if not req.texts or any(not text.strip() for text in req.texts):
        raise HTTPException(status_code=400, detail="Texts list cannot be empty and elements cannot be empty strings")

    try:
        # Generate dense vectors for a batch
        embeddings = model.encode(req.texts)
        vectors = embeddings.tolist()

        return EmbedBatchResponse(
            vectors=vectors,
            dimensions=len(vectors[0]) if vectors else 0
        )
    except Exception as e:
        logger.error(f"Batch Embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("embedder:app", host="0.0.0.0", port=7860)
