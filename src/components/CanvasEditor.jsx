import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { floodFill } from '../utils/floodFill';
import brushSoundFile from '../assets/pincel-en-lienzo-100953.mp3';
import bucketSoundFile from '../assets/normal-paint-strokes_1-2-91567.mp3';

// Placeholder sound for now
const CanvasEditor = forwardRef(({
    imageSrc,
    width = 800,
    height = 600,
    activeTool,
    activeColor,
    brushSize = 10
}, ref) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isFilling, setIsFilling] = useState(false);
    const contextRef = useRef(null);
    const brushAudioRef = useRef(null);
    const bucketAudioRef = useRef(null);

    useEffect(() => {
        // Initialize brush audio (looping)
        const brushAudio = new Audio(brushSoundFile);
        brushAudio.loop = true;
        brushAudioRef.current = brushAudio;

        // Initialize bucket audio (looping for duration of fill)
        const bucketAudio = new Audio(bucketSoundFile);
        bucketAudio.loop = true;
        bucketAudioRef.current = bucketAudio;

        return () => {
            brushAudio.pause();
            brushAudio.currentTime = 0;
            bucketAudio.pause();
            bucketAudio.currentTime = 0;
        }
    }, []);

    const startBrushSound = () => {
        if (activeTool === 'brush' && brushAudioRef.current) {
            brushAudioRef.current.currentTime = 0;
            brushAudioRef.current.play().catch(e => console.log("Audio play failed", e));
        }
    };

    const stopBrushSound = () => {
        if (brushAudioRef.current) {
            brushAudioRef.current.pause();
            brushAudioRef.current.currentTime = 0;
        }
    };

    const startBucketSound = () => {
        if (bucketAudioRef.current) {
            bucketAudioRef.current.currentTime = 0;
            bucketAudioRef.current.play().catch(e => console.log("Bucket audio failed", e));
        }
    };

    const stopBucketSound = () => {
        if (bucketAudioRef.current) {
            bucketAudioRef.current.pause();
            bucketAudioRef.current.currentTime = 0;
        }
    };

    useImperativeHandle(ref, () => ({
        saveImage: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const link = document.createElement('a');
                link.download = `my-coloring-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }));

    // Helper to convert hex to RGBA
    const hexToRgba = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return { r, g, b, a: 255 };
    };

    // Re-init canvas context properties
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = activeColor;
            contextRef.current.lineWidth = brushSize;
        }
    }, [activeColor, brushSize]);

    // Init Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = brushSize;
        contextRef.current = ctx;

        if (imageSrc) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageSrc;
            img.onload = () => {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                const scale = Math.min(width / img.width, height / img.height);
                const x = (width / 2) - (img.width / 2) * scale;
                const y = (height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            };
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
        }
    }, [imageSrc, width, height]);

    const getScaledCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        // Use clientX/Y from the native event (works for PointerEvent)
        const clientX = e.nativeEvent.clientX;
        const clientY = e.nativeEvent.clientY;

        // Calculate position relative to canvas
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Scale based on actual displayed size vs internal resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: x * scaleX,
            y: y * scaleY
        };
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        if (isFilling) return; // Block interaction if filling

        const { x, y } = getScaledCoordinates(e);

        if (activeTool === 'bucket') {
            const ctx = contextRef.current;
            const imageData = ctx.getImageData(0, 0, width, height);

            const fillGenerator = floodFill(imageData, Math.floor(x), Math.floor(y), hexToRgba(activeColor));

            setIsFilling(true);
            startBucketSound();

            const animateFill = () => {
                const res = fillGenerator.next();
                ctx.putImageData(imageData, 0, 0); // Render current state

                if (!res.done) {
                    requestAnimationFrame(animateFill);
                } else {
                    setIsFilling(false);
                    stopBucketSound();
                }
            };

            requestAnimationFrame(animateFill);

        } else {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
            setIsDrawing(true);
            startBrushSound();
        }
    };

    const handlePointerMove = (e) => {
        e.preventDefault();
        if (!isDrawing || activeTool === 'bucket' || isFilling) return;
        const { x, y } = getScaledCoordinates(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const handlePointerUp = (e) => {
        e.preventDefault();
        if (activeTool === 'brush' && isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            stopBrushSound();
        }
    };

    return (
        <div className="canvas-container relative shadow-lg rounded-lg overflow-hidden bg-white" style={{ maxWidth: '100%', maxHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
            <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ touchAction: 'none', width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                className="cursor-crosshair"
            />
        </div>
    );
});

export default CanvasEditor;
