import * as pdfjsLib from 'pdfjs-dist';
// Explicitly import the worker as a URL
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
} catch (e) {
    console.warn("Failed to set PDF worker", e);
}

export async function processPdfToImage(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        // Render first page
        const page = await pdf.getPage(1);

        // Desired scale. 
        // We want a decent resolution. If viewport is small, scale up.
        // Assuming typical letter size, viewport might be around 600x800 at scale 1.
        // Scale 1.5 or 2 gives crisp lines.
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error("Error processing PDF:", error);
        throw error;
    }
}
