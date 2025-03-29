import { useState, useCallback } from 'react';
import ShapeFactory from '../factories/ShapeFactory';

const useShapes = () => {
    const [shapes, setShapes] = useState([]);
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const saveToHistory = useCallback((newShapes) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.stringify(newShapes));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const addShape = useCallback((type, props) => {
        const newShape = ShapeFactory.createShape(type, props);
        const normalizedShape = ShapeFactory.normalizeShape(newShape);
        
        if (Math.abs(normalizedShape.width) > 5 && Math.abs(normalizedShape.height) > 5) {
            const newShapes = [...shapes, normalizedShape];
            setShapes(newShapes);
            saveToHistory(newShapes);
        }
    }, [shapes, saveToHistory]);

    const updateShape = useCallback((index, updates) => {
        setShapes(prevShapes => {
            const newShapes = [...prevShapes];
            newShapes[index] = { ...newShapes[index], ...updates };
            saveToHistory(newShapes);
            return newShapes;
        });
    }, [saveToHistory]);

    const deleteShape = useCallback((index) => {
        setShapes(prevShapes => {
            const newShapes = prevShapes.filter((_, i) => i !== index);
            saveToHistory(newShapes);
            return newShapes;
        });
        setSelectedShapeIndex(null);
    }, [saveToHistory]);

    const selectShape = useCallback((index) => {
        setSelectedShapeIndex(index);
    }, []);

    const clearShapes = useCallback(() => {
        setShapes([]);
        setSelectedShapeIndex(null);
        saveToHistory([]);
    }, [saveToHistory]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setShapes(JSON.parse(history[newIndex]));
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setShapes(JSON.parse(history[newIndex]));
        }
    }, [history, historyIndex]);

    const bringToFront = useCallback(() => {
        if (selectedShapeIndex !== null) {
            setShapes(prevShapes => {
                const newShapes = [...prevShapes];
                const [selectedShape] = newShapes.splice(selectedShapeIndex, 1);
                newShapes.push(selectedShape);
                saveToHistory(newShapes);
                return newShapes;
            });
            setSelectedShapeIndex(shapes.length - 1);
        }
    }, [selectedShapeIndex, shapes.length, saveToHistory]);

    const sendToBack = useCallback(() => {
        if (selectedShapeIndex !== null) {
            setShapes(prevShapes => {
                const newShapes = [...prevShapes];
                const [selectedShape] = newShapes.splice(selectedShapeIndex, 1);
                newShapes.unshift(selectedShape);
                saveToHistory(newShapes);
                return newShapes;
            });
            setSelectedShapeIndex(0);
        }
    }, [selectedShapeIndex, saveToHistory]);

    return {
        shapes,
        selectedShapeIndex,
        addShape,
        updateShape,
        deleteShape,
        selectShape,
        clearShapes,
        undo,
        redo,
        bringToFront,
        sendToBack
    };
};

export default useShapes; 