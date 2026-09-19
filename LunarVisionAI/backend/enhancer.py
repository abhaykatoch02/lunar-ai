import cv2
import numpy as np


def enhance_lunar_image(image):
    if image is None:
        raise ValueError("Invalid image received.")

    # Convert to grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # Convert to 8-bit
    if gray.dtype != np.uint8:
        gray = cv2.normalize(
            gray, None, 0, 255, cv2.NORM_MINMAX
        ).astype(np.uint8)

    # Contrast stretching
    low = np.percentile(gray, 1)
    high = np.percentile(gray, 99)

    if high > low:
        stretched = (
            (gray.astype(np.float32) - low)
            * 255 / (high - low)
        )
        stretched = np.clip(stretched, 0, 255).astype(np.uint8)
    else:
        stretched = gray

    # Noise reduction
    denoised = cv2.bilateralFilter(
        stretched, 5, 35, 35
    )

    # CLAHE enhancement
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )
    enhanced = clahe.apply(denoised)

    # Mild sharpening
    blurred = cv2.GaussianBlur(
        enhanced, (0, 0), 1.0
    )

    sharpened = cv2.addWeighted(
        enhanced, 1.2,
        blurred, -0.2,
        0
    )

    sharpened = np.clip(
        sharpened, 0, 255
    ).astype(np.uint8)

    # Convert back to BGR
    final_image = cv2.cvtColor(
        sharpened,
        cv2.COLOR_GRAY2BGR
    )

    return final_image