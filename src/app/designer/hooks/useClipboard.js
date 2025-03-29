import { useState, useCallback } from 'react';
import { ShapeFactory } from '../factories/ShapeFactory';

const useClipboard = (addShape) => {
    const [clipboard, setClipboard] = useState(null);

    const copyShape = useCallback((shape) => {
        if (!shape) return;

        // Create a deep copy of the shape with a slight offset
        const copiedShape = {
            ...shape,
            x: shape.x + 20,
            y: shape.y + 20,
            id: Date.now() // Generate a new unique ID
        };

        setClipboard(copiedShape);
    }, []);

    const cutShape = useCallback((shape, deleteShape) => {
        if (!shape) return;
        copyShape(shape);
        deleteShape();
    }, [copyShape]);

    const pasteShape = useCallback(() => {
        if (!clipboard) return;

        // Create a new shape from the clipboard with a slight offset
        const pastedShape = {
            ...clipboard,
            x: clipboard.x + 20,
            y: clipboard.y + 20,
            id: Date.now() // Generate a new unique ID
        };

        addShape(pastedShape);
    }, [clipboard, addShape]);

    const clearClipboard = useCallback(() => {
        setClipboard(null);
    }, []);

    return {
        clipboard,
        copyShape,
        cutShape,
        pasteShape,
        clearClipboard
    };
};

export default useClipboard; 