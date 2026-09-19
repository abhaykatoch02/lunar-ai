import cv2
import numpy as np


def calculate_metrics(original, enhanced):
    """
    Original aur enhanced image ke quality metrics calculate karta hai.
    """

    # -----------------------------
    # 1. Convert original to grayscale
    # -----------------------------
    if len(original.shape) == 3:
        original_gray = cv2.cvtColor(
            original,
            cv2.COLOR_BGR2GRAY
        )
    else:
        original_gray = original.copy()

    # -----------------------------
    # 2. Convert enhanced to grayscale
    # -----------------------------
    if len(enhanced.shape) == 3:
        enhanced_gray = cv2.cvtColor(
            enhanced,
            cv2.COLOR_BGR2GRAY
        )
    else:
        enhanced_gray = enhanced.copy()

    # -----------------------------
    # 3. Brightness
    # -----------------------------
    original_brightness = float(
        np.mean(original_gray)
    )

    enhanced_brightness = float(
        np.mean(enhanced_gray)
    )

    # -----------------------------
    # 4. Contrast
    # -----------------------------
    original_contrast = float(
        np.std(original_gray)
    )

    enhanced_contrast = float(
        np.std(enhanced_gray)
    )

    # -----------------------------
    # 5. Sharpness
    # Laplacian variance
    # -----------------------------
    original_sharpness = float(
        cv2.Laplacian(
            original_gray,
            cv2.CV_64F
        ).var()
    )

    enhanced_sharpness = float(
        cv2.Laplacian(
            enhanced_gray,
            cv2.CV_64F
        ).var()
    )

    # -----------------------------
    # 6. Entropy
    # -----------------------------
    def calculate_entropy(image):

        histogram = cv2.calcHist(
            [image],
            [0],
            None,
            [256],
            [0, 256]
        )

        histogram = histogram.flatten()

        # Probability distribution
        histogram = histogram / (
            histogram.sum() + 1e-10
        )

        # Remove zero probabilities
        histogram = histogram[
            histogram > 0
        ]

        entropy = -np.sum(
            histogram * np.log2(histogram)
        )

        return float(entropy)

    original_entropy = calculate_entropy(
        original_gray
    )

    enhanced_entropy = calculate_entropy(
        enhanced_gray
    )

    # -----------------------------
    # 7. Resolution
    # -----------------------------
    height, width = original_gray.shape[:2]

    # -----------------------------
    # 8. Return all metrics
    # -----------------------------
    return {

        "resolution": f"{width} x {height}",

        "original_brightness": round(
            original_brightness, 2
        ),

        "enhanced_brightness": round(
            enhanced_brightness, 2
        ),

        "brightness_improvement": round(
            enhanced_brightness -
            original_brightness,
            2
        ),

        "original_contrast": round(
            original_contrast, 2
        ),

        "enhanced_contrast": round(
            enhanced_contrast, 2
        ),

        "contrast_improvement": round(
            enhanced_contrast -
            original_contrast,
            2
        ),

        "original_sharpness": round(
            original_sharpness, 2
        ),

        "enhanced_sharpness": round(
            enhanced_sharpness, 2
        ),

        "sharpness_improvement": round(
            enhanced_sharpness -
            original_sharpness,
            2
        ),

        "original_entropy": round(
            original_entropy, 2
        ),

        "enhanced_entropy": round(
            enhanced_entropy, 2
        ),

        "entropy_improvement": round(
            enhanced_entropy -
            original_entropy,
            2
        )
    }