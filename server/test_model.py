from sentence_transformers import SentenceTransformer
import traceback

print("Attempting to load model...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model loaded successfully!")
except Exception as e:
    print("FAILED TO LOAD MODEL:")
    print(e)
    traceback.print_exc()
