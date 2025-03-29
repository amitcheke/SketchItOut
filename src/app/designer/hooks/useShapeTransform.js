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

        if (shape.type === 'circle' || shape.type === 'oval') {
            let newWidth = shape.width;
            let newHeight = shape.height;
            let newX = shape.x;
            let newY = shape.y;

            switch (resizeHandle) {
                case 'nw':
                    if (shape.type === 'circle') {
                        const delta = Math.max(Math.abs(dx), Math.abs(dy));
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                        newX = shape.x - delta;
                        newY = shape.y - delta;
                    } else {
                        newWidth = shape.width - dx;
                        newHeight = shape.height - dy;
                        newX = shape.x + dx;
                        newY = shape.y + dy;
                    }
                    break;
                case 'ne':
                    if (shape.type === 'circle') {
                        const delta = Math.max(Math.abs(dx), Math.abs(dy));
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                        newY = shape.y - delta;
                    } else {
                        newWidth = shape.width + dx;
                        newHeight = shape.height - dy;
                        newY = shape.y + dy;
                    }
                    break;
                case 'sw':
                    if (shape.type === 'circle') {
                        const delta = Math.max(Math.abs(dx), Math.abs(dy));
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                        newX = shape.x - delta;
                    } else {
                        newWidth = shape.width - dx;
                        newHeight = shape.height + dy;
                        newX = shape.x + dx;
                    }
                    break;
                case 'se':
                    if (shape.type === 'circle') {
                        const delta = Math.max(Math.abs(dx), Math.abs(dy));
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                    } else {
                        newWidth = shape.width + dx;
                        newHeight = shape.height + dy;
                    }
                    break;
                case 'n':
                    if (shape.type === 'circle') {
                        const delta = Math.abs(dy);
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                        newY = shape.y - delta;
                    } else {
                        newHeight = shape.height - dy;
                        newY = shape.y + dy;
                    }
                    break;
                case 's':
                    if (shape.type === 'circle') {
                        const delta = Math.abs(dy);
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                    } else {
                        newHeight = shape.height + dy;
                    }
                    break;
                case 'e':
                    if (shape.type === 'circle') {
                        const delta = Math.abs(dx);
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                    } else {
                        newWidth = shape.width + dx;
                    }
                    break;
                case 'w':
                    if (shape.type === 'circle') {
                        const delta = Math.abs(dx);
                        newWidth = shape.width + delta;
                        newHeight = shape.width + delta;
                        newX = shape.x - delta;
                    } else {
                        newWidth = shape.width - dx;
                        newX = shape.x + dx;
                    }
                    break;
            }

            newShape = {
                ...shape,
                x: newX,
                y: newY,
                width: Math.max(1, newWidth),
                height: Math.max(1, newHeight)
            };
        } else {
            // Handle other shapes as before
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
        }

        // Ensure dimensions are not negative
        if (newShape.width < 0) {
            newShape.x += newShape.width;
            newShape.width = Math.abs(newShape.width);
        }
        if (newShape.height < 0) {
            newShape.y += newShape.height;
            newShape.height = Math.abs(newShape.height);
        }

        // Ensure minimum size
        newShape.width = Math.max(1, newShape.width);
        newShape.height = Math.max(1, newShape.height);

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