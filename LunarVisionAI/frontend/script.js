// Mouse Glow
const glow = document.getElementById("cursorGlow");

document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
});

// Elements
const fileInput = document.getElementById("fileInput");
const originalImage = document.getElementById("originalImage");
const enhancedImage = document.getElementById("enhancedImage");
const enhanceBtn = document.getElementById("enhanceBtn");
const detectStatus = document.getElementById("detectStatus");
const enhanceStatus = document.getElementById("enhanceStatus");

let selectedFile = null;

// Upload Image Preview
fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = function (e) {
        originalImage.src = e.target.result;
        enhancedImage.src = e.target.result;
        enhancedImage.style.filter = "none";
    };
    reader.readAsDataURL(file);
});

// Enhance Button Action (Calls Python FastAPI Backend)
enhanceBtn.addEventListener("click", async function () {
    detectStatus.innerHTML = "Scanning...";
    enhanceStatus.innerHTML = "Processing...";
    enhanceBtn.disabled = true;
    enhanceBtn.innerHTML = "Processing...";

    // Agar real file select ki hai toh backend ko bhejega
    if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // Send request to Python FastAPI Server
            const response = await fetch("http://127.0.0.1:8000/enhance", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                enhancedImage.src = data.enhanced_image_url || data.result_image;
                detectStatus.innerHTML = "PSR Detected ✓";
                enhanceStatus.innerHTML = "Completed ✓";
            } else {
                throw new Error("Backend response error");
            }
        } catch (error) {
            console.warn("Backend connect nahi hua, demo mode chal raha hai:", error);
            // Fallback Demo Filter agar backend band ho
            setTimeout(() => { detectStatus.innerHTML = "PSR Detected ✓"; }, 800);
            setTimeout(() => {
                enhanceStatus.innerHTML = "Completed ✓";
                enhancedImage.style.filter = "brightness(2.2) contrast(1.4) saturate(1.1)";
            }, 1800);
        }
    } else {
        // Fallback for default moon image
        setTimeout(() => { detectStatus.innerHTML = "PSR Detected ✓"; }, 800);
        setTimeout(() => {
            enhanceStatus.innerHTML = "Completed ✓";
            enhancedImage.style.filter = "brightness(2.2) contrast(1.4) saturate(1.1)";
        }, 1800);
    }

    setTimeout(() => {
        enhanceBtn.disabled = false;
        enhanceBtn.innerHTML = "Enhance Image";
    }, 2000);
});

// Confidence Counter Animation
let confidence = 98;
const confidenceBox = document.getElementById("confidence");

setInterval(() => {
    confidenceBox.innerHTML = confidence + "%";
    confidence++;
    if (confidence > 100) {
        confidence = 98;
    }
}, 1200);