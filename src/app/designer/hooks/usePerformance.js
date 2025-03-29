import { useEffect, useCallback, useRef } from 'react';

const usePerformance = (canvasRef, getCanvasContext) => {
    const frameRequestRef = useRef(null);
    const lastRenderTimeRef = useRef(0);
    const fpsRef = useRef(0);
    const frameCountRef = useRef(0);
    const lastFpsUpdateRef = useRef(0);
    const isThrottledRef = useRef(false);
    const throttleTimeoutRef = useRef(null);

    const calculateFPS = useCallback(() => {
        const now = Date.now();
        const delta = now - lastRenderTimeRef.current;
        lastRenderTimeRef.current = now;

        frameCountRef.current++;
        const timeSinceLastFpsUpdate = now - lastFpsUpdateRef.current;

        if (timeSinceLastFpsUpdate >= 1000) {
            fpsRef.current = Math.round((frameCountRef.current * 1000) / timeSinceLastFpsUpdate);
            frameCountRef.current = 0;
            lastFpsUpdateRef.current = now;
        }

        return fpsRef.current;
    }, []);

    const requestAnimationFrame = useCallback((callback) => {
        if (frameRequestRef.current) {
            cancelAnimationFrame(frameRequestRef.current);
        }

        frameRequestRef.current = window.requestAnimationFrame(() => {
            callback();
            requestAnimationFrame(callback);
        });
    }, []);

    const throttleRender = useCallback((callback, fps = 60) => {
        if (isThrottledRef.current) return;

        isThrottledRef.current = true;
        callback();

        throttleTimeoutRef.current = setTimeout(() => {
            isThrottledRef.current = false;
            throttleRender(callback, fps);
        }, 1000 / fps);
    }, []);

    const optimizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Enable hardware acceleration
        canvas.style.transform = 'translateZ(0)';
        canvas.style.backfaceVisibility = 'hidden';

        // Optimize canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = getCanvasContext();
        if (!ctx) return;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Scale context for high DPI displays
        ctx.scale(dpr, dpr);
    }, [canvasRef, getCanvasContext]);

    const clearCanvas = useCallback(() => {
        const ctx = getCanvasContext();
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }, [canvasRef, getCanvasContext]);

    const batchRender = useCallback((shapes, renderFunction) => {
        const ctx = getCanvasContext();
        if (!ctx) return;

        ctx.save();
        shapes.forEach(shape => renderFunction(ctx, shape));
        ctx.restore();
    }, [getCanvasContext]);

    const measurePerformance = useCallback((callback) => {
        const start = performance.now();
        callback();
        const end = performance.now();
        return end - start;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (frameRequestRef.current) {
                cancelAnimationFrame(frameRequestRef.current);
            }
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
            }
        };
    }, []);

    return {
        calculateFPS,
        requestAnimationFrame,
        throttleRender,
        optimizeCanvas,
        clearCanvas,
        batchRender,
        measurePerformance,
        fps: fpsRef.current
    };
};

export default usePerformance; 