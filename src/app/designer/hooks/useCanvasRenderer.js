import { useCallback, useEffect } from 'react';

const useCanvasRenderer = (canvasRef, getCanvasContext) => {
    const drawShape = useCallback((ctx, shape) => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.lineWidth;
        ctx.fillStyle = shape.fill ? shape.color : 'transparent';

        switch (shape.type) {
            case 'rectangle':
                ctx.beginPath();
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                ctx.fill();
                ctx.stroke();
                break;

            case 'square':
                const size = Math.max(Math.abs(shape.width), Math.abs(shape.height));
                const signX = Math.sign(shape.width);
                const signY = Math.sign(shape.height);
                ctx.beginPath();
                ctx.rect(shape.x, shape.y, size * signX, size * signY);
                ctx.fill();
                ctx.stroke();
                break;

            case 'circle':
                const radius = Math.sqrt(shape.width * shape.width + shape.height * shape.height) / 2;
                ctx.beginPath();
                ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;

            case 'oval':
                ctx.beginPath();
                ctx.ellipse(
                    shape.x + shape.width / 2,
                    shape.y + shape.height / 2,
                    Math.abs(shape.width) / 2,
                    Math.abs(shape.height) / 2,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
                ctx.stroke();
                break;

            case 'line':
                ctx.beginPath();
                ctx.moveTo(shape.x, shape.y);
                ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
                ctx.stroke();
                break;

            case 'text':
                ctx.font = `${shape.fontSize}px Arial`;
                ctx.fillStyle = shape.color;
                ctx.fillText(shape.text, shape.x, shape.y);
                break;
        }
    }, []);

    const renderShapes = useCallback((shapes) => {
        const ctx = getCanvasContext();
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw all shapes
        shapes.forEach((shape, index) => {
            drawShape(ctx, shape);
        });
    }, [canvasRef, getCanvasContext, drawShape]);

    const renderSelection = useCallback((selectedShapeIndex, shapes) => {
        if (selectedShapeIndex === null) return;

        const ctx = getCanvasContext();
        if (!ctx) return;

        const shape = shapes[selectedShapeIndex];
        if (!shape) return;

        // Draw selection rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
            shape.x - 5,
            shape.y - 5,
            shape.width + 10,
            shape.height + 10
        );
        ctx.setLineDash([]);
    }, [getCanvasContext]);

    useEffect(() => {
        const handleResize = () => {
            if (!canvasRef.current) return;
            const ctx = getCanvasContext();
            if (!ctx) return;

            // Clear canvas on resize
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [canvasRef, getCanvasContext]);

    return {
        drawShape,
        renderShapes,
        renderSelection
    };
};

export default useCanvasRenderer; 