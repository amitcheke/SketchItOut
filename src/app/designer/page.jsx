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
                const tolerance = 5; // px

                const startDist = Math.sqrt((offsetX - shape.startX) ** 2 + (offsetY - shape.startY) ** 2);
                const endDist = Math.sqrt((offsetX - shape.endX) ** 2 + (offsetY - shape.endY) ** 2);

                if (startDist <= 10) {
                    // We're near the start point
                    setResizing(true);
                    setResizingCorner("start");
                    clickedIndex = i;
                    break;
                } else if (endDist <= 10) {
                    // We're near the end point
                    setResizing(true);
                    setResizingCorner("end");
                    clickedIndex = i;
                    break;
                } else {
                    // Check if close to the line segment
                    const A = { x: shape.startX, y: shape.startY };
                    const B = { x: shape.endX, y: shape.endY };
                    const C = { x: offsetX, y: offsetY };

                    // Calculate distance from point to line segment
                    const distAB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);

                    if (distAB === 0) {
                        // Special case: line of zero length
                        const dist = Math.sqrt((C.x - A.x) ** 2 + (C.y - A.y) ** 2);
                        if (dist <= tolerance) {
                            setDragging(true);
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
                            setDragging(true);
                            clickedIndex = i;
                            break;
                        }
                    }
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
                    if (resizing) {
                        // Handle line endpoint resizing
                        if (resizingCorner === "start") {
                            updatedShapes[selectedShapeIndex] = {
                                ...selectedShape,
                                startX: offsetX,
                                startY: offsetY
                            };
                        } else if (resizingCorner === "end") {
                            updatedShapes[selectedShapeIndex] = {
                                ...selectedShape,
                                endX: offsetX,
                                endY: offsetY
                            };
                        }
                    } else if (dragging) {
                        // Handle line dragging
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
        <div className="flex h-screen bg-gray-50">
            {/* Primary Sidebar - Main Categories */}
            <div className="w-20 bg-gray-100 shadow-sm flex flex-col items-center pt-3">
                <div className="flex flex-col items-center space-y-6">
                    {/* Main Category Buttons */}
                    <div className="flex flex-col items-center py-3 px-2 w-full rounded cursor-pointer transition hover:bg-gray-200">
                        <div className="h-6 w-6 mb-1 bg-gray-500 rounded"></div>
                        <span className="text-xs text-gray-700">Design</span>
                    </div>

                    <div className="flex flex-col items-center py-3 px-2 w-full rounded cursor-pointer transition hover:bg-gray-200">
                        <div className="h-6 w-6 mb-1 bg-gray-500 rounded"></div>
                        <span className="text-xs text-gray-700">Elements</span>
                    </div>

                    <div className="flex flex-col items-center py-3 px-2 w-full rounded cursor-pointer transition hover:bg-gray-200">
                        <div className="h-6 w-6 mb-1 bg-gray-500 rounded"></div>
                        <span className="text-xs text-gray-700">Text</span>
                    </div>

                    <div className="flex flex-col items-center py-3 px-2 w-full rounded cursor-pointer transition hover:bg-gray-200">
                        <div className="h-6 w-6 mb-1 bg-gray-500 rounded"></div>
                        <span className="text-xs text-gray-700">Uploads</span>
                    </div>

                    <div className="flex flex-col items-center py-3 px-2 w-full bg-blue-100 rounded cursor-pointer transition hover:bg-blue-200">
                        <div className="h-6 w-6 mb-1 bg-blue-500 rounded"></div>
                        <span className="text-xs text-blue-700 font-medium">Draw</span>
                    </div>

                    <div className="flex flex-col items-center py-3 px-2 w-full rounded cursor-pointer transition hover:bg-gray-200">
                        <div className="h-6 w-6 mb-1 bg-gray-500 rounded"></div>
                        <span className="text-xs text-gray-700">Apps</span>
                    </div>
                </div>
            </div>

            {/* Secondary Sidebar - Tools Panel */}
            <div className="w-64 bg-white shadow-sm flex flex-col border-r">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-medium text-gray-800">Drawing Tools</h2>
                </div>

                {/* Drawing Shapes Section */}
                <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Shapes</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {["Rectangle", "Square", "Circle", "Oval", "Line"].map((type) => (
                            <button
                                key={type.toLowerCase()}
                                className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                                    activeShapeType === type.toLowerCase()
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => activateShapeMode(type.toLowerCase())}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style Controls Section */}
                <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Style</h3>

                    {/* Fill Toggle */}
                    <div className="mb-4">
                        <span className="text-xs text-gray-500 block mb-2">Fill Mode</span>
                        <div className="flex gap-2">
                            <button
                                className={`flex-1 px-3 py-1.5 rounded text-sm ${
                                    fillShape
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={toggleFillMode}
                            >
                                Filled
                            </button>
                            <button
                                className={`flex-1 px-3 py-1.5 rounded text-sm ${
                                    !fillShape
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={toggleFillMode}
                            >
                                Outline
                            </button>
                        </div>
                    </div>

                    {/* Line Width */}
                    <div className="mb-4">
                        <span className="text-xs text-gray-500 block mb-2">Line Thickness</span>
                        <select
                            className="w-full py-1.5 px-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={lineWidth}
                            onChange={(e) => updateLineWidth(parseInt(e.target.value))}
                        >
                            <option value="1">Thin</option>
                            <option value="2">Medium</option>
                            <option value="4">Thick</option>
                            <option value="6">Very Thick</option>
                        </select>
                    </div>
                </div>

                {/* Colors Section */}
                <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Colors</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {colors.map((color) => (
                            <button
                                key={color}
                                className={`w-8 h-8 rounded-full transition-all ${
                                    color === currentColor ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => changeShapeColor(color)}
                            />
                        ))}
                    </div>
                </div>

                {/* Shape Operations Section */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Arrange</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            className={`px-3 py-2 rounded text-sm font-medium ${
                                selectedShapeIndex === null
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-700 text-white hover:bg-gray-800"
                            }`}
                            onClick={bringToFront}
                            disabled={selectedShapeIndex === null}
                        >
                            Bring Forward
                        </button>
                        <button
                            className={`px-3 py-2 rounded text-sm font-medium ${
                                selectedShapeIndex === null
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-700 text-white hover:bg-gray-800"
                            }`}
                            onClick={sendToBack}
                            disabled={selectedShapeIndex === null}
                        >
                            Send Back
                        </button>
                        <button
                            className={`col-span-2 px-3 py-2 rounded text-sm font-medium ${
                                selectedShapeIndex === null
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                            onClick={deleteSelectedShape}
                            disabled={selectedShapeIndex === null}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Canvas Control - at bottom */}
                <div className="p-4 mt-auto border-t">
                    <button
                        className="w-full py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900 transition-colors"
                        onClick={clearCanvas}
                    >
                        Clear Canvas
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Header/Toolbar */}
                <div className="h-12 bg-white border-b flex items-center px-4">
                    <h1 className="text-lg font-semibold text-gray-800">Untitled Design</h1>
                    <div className="ml-auto flex gap-2">
                        <button className="px-4 py-1.5 rounded bg-gray-100 text-sm text-gray-700 hover:bg-gray-200">
                            Download
                        </button>
                        <button className="px-4 py-1.5 rounded bg-blue-600 text-sm text-white hover:bg-blue-700">
                            Share
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 p-6 bg-gray-100 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-md">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="border border-gray-200 rounded bg-white cursor-crosshair"
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                        />
                    </div>
                </div>

                {/* Status Bar */}
                <div className="h-8 bg-white border-t px-4 flex items-center text-sm text-gray-700">
                    {selectedShapeIndex !== null ? (
                        <span>
            Selected: <span className="font-medium">{shapes[selectedShapeIndex]?.type}</span>
                            {shapes[selectedShapeIndex]?.type !== "line" &&
                                <span> ({shapes[selectedShapeIndex]?.fill ? 'Filled' : 'Outline'})</span>
                            }
          </span>
                    ) : activeShapeType ? (
                        <span>
            Drawing: <span className="font-medium">{activeShapeType}</span>
                            {activeShapeType !== "line" && <span> ({fillShape ? 'Filled' : 'Outline'})</span>}
          </span>
                    ) : (
                        <span>Select a tool to begin drawing</span>
                    )}
                    <span className="ml-auto">800 × 600</span>
                </div>
            </div>
        </div>
    );
};

export default Canvas;