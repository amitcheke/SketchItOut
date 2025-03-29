import { useCallback } from 'react';

const useCanvasExport = (canvasRef, shapes, layers) => {
    const exportToJSON = useCallback(() => {
        const canvasData = {
            shapes,
            layers,
            timestamp: Date.now(),
            version: '1.0'
        };

        const jsonString = JSON.stringify(canvasData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [shapes, layers]);

    const exportToPNG = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-${new Date().toISOString()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [canvasRef]);

    const exportToSVG = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', canvas.width);
        svg.setAttribute('height', canvas.height);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // Convert shapes to SVG elements
        shapes.forEach(shape => {
            const element = shapeToSVG(shape);
            if (element) {
                svg.appendChild(element);
            }
        });

        const svgString = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `canvas-${new Date().toISOString()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [canvasRef, shapes]);

    const importFromJSON = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const canvasData = JSON.parse(event.target.result);
                    resolve(canvasData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }, []);

    const shapeToSVG = useCallback((shape) => {
        switch (shape.type) {
            case 'rectangle':
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', shape.x);
                rect.setAttribute('y', shape.y);
                rect.setAttribute('width', shape.width);
                rect.setAttribute('height', shape.height);
                rect.setAttribute('fill', shape.fill ? shape.color : 'none');
                rect.setAttribute('stroke', shape.color);
                rect.setAttribute('stroke-width', shape.lineWidth);
                return rect;

            case 'circle':
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                const radius = Math.sqrt(shape.width * shape.width + shape.height * shape.height) / 2;
                circle.setAttribute('cx', shape.x + shape.width / 2);
                circle.setAttribute('cy', shape.y + shape.height / 2);
                circle.setAttribute('r', radius);
                circle.setAttribute('fill', shape.fill ? shape.color : 'none');
                circle.setAttribute('stroke', shape.color);
                circle.setAttribute('stroke-width', shape.lineWidth);
                return circle;

            case 'line':
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', shape.x);
                line.setAttribute('y1', shape.y);
                line.setAttribute('x2', shape.x + shape.width);
                line.setAttribute('y2', shape.y + shape.height);
                line.setAttribute('stroke', shape.color);
                line.setAttribute('stroke-width', shape.lineWidth);
                return line;

            case 'text':
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', shape.x);
                text.setAttribute('y', shape.y);
                text.setAttribute('fill', shape.color);
                text.setAttribute('font-size', shape.fontSize);
                text.textContent = shape.text;
                return text;

            default:
                return null;
        }
    }, []);

    return {
        exportToJSON,
        exportToPNG,
        exportToSVG,
        importFromJSON
    };
};

export default useCanvasExport; 