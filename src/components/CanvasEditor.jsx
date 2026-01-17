import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { floodFill } from '../utils/floodFill';
import brushSoundFile from '../assets/paint_brush_07-97965.mp3';
import bucketSoundFile from '../assets/normal-paint-strokes_1-2-91567.mp3';

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

    // Web Audio API refs
    const audioContextRef = useRef(null);
    const brushBufferRef = useRef(null);
    const bucketBufferRef = useRef(null);
    const activeBrushSourceRef = useRef(null);
    const activeBrushGainRef = useRef(null);
    const lastPointRef = useRef(null);
    const lastTimeRef = useRef(0);

    useEffect(() => {
        // Init Audio Context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // Load Sprites/Buffers
        const loadSound = async (url, ref) => {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            ref.current = audioBuffer;
        };

        loadSound(brushSoundFile, brushBufferRef);
        loadSound(bucketSoundFile, bucketBufferRef);

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startBrushSound = () => {
        if (activeTool === 'brush' && audioContextRef.current && brushBufferRef.current) {
            // Resume context if suspended (browser policy)
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const source = audioContextRef.current.createBufferSource();
            const gainNode = audioContextRef.current.createGain();

            source.buffer = brushBufferRef.current;
            source.loop = true;
            // Randomize start time to avoid repetition
            const randomOffset = Math.random() * source.buffer.duration;

            source.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            // Start low volume, will modulate validly on move
            gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);

            source.start(0, randomOffset);

            activeBrushSourceRef.current = source;
            activeBrushGainRef.current = gainNode;
        }
    };


    const stopBrushSound = () => {
        if (activeBrushSourceRef.current) {
            try {
                // Exponential ramp down to avoid clicks
                if (activeBrushGainRef.current) {
                    activeBrushGainRef.current.gain.linearRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
                }
                activeBrushSourceRef.current.stop(audioContextRef.current.currentTime + 0.1);
            } catch (e) {
                // Ignore if already stopped
            }
            activeBrushSourceRef.current = null;
            activeBrushGainRef.current = null;
        }
    };

    const startBucketSound = () => {
        if (audioContextRef.current && bucketBufferRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            const source = audioContextRef.current.createBufferSource();
            const gainNode = audioContextRef.current.createGain();
            source.buffer = bucketBufferRef.current;
            source.loop = true;
            source.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            gainNode.gain.setValueAtTime(0.6, audioContextRef.current.currentTime);
            source.start(0);

            activeBrushSourceRef.current = source;
            activeBrushGainRef.current = gainNode;
        }
    };

    const stopBucketSound = () => {
        stopBrushSound();
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
        if (isFilling) return;

        if (activeTool === 'bucket') {
            const { x, y } = getScaledCoordinates(e);
            const ctx = contextRef.current;
            const imageData = ctx.getImageData(0, 0, width, height);

            const fillGenerator = floodFill(imageData, Math.floor(x), Math.floor(y), hexToRgba(activeColor));

            setIsFilling(true);
            startBucketSound();

            const animateFill = () => {
                const res = fillGenerator.next();
                ctx.putImageData(imageData, 0, 0);

                if (!res.done) {
                    requestAnimationFrame(animateFill);
                } else {
                    setIsFilling(false);
                    stopBucketSound();
                }
            };
            requestAnimationFrame(animateFill);

        } else {
            const { x, y } = getScaledCoordinates(e);
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
            setIsDrawing(true);

            lastPointRef.current = { x, y };
            lastTimeRef.current = Date.now();

            startBrushSound();
        }
    };

    const handlePointerMove = (e) => {
        e.preventDefault();
        if (!isDrawing || activeTool === 'bucket' || isFilling) return;

        const { x, y } = getScaledCoordinates(e);
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();

        // Modulate Sound
        if (activeBrushGainRef.current && lastPointRef.current) {
            const now = Date.now();
            const timeDelta = now - lastTimeRef.current;

            if (timeDelta > 5) { // Throttle updates slightly
                const dist = Math.hypot(x - lastPointRef.current.x, y - lastPointRef.current.y);
                const speed = dist / timeDelta; // pixels per ms

                // Map speed to volume (0.0 to 1.0)
                // Assuming max typical speed ~ 3-4 px/ms (?)
                const minGain = 0.1;
                const maxGain = 0.8;
                const normalizedSpeed = Math.min(speed / 2.5, 1); // Clamp at 2.5 px/ms
                const targetGain = minGain + (normalizedSpeed * (maxGain - minGain));

                // Map speed to pitch (0.9 to 1.2) - faster strokes = slightly higher pitch
                const minRate = 0.9;
                const maxRate = 1.2;
                const targetRate = minRate + (normalizedSpeed * (maxRate - minRate));

                // Smooth transition
                activeBrushGainRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.05);
                if (activeBrushSourceRef.current && activeBrushSourceRef.current.playbackRate) {
                    activeBrushSourceRef.current.playbackRate.setTargetAtTime(targetRate, audioContextRef.current.currentTime, 0.05);
                }

                lastPointRef.current = { x, y };
                lastTimeRef.current = now;
            }
        }
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
