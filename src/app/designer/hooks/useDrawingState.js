import { useState, useCallback } from 'react';
import { ShapeFactory } from '../factories/ShapeFactory';

const useDrawingState = (canvasRef, getCanvasContext, getCanvasCoordinates) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [currentShape, setCurrentShape] = useState(null);
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);

    const startDrawing = useCallback((e, shapeType, color, lineWidth, fillShape) => {
        const { x, y } = getCanvasCoordinates(e);
        setIsDrawing(true);
        setStartPoint({ x, y });
        
        const shape = ShapeFactory.createShape(shapeType, {
            x,
            y,
            width: 0,
            height: 0,
            color,
            lineWidth,
            fill: fillShape
        });
        
        setCurrentShape(shape);
    }, [getCanvasCoordinates]);

    const draw = useCallback((e, shapes, updateShape) => {
        if (!isDrawing || !currentShape) return;

        const { x, y } = getCanvasCoordinates(e);
        const newShape = {
            ...currentShape,
            width: x - startPoint.x,
            height: y - startPoint.y
        };

        setCurrentShape(newShape);
        updateShape(shapes.length - 1, newShape);
    }, [isDrawing, currentShape, startPoint, getCanvasCoordinates]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentShape(null);
    }, []);

    const selectShape = useCallback((index) => {
        setSelectedShapeIndex(index);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedShapeIndex(null);
    }, []);

    return {
        isDrawing,
        currentShape,
        selectedShapeIndex,
        startDrawing,
        draw,
        stopDrawing,
        selectShape,
        clearSelection
    };
};

export default useDrawingState; 