import { useRef, useEffect } from 'react';

const withCanvas = (WrappedComponent) => {
    return function WithCanvasComponent(props) {
        const canvasRef = useRef(null);

        const setupHiDPICanvas = (canvas) => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            // Set the canvas size in memory (scaled up)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Scale down the rendering for correct display size
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            // Set the CSS display size
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };

        const getCanvasContext = () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            return canvas.getContext('2d');
        };

        const clearCanvas = () => {
            const ctx = getCanvasContext();
            if (!ctx) return;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        };

        const getCanvasRect = () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            return canvas.getBoundingClientRect();
        };

        const getCanvasCoordinates = (event) => {
            const rect = getCanvasRect();
            if (!rect) return null;
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        };

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            setupHiDPICanvas(canvas);

            const handleResize = () => {
                setupHiDPICanvas(canvas);
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return (
            <WrappedComponent
                {...props}
                canvasRef={canvasRef}
                getCanvasContext={getCanvasContext}
                clearCanvas={clearCanvas}
                getCanvasCoordinates={getCanvasCoordinates}
            />
        );
    };
};

export default withCanvas; 