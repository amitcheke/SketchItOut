import { useCallback, useEffect } from 'react';

const useTouchInteractions = ({
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    selectShape,
    clearSelection,
    getCanvasCoordinates
}) => {
    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const { x, y } = getCanvasCoordinates(touch);
        
        // Check if touch is on a shape
        const ctx = canvasRef.current.getContext('2d');
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        
        if (pixel[3] > 0) {
            // Touch is on a shape, select it
            // Note: This is a simplified version. In a real implementation,
            // you would need to track which shape is at the touch coordinates
            selectShape(0);
        } else {
            // Start drawing
            startDrawing(touch, 'rectangle', '#3b82f6', 2, true);
        }
    }, [canvasRef, startDrawing, selectShape, getCanvasCoordinates]);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        const touch = e.touches[0];
        draw(touch);
    }, [draw]);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        stopDrawing();
    }, [stopDrawing]);

    const handleTouchCancel = useCallback((e) => {
        e.preventDefault();
        stopDrawing();
        clearSelection();
    }, [stopDrawing, clearSelection]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Add touch event listeners
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        canvas.addEventListener('touchcancel', handleTouchCancel, { passive: false });

        // Prevent default touch behaviors
        const preventDefault = (e) => e.preventDefault();
        canvas.addEventListener('touchstart', preventDefault, { passive: false });
        canvas.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            // Remove event listeners
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('touchcancel', handleTouchCancel);
            canvas.removeEventListener('touchstart', preventDefault);
            canvas.removeEventListener('touchmove', preventDefault);
        };
    }, [
        canvasRef,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleTouchCancel
    ]);

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleTouchCancel
    };
};

export default useTouchInteractions; 