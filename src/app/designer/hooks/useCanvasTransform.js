import { useState, useCallback } from 'react';

const useCanvasTransform = (canvasRef, getCanvasContext) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState(null);

    const applyTransform = useCallback(() => {
        const ctx = getCanvasContext();
        if (!ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);
    }, [scale, offset, canvasRef, getCanvasContext]);

    const resetTransform = useCallback(() => {
        const ctx = getCanvasContext();
        if (!ctx) return;

        ctx.restore();
    }, [getCanvasContext]);

    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(prev / 1.2, 0.1));
    }, []);

    const startPanning = useCallback((e) => {
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
    }, []);

    const pan = useCallback((e) => {
        if (!isPanning || !lastPanPoint) return;

        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;

        setOffset(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));

        setLastPanPoint({ x: e.clientX, y: e.clientY });
    }, [isPanning, lastPanPoint]);

    const stopPanning = useCallback(() => {
        setIsPanning(false);
        setLastPanPoint(null);
    }, []);

    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const getTransformedPoint = useCallback((x, y) => {
        return {
            x: (x - offset.x) / scale,
            y: (y - offset.y) / scale
        };
    }, [offset, scale]);

    const getScreenPoint = useCallback((x, y) => {
        return {
            x: x * scale + offset.x,
            y: y * scale + offset.y
        };
    }, [offset, scale]);

    return {
        scale,
        offset,
        isPanning,
        applyTransform,
        resetTransform,
        zoomIn,
        zoomOut,
        startPanning,
        pan,
        stopPanning,
        resetView,
        getTransformedPoint,
        getScreenPoint
    };
};

export default useCanvasTransform; 