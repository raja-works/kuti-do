
/**
 * Animated Flood Fill using BFS (Queue) for concentric expansion.
 * Returns a generator that yields after processing a chunk of pixels.
 * 
 * @param {ImageData} imageData - The canvas image data
 * @param {number} startX - Click X
 * @param {number} startY - Click Y
 * @param {object} fillColor - {r, g, b, a}
 * @param {number} tolerance - Color matching tolerance
 * @param {number} speed - Pixels to process per yield (higher = faster)
 */
export function* floodFill(imageData, startX, startY, fillColor, tolerance = 50, speed = 450) {
    const { width, height, data } = imageData;
    const queue = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    const pixelPos = (startY * width + startX) * 4;
    const startR = data[pixelPos];
    const startG = data[pixelPos + 1];
    const startB = data[pixelPos + 2];
    const startA = data[pixelPos + 3];

    // If match, done
    if (
        Math.abs(startR - fillColor.r) < 10 &&
        Math.abs(startG - fillColor.g) < 10 &&
        Math.abs(startB - fillColor.b) < 10 &&
        Math.abs(startA - fillColor.a) < 10
    ) {
        return;
    }

    const matchesStartColor = (pos) => {
        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];
        const a = data[pos + 3];
        return (
            Math.abs(r - startR) <= tolerance &&
            Math.abs(g - startG) <= tolerance &&
            Math.abs(b - startB) <= tolerance &&
            Math.abs(a - startA) <= tolerance
        );
    };

    visited[startY * width + startX] = 1;
    let processed = 0;

    while (queue.length) {
        const [x, y] = queue.shift(); // Shift = Queue = BFS

        const pos = (y * width + x) * 4;

        // Apply color
        data[pos] = fillColor.r;
        data[pos + 1] = fillColor.g;
        data[pos + 2] = fillColor.b;
        data[pos + 3] = fillColor.a;

        const neighbors = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
        ];

        for (const [nx, ny] of neighbors) {
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

            const nIdx = ny * width + nx;
            if (visited[nIdx]) continue;

            const nPos = nIdx * 4;
            if (matchesStartColor(nPos)) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
            }
        }

        processed++;
        if (processed % speed === 0) {
            yield; // Pause execution to let UI update
        }
    }
}
