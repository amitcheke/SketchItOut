import { useState, useCallback } from 'react';

const useShapeTransform = (shapes, updateShape) => {
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [rotationAngle, setRotationAngle] = useState(0);

    const selectShape = useCallback((index) => {
        setSelectedShapeIndex(index);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedShapeIndex(null);
        setIsResizing(false);
        setIsRotating(false);
        setResizeHandle(null);
    }, []);

    const startResize = useCallback((handle) => {
        setIsResizing(true);
        setResizeHandle(handle);
    }, []);

    const resizeShape = useCallback((e, startPoint) => {
        if (!isResizing || selectedShapeIndex === null) return;

        const shape = shapes[selectedShapeIndex];
        const dx = e.clientX - startPoint.x;
        const dy = e.clientY - startPoint.y;

        let newShape = { ...shape };

        switch (resizeHandle) {
            case 'nw':
                newShape = {
                    ...shape,
                    x: shape.x + dx,
                    y: shape.y + dy,
                    width: shape.width - dx,
                    height: shape.height - dy
                };
                break;
            case 'ne':
                newShape = {
                    ...shape,
                    y: shape.y + dy,
                    width: shape.width + dx,
                    height: shape.height - dy
                };
                break;
            case 'sw':
                newShape = {
                    ...shape,
                    x: shape.x + dx,
                    width: shape.width - dx,
                    height: shape.height + dy
                };
                break;
            case 'se':
                newShape = {
                    ...shape,
                    width: shape.width + dx,
                    height: shape.height + dy
                };
                break;
            case 'n':
                newShape = {
                    ...shape,
                    y: shape.y + dy,
                    height: shape.height - dy
                };
                break;
            case 's':
                newShape = {
                    ...shape,
                    height: shape.height + dy
                };
                break;
            case 'e':
                newShape = {
                    ...shape,
                    width: shape.width + dx
                };
                break;
            case 'w':
                newShape = {
                    ...shape,
                    x: shape.x + dx,
                    width: shape.width - dx
                };
                break;
        }

        updateShape(selectedShapeIndex, newShape);
    }, [isResizing, selectedShapeIndex, shapes, resizeHandle, updateShape]);

    const stopResize = useCallback(() => {
        setIsResizing(false);
        setResizeHandle(null);
    }, []);

    const startRotate = useCallback(() => {
        setIsRotating(true);
    }, []);

    const rotateShape = useCallback((e, center) => {
        if (!isRotating || selectedShapeIndex === null) return;

        const shape = shapes[selectedShapeIndex];
        const dx = e.clientX - center.x;
        const dy = e.clientY - center.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        setRotationAngle(angle);
        updateShape(selectedShapeIndex, {
            ...shape,
            rotation: angle
        });
    }, [isRotating, selectedShapeIndex, shapes, updateShape]);

    const stopRotate = useCallback(() => {
        setIsRotating(false);
    }, []);

    const moveShape = useCallback((dx, dy) => {
        if (selectedShapeIndex === null) return;

        const shape = shapes[selectedShapeIndex];
        updateShape(selectedShapeIndex, {
            ...shape,
            x: shape.x + dx,
            y: shape.y + dy
        });
    }, [selectedShapeIndex, shapes, updateShape]);

    return {
        selectedShapeIndex,
        isResizing,
        isRotating,
        resizeHandle,
        rotationAngle,
        selectShape,
        clearSelection,
        startResize,
        resizeShape,
        stopResize,
        startRotate,
        rotateShape,
        stopRotate,
        moveShape
    };
};

export default useShapeTransform; 