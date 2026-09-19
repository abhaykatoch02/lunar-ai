from fastapi import FastAPI, UploadFile, File, HTTPException 
from fastapi.middleware.cors import CORSMiddleware 
import cv2 
import numpy as np 
import base64 
 
from enhancer import enhance_lunar_image 
from metrics import calculate_metrics 
from astro_processor import AstronomicalProcessor 
 
app = FastAPI(title="LunaVision AI Backend") 
 
# Frontend ko backend access karne dena 
app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"], 
) 
 
 
@app.get("/") 
def home(): 
    return {"message": "LunaVision AI backend is running"} 
 
 
@app.get("/health") 
def health_check(): 
    return {"status": "healthy"} 
 
 
@app.post("/enhance") 
async def enhance_image(file: UploadFile = File(...)): 
 
    # Sirf JPG/PNG allow 
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]: 
        raise HTTPException( 
            status_code=400, 
            detail="Please upload a JPG or PNG image." 
        ) 
 
    image_bytes = await file.read() 
 
    # 10 MB limit 
    if len(image_bytes) > 10 * 1024 * 1024: 
        raise HTTPException( 
            status_code=400, 
            detail="Image must be smaller than 10 MB." 
        ) 
 
    # Image read 
    image_array = np.frombuffer(image_bytes, np.uint8) 
    original_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR) 
 
    if original_image is None: 
        raise HTTPException( 
            status_code=400, 
            detail="Invalid or corrupted image." 
        ) 
 
    # AI/image enhancement 
    enhanced_image = enhance_lunar_image(original_image) 
 
    # Metrics 
    metrics = calculate_metrics(original_image, enhanced_image) 
 
    # Enhanced image → Base64 
    success, encoded_image = cv2.imencode(".jpg", enhanced_image) 
 
    if not success: 
        raise HTTPException( 
            status_code=500, 
            detail="Could not encode image." 
        ) 
 
    enhanced_base64 = base64.b64encode( 
        encoded_image.tobytes() 
    ).decode("utf-8") 

    # Astronomical processing (Cosmic Ray Scrubbing & Photometric Albedo Mapping)
    astro_data = AstronomicalProcessor.process(enhanced_image)
    success_astro, encoded_astro = cv2.imencode(".jpg", astro_data["albedo_map"])
    albedo_base64 = ""
    if success_astro:
        albedo_base64 = base64.b64encode(encoded_astro.tobytes()).decode("utf-8")

    return { 
        "message": "Image enhanced successfully", 
        "enhanced_image": f"data:image/jpeg;base64,{enhanced_base64}", 
        "albedo_image": f"data:image/jpeg;base64,{albedo_base64}",
        "metrics": metrics,
        "astro_data": {
            "cosmic_hits_scrubbed": astro_data["cosmic_hits"],
            "mean_albedo": astro_data["mean_albedo"],
            "volatile_anomaly": astro_data["volatile_anomaly"]
        }
    }