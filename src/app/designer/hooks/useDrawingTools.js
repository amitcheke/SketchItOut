import { useState, useCallback } from 'react';

const useDrawingTools = () => {
    const [activeShapeType, setActiveShapeType] = useState(null);
    const [currentColor, setCurrentColor] = useState("#3b82f6");
    const [fillShape, setFillShape] = useState(true);
    const [lineWidth, setLineWidth] = useState(2);
    const [isTextMode, setIsTextMode] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [isEraser, setIsEraser] = useState(false);
    const [eraserSize, setEraserSize] = useState(20);

    const colors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#10b981", // green
        "#f59e0b", // amber
        "#8b5cf6", // purple
        "#000000"  // black
    ];

    const activateShapeMode = useCallback((type) => {
        setActiveShapeType(type);
        setIsTextMode(false);
        setIsEraser(false);
    }, []);

    const toggleFillMode = useCallback(() => {
        setFillShape(prev => !prev);
    }, []);

    const updateLineWidth = useCallback((width) => {
        setLineWidth(width);
    }, []);

    const changeColor = useCallback((color) => {
        setCurrentColor(color);
    }, []);

    const toggleTextMode = useCallback(() => {
        setIsTextMode(prev => !prev);
        setActiveShapeType(null);
        setIsEraser(false);
    }, []);

    const updateTextInput = useCallback((text) => {
        setTextInput(text);
    }, []);

    const toggleEraser = useCallback(() => {
        setIsEraser(prev => !prev);
        setActiveShapeType(null);
        setIsTextMode(false);
    }, []);

    const updateEraserSize = useCallback((size) => {
        setEraserSize(size);
    }, []);

    const resetTools = useCallback(() => {
        setActiveShapeType(null);
        setIsTextMode(false);
        setIsEraser(false);
        setTextInput("");
    }, []);

    return {
        activeShapeType,
        currentColor,
        fillShape,
        lineWidth,
        isTextMode,
        textInput,
        isEraser,
        eraserSize,
        colors,
        activateShapeMode,
        toggleFillMode,
        updateLineWidth,
        changeColor,
        toggleTextMode,
        updateTextInput,
        toggleEraser,
        updateEraserSize,
        resetTools
    };
};

export default useDrawingTools; 