
/**
 * processes an image URL to a coloring book styles outline
 * Uses OpenCV.js (window.cv)
 */
export async function processImageToOutline(imageSrc) {
    return new Promise((resolve, reject) => {
        if (!window.cv) {
            console.error("OpenCV not loaded yet");
            reject(new Error("OpenCV not loaded. Please wait a moment and try again."));
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const cv = window.cv;
                // Verify we have a valid image dimensions
                if (img.width === 0 || img.height === 0) {
                    reject(new Error("Image has 0 dimensions"));
                    return;
                }

                // Create Mat from image
                // We create a temporary canvas to draw the image first, to ensure pixel data reference is stable for cv.imread
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const src = cv.imread(tempCanvas);
                const dst = new cv.Mat();

                // 1. Convert to Grayscale
                cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

                // 2. Gaussian Blur to reduce noise and smooth details
                // A larger kernel size (e.g. 5x5 or 7x7) makes it smoother but loses detail
                const kSize = new cv.Size(5, 5);
                cv.GaussianBlur(src, src, kSize, 0, 0, cv.BORDER_DEFAULT);

                // 3. Adaptive Thresholding
                // This is often better than Canny for "sketch" look
                // blockSize: Size of a pixel neighborhood that is used to calculate a threshold value via mean. 
                // C: Constant subtracted from the mean or weighted mean.
                cv.adaptiveThreshold(src, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 15, 10);

                // 4. (Optional) Dilate/Erode to close gaps if needed, but adaptive usually handles this well.
                // If lines are too thin, verify.

                // 5. Output
                cv.imshow(tempCanvas, dst);
                resolve(tempCanvas.toDataURL('image/png'));

                // Cleanup
                src.delete();
                dst.delete();
            } catch (e) {
                console.error("OpenCV error:", e);
                reject(e);
            }
        };
        img.onerror = (e) => reject(new Error("Failed to load image"));
        img.src = imageSrc;
    });
}
