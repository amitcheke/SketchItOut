import { useState, useCallback } from 'react';

const useGrid = (canvasRef, getCanvasContext) => {
    const [showGrid, setShowGrid] = useState(false);
    const [gridSize, setGridSize] = useState(20);
    const [snapToGrid, setSnapToGrid] = useState(true);

    const drawGrid = useCallback(() => {
        if (!showGrid || !canvasRef.current) return;

        const ctx = getCanvasContext();
        if (!ctx) return;

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        ctx.save();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 0.5;

        // Draw vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    }, [showGrid, gridSize, canvasRef, getCanvasContext]);

    const snapToGridPoint = useCallback((x, y) => {
        if (!snapToGrid) return { x, y };

        return {
            x: Math.round(x / gridSize) * gridSize,
            y: Math.round(y / gridSize) * gridSize
        };
    }, [snapToGrid, gridSize]);

    const toggleGrid = useCallback(() => {
        setShowGrid(prev => !prev);
    }, []);

    const toggleSnapToGrid = useCallback(() => {
        setSnapToGrid(prev => !prev);
    }, []);

    const updateGridSize = useCallback((size) => {
        setGridSize(size);
    }, []);

    return {
        showGrid,
        gridSize,
        snapToGrid,
        drawGrid,
        snapToGridPoint,
        toggleGrid,
        toggleSnapToGrid,
        updateGridSize
    };
};

export default useGrid; 