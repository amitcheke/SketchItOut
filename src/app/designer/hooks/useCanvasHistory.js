import { useState, useCallback, useRef } from 'react';

const useCanvasHistory = (initialState = []) => {
    const [shapes, setShapes] = useState(initialState);
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxHistorySize = useRef(50);

    const saveToHistory = useCallback((newShapes) => {
        setShapes(newShapes);
        setHistory(prev => {
            const newHistory = [...prev.slice(0, currentIndex + 1), newShapes];
            if (newHistory.length > maxHistorySize.current) {
                return newHistory.slice(-maxHistorySize.current);
            }
            return newHistory;
        });
        setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize.current - 1));
    }, [currentIndex]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setShapes(history[currentIndex - 1]);
        }
    }, [currentIndex, history]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShapes(history[currentIndex + 1]);
        }
    }, [currentIndex, history]);

    const canUndo = useCallback(() => {
        return currentIndex > 0;
    }, [currentIndex]);

    const canRedo = useCallback(() => {
        return currentIndex < history.length - 1;
    }, [currentIndex, history]);

    const clearHistory = useCallback(() => {
        setHistory([shapes]);
        setCurrentIndex(0);
    }, [shapes]);

    const updateMaxHistorySize = useCallback((size) => {
        maxHistorySize.current = size;
        setHistory(prev => {
            if (prev.length > size) {
                return prev.slice(-size);
            }
            return prev;
        });
    }, []);

    return {
        shapes,
        history,
        currentIndex,
        saveToHistory,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory,
        updateMaxHistorySize
    };
};

export default useCanvasHistory; 