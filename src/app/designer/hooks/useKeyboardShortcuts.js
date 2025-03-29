import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = ({
    undo,
    redo,
    deleteShape,
    selectedShapeIndex,
    bringToFront,
    sendToBack,
    clearCanvas
}) => {
    const handleKeyDown = useCallback((e) => {
        // Only handle keyboard shortcuts if not typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Check if Ctrl/Cmd key is pressed
        const isCtrlPressed = e.ctrlKey || e.metaKey;

        switch (e.key.toLowerCase()) {
            case 'z':
                if (isCtrlPressed) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                }
                break;

            case 'y':
                if (isCtrlPressed) {
                    e.preventDefault();
                    redo();
                }
                break;

            case 'delete':
            case 'backspace':
                if (selectedShapeIndex !== null) {
                    e.preventDefault();
                    deleteShape(selectedShapeIndex);
                }
                break;

            case '[':
                if (isCtrlPressed && selectedShapeIndex !== null) {
                    e.preventDefault();
                    sendToBack();
                }
                break;

            case ']':
                if (isCtrlPressed && selectedShapeIndex !== null) {
                    e.preventDefault();
                    bringToFront();
                }
                break;

            case 'a':
                if (isCtrlPressed) {
                    e.preventDefault();
                    // Select all shapes (to be implemented)
                }
                break;

            case 'c':
                if (isCtrlPressed) {
                    e.preventDefault();
                    // Copy selected shape (to be implemented)
                }
                break;

            case 'v':
                if (isCtrlPressed) {
                    e.preventDefault();
                    // Paste copied shape (to be implemented)
                }
                break;

            case 'x':
                if (isCtrlPressed) {
                    e.preventDefault();
                    // Cut selected shape (to be implemented)
                }
                break;

            case 'escape':
                e.preventDefault();
                clearCanvas();
                break;
        }
    }, [
        undo,
        redo,
        deleteShape,
        selectedShapeIndex,
        bringToFront,
        sendToBack,
        clearCanvas
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        handleKeyDown
    };
};

export default useKeyboardShortcuts; 