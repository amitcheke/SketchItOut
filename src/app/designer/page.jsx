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
    const [fillShape, setFillShape] = useState(true); // New state for fill/outline option
    const [lineWidth, setLineWidth] = useState(2); // Line width state

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

        // Set up high DPI canvas for crisp rendering
        setupHiDPICanvas(canvas);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all shapes
        shapes.forEach((shape, index) => {
            drawShape(ctx, shape, index === selectedShapeIndex);
        });
    }, [shapes, selectedShapeIndex]);

    // Function to set up high DPI canvas
    const setupHiDPICanvas = (canvas) => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Set the canvas size in memory (scaled up)
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Scale down the rendering for correct display size
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Set the CSS display size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    };

    const drawShape = (ctx, shape, isSelected) => {
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.lineWidth = shape.lineWidth || 2;

        if (shape.type === "rectangle" || shape.type === "square") {
            ctx.beginPath();

            if (shape.fill) {
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            } else {
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }

            // Draw selection rectangle
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
            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;
            const radius = shape.width / 2;

            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

            if (shape.fill) {
                ctx.fill();
            } else {
                ctx.stroke();
            }

            // Draw selection rectangle
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

            if (shape.fill) {
                ctx.fill();
            } else {
                ctx.stroke();
            }

            // Draw selection rectangle
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
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

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
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

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
            ctx.lineWidth = lineWidth;

            if (activeShapeType === "rectangle") {
                ctx.beginPath();
                if (fillShape) {
                    ctx.fillRect(
                        startPoint.x,
                        startPoint.y,
                        width,
                        height
                    );
                } else {
                    ctx.strokeRect(
                        startPoint.x,
                        startPoint.y,
                        width,
                        height
                    );
                }
            } else if (activeShapeType === "square") {
                const size = Math.max(Math.abs(width), Math.abs(height)) * Math.sign(width);
                ctx.beginPath();
                if (fillShape) {
                    ctx.fillRect(
                        startPoint.x,
                        startPoint.y,
                        size,
                        size
                    );
                } else {
                    ctx.strokeRect(
                        startPoint.x,
                        startPoint.y,
                        size,
                        size
                    );
                }
            } else if (activeShapeType === "circle") {
                const radius = Math.sqrt(width * width + height * height);
                ctx.beginPath();
                ctx.arc(
                    startPoint.x,
                    startPoint.y,
                    radius,
                    0,
                    2 * Math.PI
                );
                if (fillShape) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
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
                if (fillShape) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
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
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

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
                    color: currentColor,
                    lineWidth: lineWidth
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
                    height: height,
                    fill: fillShape,
                    lineWidth: lineWidth
                };

                // Special handling for different shapes
                if (activeShapeType === "square") {
                    const size = Math.max(Math.abs(width), Math.abs(height)) * Math.sign(width);
                    newShape.width = size;
                    newShape.height = size;
                } else if (activeShapeType === "circle") {
                    // Proper circle creation
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
        if (selectedShapeIndex !== null) {
            setShapes(shapes.map((shape, index) =>
                index === selectedShapeIndex ? { ...shape, color } : shape
            ));
        } else {
            setCurrentColor(color);
        }
    };

    // Toggle fill/outline mode
    const toggleFillMode = () => {
        if (selectedShapeIndex !== null && shapes[selectedShapeIndex].type !== "line") {
            // Toggle fill property of selected shape
            setShapes(shapes.map((shape, index) =>
                index === selectedShapeIndex ? { ...shape, fill: !shape.fill } : shape
            ));
        } else {
            // Toggle global fill mode for new shapes
            setFillShape(!fillShape);
        }
    };

    // Update line width
    const updateLineWidth = (width) => {
        if (selectedShapeIndex !== null) {
            setShapes(shapes.map((shape, index) =>
                index === selectedShapeIndex ? { ...shape, lineWidth: width } : shape
            ));
        } else {
            setLineWidth(width);
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

    // Helper function to determine button style
    const getButtonStyle = (isActive) => {
        return isActive
            ? "px-3 py-2 bg-indigo-700 text-white rounded-md shadow hover:bg-indigo-800 transition-colors"
            : "px-3 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 transition-colors";
    };

    // Clear canvas
    const clearCanvas = () => {
        setShapes([]);
        setSelectedShapeIndex(null);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vector Drawing Tool</h2>

            {/* Toolbar */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        className={getButtonStyle(activeShapeType === "rectangle")}
                        onClick={() => activateShapeMode("rectangle")}
                        title="Rectangle Tool"
                    >
                        Rectangle
                    </button>
                    <button
                        className={getButtonStyle(activeShapeType === "square")}
                        onClick={() => activateShapeMode("square")}
                        title="Square Tool"
                    >
                        Square
                    </button>
                    <button
                        className={getButtonStyle(activeShapeType === "circle")}
                        onClick={() => activateShapeMode("circle")}
                        title="Circle Tool"
                    >
                        Circle
                    </button>
                    <button
                        className={getButtonStyle(activeShapeType === "oval")}
                        onClick={() => activateShapeMode("oval")}
                        title="Oval Tool"
                    >
                        Oval
                    </button>
                    <button
                        className={getButtonStyle(activeShapeType === "line")}
                        onClick={() => activateShapeMode("line")}
                        title="Line Tool"
                    >
                        Line
                    </button>

                    <div className="h-8 w-px bg-gray-300 mx-1"></div>

                    <button
                        className={`px-3 py-2 ${fillShape ? 'bg-green-600' : 'bg-gray-500'} text-white rounded-md shadow hover:opacity-90 transition-opacity`}
                        onClick={toggleFillMode}
                        title={fillShape ? "Switch to Outline Mode" : "Switch to Fill Mode"}
                    >
                        {fillShape ? "Filled" : "Outline"}
                    </button>

                    <select
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={lineWidth}
                        onChange={(e) => updateLineWidth(parseInt(e.target.value))}
                        title="Line Thickness"
                    >
                        <option value="1">Thin</option>
                        <option value="2">Medium</option>
                        <option value="4">Thick</option>
                        <option value="6">Very Thick</option>
                    </select>

                    <div className="h-8 w-px bg-gray-300 mx-1"></div>

                    <button
                        className="px-3 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition-colors"
                        onClick={deleteSelectedShape}
                        disabled={selectedShapeIndex === null}
                        title="Delete Selected Shape"
                    >
                        Delete
                    </button>
                    <button
                        className="px-3 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition-colors"
                        onClick={bringToFront}
                        disabled={selectedShapeIndex === null}
                        title="Bring to Front"
                    >
                        Bring to Front
                    </button>
                    <button
                        className="px-3 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition-colors"
                        onClick={sendToBack}
                        disabled={selectedShapeIndex === null}
                        title="Send to Back"
                    >
                        Send to Back
                    </button>
                    <button
                        className="px-3 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition-colors ml-auto"
                        onClick={clearCanvas}
                        title="Clear Canvas"
                    >
                        Clear All
                    </button>
                </div>

                {/* Color Palette */}
                <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2 font-medium">Colors:</p>
                    <div className="flex gap-3">
                        {colors.map((color) => (
                            <div
                                key={color}
                                className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${color === currentColor ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => changeShapeColor(color)}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="border border-gray-300 rounded-lg shadow-sm bg-white cursor-crosshair"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                />

                {/* Status Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-100 bg-opacity-90 p-2 text-sm font-mono text-gray-700 rounded-b-lg">
                    {selectedShapeIndex !== null ? (
                        <span className="font-medium">
                            Selected: {shapes[selectedShapeIndex]?.type}
                            {shapes[selectedShapeIndex]?.type !== "line" &&
                                ` (${shapes[selectedShapeIndex]?.fill ? 'Filled' : 'Outline'})`
                            }
                        </span>
                    ) : activeShapeType ? (
                        <span className="font-medium">
                            Drawing: {activeShapeType}
                            {activeShapeType !== "line" && ` (${fillShape ? 'Filled' : 'Outline'})`}
                            - Click and drag to draw
                        </span>
                    ) : (
                        <span>Select a shape to edit or choose a drawing tool</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Canvas;