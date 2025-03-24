"use client"

import { useRef, useState, useEffect } from "react";

const Canvas = () => {
    const canvasRef = useRef(null);
    const [shapes, setShapes] = useState([]);
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [resizingCorner, setResizingCorner] = useState(null);
    const [currentColor, setCurrentColor] = useState("#3b82f6"); // Default blue color
    const [activeShapeType, setActiveShapeType] = useState(null);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    // Available colors
    const colors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#10b981", // green
        "#f59e0b", // amber
        "#8b5cf6", // purple
        "#000000"  // black
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all shapes
        shapes.forEach((shape, index) => {
            drawShape(ctx, shape, index === selectedShapeIndex);
        });
    }, [shapes, selectedShapeIndex]);

    const drawShape = (ctx, shape, isSelected) => {
        ctx.fillStyle = shape.color;
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;

        if (shape.type === "rectangle" || shape.type === "square") {
            ctx.beginPath();
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

            // Draw selection rectangle for rectangle and square
            if (isSelected) {
                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 2;
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

                // Draw resize handles
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(
                    shape.x + shape.width - 6,
                    shape.y + shape.height - 6,
                    6,
                    6
                );
            }
        } else if (shape.type === "circle") {
            ctx.beginPath();
            // Fix: Use center coordinates and radius properly
            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;
            const radius = shape.width / 2; // For a circle, width and height should be the same

            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();

            // Draw selection rectangle for circle
            if (isSelected) {
                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 2;
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

                // Draw resize handles
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(
                    shape.x + shape.width - 6,
                    shape.y + shape.height - 6,
                    6,
                    6
                );
            }
        } else if (shape.type === "oval") {
            ctx.beginPath();
            ctx.ellipse(
                shape.x + shape.width / 2,
                shape.y + shape.height / 2,
                Math.abs(shape.width / 2),
                Math.abs(shape.height / 2),
                0,
                0,
                2 * Math.PI
            );
            ctx.fill();

            // Draw selection rectangle for oval
            if (isSelected) {
                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 2;
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

                // Draw resize handles
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(
                    shape.x + shape.width - 6,
                    shape.y + shape.height - 6,
                    6,
                    6
                );
            }
        } else if (shape.type === "line") {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();

            // Special selection indicator for lines
            if (isSelected) {
                // Draw control points at start and end
                ctx.fillStyle = "#ff0000";
                ctx.beginPath();
                ctx.arc(shape.startX, shape.startY, 4, 0, 2 * Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(shape.endX, shape.endY, 4, 0, 2 * Math.PI);
                ctx.fill();

                // Draw a thin selection line
                ctx.strokeStyle = "#ff0000";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(shape.startX, shape.startY);
                ctx.lineTo(shape.endX, shape.endY);
                ctx.stroke();
            }
        }
    };

    const activateShapeMode = (type) => {
        setSelectedShapeIndex(null);
        setActiveShapeType(type);
    };

    const deleteSelectedShape = () => {
        if (selectedShapeIndex !== null) {
            setShapes(shapes.filter((_, index) => index !== selectedShapeIndex));
            setSelectedShapeIndex(null);
        }
    };

    const onMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        // If we're in shape creation mode
        if (activeShapeType) {
            setStartPoint({ x: offsetX, y: offsetY });
            return;
        }

        // Check if clicking on a shape
        let clickedIndex = -1;
        // Reverse loop to select topmost shape when there's overlap
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];

            if (shape.type === "line") {
                // Special hit detection for lines
                const tolerance = 5; // px

                // Check if close to the line
                const A = { x: shape.startX, y: shape.startY };
                const B = { x: shape.endX, y: shape.endY };
                const C = { x: offsetX, y: offsetY };

                // Calculate distance from point to line segment
                const distAB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);

                if (distAB === 0) {
                    // Special case: line of zero length
                    const dist = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2);
                    if (dist <= tolerance) {
                        clickedIndex = i;
                        break;
                    }
                } else {
                    const t = Math.max(0, Math.min(1, ((C.x - A.x) * (B.x - A.x) + (C.y - A.y) * (B.y - A.y)) / (distAB * distAB)));
                    const projection = {
                        x: A.x + t * (B.x - A.x),
                        y: A.y + t * (B.y - A.y)
                    };
                    const dist = Math.sqrt((C.x - projection.x) ** 2 + (C.y - projection.y) ** 2);

                    if (dist <= tolerance) {
                        clickedIndex = i;
                        break;
                    }
                }

                // Also check endpoints (for moving control points)
                const startDist = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2);
                const endDist = Math.sqrt((C.x - B.x) ** 2 + (C.y - B.y) ** 2);

                if (startDist <= 10 || endDist <= 10) {
                    clickedIndex = i;
                    break;
                }
            } else if (shape.type === "circle") {
                // Improved hit detection for circles
                const centerX = shape.x + shape.width / 2;
                const centerY = shape.y + shape.height / 2;
                const radius = shape.width / 2;

                // Check if point is within the circle
                const distance = Math.sqrt((offsetX - centerX) ** 2 + (offsetY - centerY) ** 2);

                if (distance <= radius) {
                    // Check for resize handle
                    if (
                        offsetX >= shape.x + shape.width - 10 &&
                        offsetX <= shape.x + shape.width &&
                        offsetY >= shape.y + shape.height - 10 &&
                        offsetY <= shape.y + shape.height
                    ) {
                        setResizing(true);
                        setResizingCorner("bottom-right");
                    } else {
                        setDragging(true);
                    }

                    clickedIndex = i;
                    break;
                }
            } else {
                // Normal hit detection for other shapes
                if (
                    offsetX >= shape.x &&
                    offsetX <= shape.x + shape.width &&
                    offsetY >= shape.y &&
                    offsetY <= shape.y + shape.height
                ) {
                    // Check for resize handle
                    if (
                        offsetX >= shape.x + shape.width - 10 &&
                        offsetX <= shape.x + shape.width &&
                        offsetY >= shape.y + shape.height - 10 &&
                        offsetY <= shape.y + shape.height
                    ) {
                        setResizing(true);
                        setResizingCorner("bottom-right");
                    } else {
                        setDragging(true);
                    }

                    clickedIndex = i;
                    break;
                }
            }
        }

        if (clickedIndex !== -1) {
            setSelectedShapeIndex(clickedIndex);
            if (!resizing) {
                setDragging(true);

                // Set offset differently for lines
                if (shapes[clickedIndex].type === "line") {
                    setOffset({
                        x: offsetX - shapes[clickedIndex].startX,
                        y: offsetY - shapes[clickedIndex].startY
                    });
                } else {
                    setOffset({
                        x: offsetX - shapes[clickedIndex].x,
                        y: offsetY - shapes[clickedIndex].y
                    });
                }
            }
        } else {
            setSelectedShapeIndex(null);
        }
    };

    const onMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        // Handle active shape drawing (preview)
        if (activeShapeType && startPoint.x !== 0) {
            // Clear canvas and redraw existing shapes
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            shapes.forEach((shape, index) => {
                drawShape(ctx, shape, index === selectedShapeIndex);
            });

            // Calculate dimensions
            const width = offsetX - startPoint.x;
            const height = offsetY - startPoint.y;

            // Draw preview shape
            ctx.fillStyle = currentColor;
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 2;

            if (activeShapeType === "rectangle") {
                ctx.beginPath();
                ctx.fillRect(
                    startPoint.x,
                    startPoint.y,
                    width,
                    height
                );
            } else if (activeShapeType === "square") {
                const size = Math.max(Math.abs(width), Math.abs(height)) * Math.sign(width);
                ctx.beginPath();
                ctx.fillRect(
                    startPoint.x,
                    startPoint.y,
                    size,
                    size
                );
            } else if (activeShapeType === "circle") {
                // Fix: Improved circle preview
                const radius = Math.sqrt(width * width + height * height);
                ctx.beginPath();
                ctx.arc(
                    startPoint.x,
                    startPoint.y,
                    radius,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            } else if (activeShapeType === "oval") {
                ctx.beginPath();
                ctx.ellipse(
                    startPoint.x + width / 2,
                    startPoint.y + height / 2,
                    Math.abs(width / 2),
                    Math.abs(height / 2),
                    0,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            } else if (activeShapeType === "line") {
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            }

            return;
        }

        // Handle dragging or resizing existing shapes
        if ((dragging || resizing) && selectedShapeIndex !== null) {
            setShapes((prevShapes) => {
                const updatedShapes = [...prevShapes];
                const selectedShape = updatedShapes[selectedShapeIndex];

                if (selectedShape.type === "line") {
                    // Handle line dragging
                    if (dragging) {
                        const deltaX = offsetX - offset.x - selectedShape.startX;
                        const deltaY = offsetY - offset.y - selectedShape.startY;

                        updatedShapes[selectedShapeIndex] = {
                            ...selectedShape,
                            startX: selectedShape.startX + deltaX,
                            startY: selectedShape.startY + deltaY,
                            endX: selectedShape.endX + deltaX,
                            endY: selectedShape.endY + deltaY
                        };
                    }
                } else if (selectedShape.type === "circle") {
                    // Specialized handling for circle
                    if (resizing && resizingCorner === "bottom-right") {
                        // For circles, maintain aspect ratio by using distance from center to cursor
                        const centerX = selectedShape.x + selectedShape.width / 2;
                        const centerY = selectedShape.y + selectedShape.height / 2;

                        // Calculate new radius based on distance from center to cursor
                        const newRadius = Math.max(10,
                            Math.sqrt((offsetX - centerX) ** 2 + (offsetY - centerY) ** 2));

                        // Update width and height (equal for circle) and adjust position to keep center fixed
                        const newDiameter = newRadius * 2;

                        updatedShapes[selectedShapeIndex] = {
                            ...selectedShape,
                            width: newDiameter,
                            height: newDiameter,
                            x: centerX - newRadius,
                            y: centerY - newRadius
                        };
                    } else if (dragging) {
                        updatedShapes[selectedShapeIndex] = {
                            ...selectedShape,
                            x: offsetX - offset.x,
                            y: offsetY - offset.y,
                        };
                    }
                } else {
                    // Handle other shapes
                    if (resizing && resizingCorner === "bottom-right") {
                        let newWidth = Math.max(10, offsetX - updatedShapes[selectedShapeIndex].x);
                        let newHeight = Math.max(10, offsetY - updatedShapes[selectedShapeIndex].y);

                        // For square, ensure width and height remain equal
                        if (updatedShapes[selectedShapeIndex].type === "square") {
                            const size = Math.max(newWidth, newHeight);
                            newWidth = size;
                            newHeight = size;
                        }

                        updatedShapes[selectedShapeIndex] = {
                            ...updatedShapes[selectedShapeIndex],
                            width: newWidth,
                            height: newHeight,
                        };
                    } else if (dragging) {
                        updatedShapes[selectedShapeIndex] = {
                            ...updatedShapes[selectedShapeIndex],
                            x: offsetX - offset.x,
                            y: offsetY - offset.y,
                        };
                    }
                }

                return updatedShapes;
            });
        }
    };

    const onMouseUp = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        // Finalize drawing if in shape mode
        if (activeShapeType && startPoint.x !== 0) {
            if (activeShapeType === "line") {
                // Create line with start and end coordinates
                const newLine = {
                    type: "line",
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: offsetX,
                    endY: offsetY,
                    color: currentColor
                };

                setShapes([...shapes, newLine]);
            } else {
                // Calculate dimensions
                const width = offsetX - startPoint.x;
                const height = offsetY - startPoint.y;

                let newShape = {
                    type: activeShapeType,
                    color: currentColor,
                    x: startPoint.x,
                    y: startPoint.y,
                    width: width,
                    height: height
                };

                // Special handling for different shapes
                if (activeShapeType === "square") {
                    const size = Math.max(Math.abs(width), Math.abs(height)) * Math.sign(width);
                    newShape.width = size;
                    newShape.height = size;
                } else if (activeShapeType === "circle") {
                    // Fix: Proper circle creation
                    const radius = Math.sqrt(width * width + height * height);
                    newShape = {
                        ...newShape,
                        width: radius * 2,
                        height: radius * 2,
                        x: startPoint.x - radius,
                        y: startPoint.y - radius
                    };
                }

                // Normalize negative dimensions
                if (newShape.width < 0) {
                    newShape.x += newShape.width;
                    newShape.width = Math.abs(newShape.width);
                }

                if (newShape.height < 0) {
                    newShape.y += newShape.height;
                    newShape.height = Math.abs(newShape.height);
                }

                // Add shape if it has a minimum size
                if (Math.abs(newShape.width) > 5 && Math.abs(newShape.height) > 5) {
                    setShapes([...shapes, newShape]);
                }
            }

            // Reset drawing state
            setStartPoint({ x: 0, y: 0 });
            setActiveShapeType(null);
        }

        setDragging(false);
        setResizing(false);
        setResizingCorner(null);
    };

    const changeShapeColor = (color) => {
       console.log("Change color")
        if (selectedShapeIndex !== null) {
            setShapes(shapes.map((shape, index) =>{
                    if(index === selectedShapeIndex) {
                        console.log("--------------->>>", shape)
                        return { ...shape, color }
                    }  else { return shape}
            }

            ));
        } else {
            setCurrentColor(color);
        }
    };

    // Bring selected shape to front
    const bringToFront = () => {
        if (selectedShapeIndex !== null) {
            const newShapes = [...shapes];
            const [selectedShape] = newShapes.splice(selectedShapeIndex, 1);
            newShapes.push(selectedShape);
            setShapes(newShapes);
            setSelectedShapeIndex(newShapes.length - 1);
        }
    };

    // Send selected shape to back
    const sendToBack = () => {
        if (selectedShapeIndex !== null) {
            const newShapes = [...shapes];
            const [selectedShape] = newShapes.splice(selectedShapeIndex, 1);
            newShapes.unshift(selectedShape);
            setShapes(newShapes);
            setSelectedShapeIndex(0);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    className={`px-3 py-1 ${activeShapeType === "rectangle" ? "bg-blue-700" : "bg-blue-500"} text-white rounded hover:bg-blue-600`}
                    onClick={() => activateShapeMode("rectangle")}
                >
                    Rectangle
                </button>
                <button
                    className={`px-3 py-1 ${activeShapeType === "square" ? "bg-blue-700" : "bg-blue-500"} text-white rounded hover:bg-blue-600`}
                    onClick={() => activateShapeMode("square")}
                >
                    Square
                </button>
                <button
                    className={`px-3 py-1 ${activeShapeType === "circle" ? "bg-blue-700" : "bg-blue-500"} text-white rounded hover:bg-blue-600`}
                    onClick={() => activateShapeMode("circle")}
                >
                    Circle
                </button>
                <button
                    className={`px-3 py-1 ${activeShapeType === "oval" ? "bg-blue-700" : "bg-blue-500"} text-white rounded hover:bg-blue-600`}
                    onClick={() => activateShapeMode("oval")}
                >
                    Oval
                </button>
                <button
                    className={`px-3 py-1 ${activeShapeType === "line" ? "bg-blue-700" : "bg-blue-500"} text-white rounded hover:bg-blue-600`}
                    onClick={() => activateShapeMode("line")}
                >
                    Line
                </button>
                <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={deleteSelectedShape}
                    disabled={selectedShapeIndex === null}
                >
                    Delete
                </button>
                <button
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={bringToFront}
                    disabled={selectedShapeIndex === null}
                >
                    Bring to Front
                </button>
                <button
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={sendToBack}
                    disabled={selectedShapeIndex === null}
                >
                    Send to Back
                </button>
            </div>

            <div className="mb-4">
                <p className="text-sm mb-1">Colors:</p>
                <div className="flex gap-2">
                    {colors.map((color) => {
                        console.log("Color:", color)
                        return (
                            // <div
                            //     key={color}
                            //     className={`w-6 h-6 rounded-full cursor-pointer`}
                            //     style={{ backgroundColor: color }}
                            //     onClick={() => changeShapeColor(color)}
                            // />
                            <div key={color} className="w-16 h-16 block"
                                 style={{backgroundColor:color}} onClick={() => changeShapeColor(color)} >{color}</div>

                        )
                    })}
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-300 rounded cursor-crosshair"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            />

            {selectedShapeIndex !== null && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                    <p className="text-sm">Selected: {shapes[selectedShapeIndex]?.type}</p>
                </div>
            )}

            {activeShapeType && (
                <div className="mt-4 p-2 bg-blue-100 rounded">
                    <p className="text-sm">Drawing: {activeShapeType} (click and drag to draw)</p>
                </div>
            )}
        </div>
    );
};

export default Canvas;