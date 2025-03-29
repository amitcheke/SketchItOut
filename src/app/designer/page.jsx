"use client"

import { useRef, useState, useEffect } from "react";
import styles from './page.module.css';

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
    // New states for undo/redo
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    // New states for text tool
    const [textInput, setTextInput] = useState("");
    const [isTextMode, setIsTextMode] = useState(false);
    const [textPosition, setTextPosition] = useState(null);
    // New state for eraser
    const [isEraser, setIsEraser] = useState(false);
    const [eraserSize, setEraserSize] = useState(20);

    // Available colors
    const colors = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#10b981", // green
        "#f59e0b", // amber
        "#8b5cf6", // purple
        "#000000"  // black
    ];

    // Save state to history
    const saveToHistory = (newShapes) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.stringify(newShapes));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Undo function
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setShapes(JSON.parse(history[newIndex]));
        }
    };

    // Redo function
    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setShapes(JSON.parse(history[newIndex]));
        }
    };

    // Save canvas to file
    const saveCanvas = () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'canvas-drawing.png';
        link.href = dataURL;
        link.click();
    };

    // Load canvas from file
    const loadCanvas = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    // Add text to canvas
    const addText = (x, y) => {
        if (textInput.trim()) {
            const newText = {
                type: "text",
                text: textInput,
                x: x,
                y: y,
                color: currentColor,
                fontSize: lineWidth * 10
            };
            setShapes([...shapes, newText]);
            setTextInput("");
            setIsTextMode(false);
            saveToHistory([...shapes, newText]);
        }
    };

    // Eraser function
    const erase = (ctx, x, y) => {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    // Touch event handlers
    const getTouchPos = (canvas, touchEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = getTouchPos(canvasRef.current, e);
        onMouseDown({ clientX: touch.x, clientY: touch.y });
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = getTouchPos(canvasRef.current, e);
        onMouseMove({ clientX: touch.x, clientY: touch.y });
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        onMouseUp(e);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        saveCanvas();
                        break;
                }
            } else if (e.key === 'Escape') {
                setActiveShapeType(null);
                setIsTextMode(false);
                setSelectedShapeIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history]);

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

        if (isEraser) {
            const ctx = canvasRef.current.getContext('2d');
            erase(ctx, offsetX, offsetY);
            return;
        }

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
        if (isEraser && e.buttons === 1) {
            const rect = canvasRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            const ctx = canvasRef.current.getContext('2d');
            erase(ctx, offsetX, offsetY);
            return;
        }

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
        <div className={styles.container}>
            {/* Primary Sidebar */}
            <div className={styles.primarySidebar}>
                <div className={styles.categoryButton}>
                    <div className={styles.categoryIcon}></div>
                    <span className={styles.categoryLabel}>Design</span>
                </div>
                <div className={styles.categoryButton}>
                    <div className={styles.categoryIcon}></div>
                    <span className={styles.categoryLabel}>Elements</span>
                </div>
                <div className={styles.categoryButton}>
                    <div className={styles.categoryIcon}></div>
                    <span className={styles.categoryLabel}>Text</span>
                </div>
                <div className={styles.categoryButton}>
                    <div className={styles.categoryIcon}></div>
                    <span className={styles.categoryLabel}>Uploads</span>
                </div>
                <div className={`${styles.categoryButton} ${styles.active}`}>
                    <div className={styles.categoryIcon}></div>
                    <span className={styles.categoryLabel}>Draw</span>
                </div>
                <div className={styles.categoryButton}>
                    <div className={styles.categoryIcon}></div>
                    <span className={styles.categoryLabel}>Apps</span>
                </div>
            </div>

            {/* Secondary Sidebar */}
            <div className={styles.secondarySidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.sidebarTitle}>Drawing Tools</h2>
                </div>

                {/* Shapes Section */}
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>Shapes</h3>
                    <div className={styles.toolsGrid}>
                        {["Rectangle", "Square", "Circle", "Oval", "Line"].map((type) => (
                            <button
                                key={type.toLowerCase()}
                                className={`${styles.toolButton} ${
                                    activeShapeType === type.toLowerCase() ? styles.active : ''
                                }`}
                                onClick={() => activateShapeMode(type.toLowerCase())}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style Controls */}
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>Style</h3>
                    <div className={styles.toolsGrid}>
                        <button
                            className={`${styles.toolButton} ${fillShape ? styles.active : ''}`}
                            onClick={toggleFillMode}
                        >
                            Filled
                        </button>
                        <button
                            className={`${styles.toolButton} ${!fillShape ? styles.active : ''}`}
                            onClick={toggleFillMode}
                        >
                            Outline
                        </button>
                    </div>
                    <div className="mt-4">
                        <span className={styles.sectionTitle}>Line Thickness</span>
                        <select
                            className={styles.input}
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
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>Colors</h3>
                    <div className={styles.colorPicker}>
                        {colors.map((color) => (
                            <button
                                key={color}
                                className={`${styles.colorButton} ${
                                    color === currentColor ? styles.active : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => changeShapeColor(color)}
                            />
                        ))}
                    </div>
                </div>

                {/* History Section */}
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>History</h3>
                    <div className={styles.toolsGrid}>
                        <button
                            className={`${styles.toolButton} ${historyIndex <= 0 ? styles.disabled : ''}`}
                            onClick={undo}
                            disabled={historyIndex <= 0}
                        >
                            Undo
                        </button>
                        <button
                            className={`${styles.toolButton} ${historyIndex >= history.length - 1 ? styles.disabled : ''}`}
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                        >
                            Redo
                        </button>
                    </div>
                </div>

                {/* Text Tool Section */}
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>Text Tool</h3>
                    <button
                        className={`${styles.toolButton} ${isTextMode ? styles.active : ''}`}
                        onClick={() => setIsTextMode(!isTextMode)}
                    >
                        {isTextMode ? "Cancel Text" : "Add Text"}
                    </button>
                    {isTextMode && (
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Enter text..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                        />
                    )}
                </div>

                {/* Eraser Tool Section */}
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>Eraser</h3>
                    <button
                        className={`${styles.toolButton} ${isEraser ? styles.active : ''}`}
                        onClick={() => setIsEraser(!isEraser)}
                    >
                        {isEraser ? "Disable Eraser" : "Enable Eraser"}
                    </button>
                    {isEraser && (
                        <div className="mt-4">
                            <span className={styles.sectionTitle}>Eraser Size</span>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={eraserSize}
                                onChange={(e) => setEraserSize(parseInt(e.target.value))}
                                className={styles.rangeInput}
                            />
                        </div>
                    )}
                </div>

                {/* File Operations */}
                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>File</h3>
                    <button className={`${styles.fileButton} ${styles.saveButton}`} onClick={saveCanvas}>
                        Save Canvas
                    </button>
                    <label className="block mt-2">
                        <span className={`${styles.fileButton} ${styles.loadButton}`}>
                            Load Canvas
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={loadCanvas}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Clear Canvas */}
                <div className={styles.sidebarSection}>
                    <button
                        className={`${styles.toolButton} ${styles.clearButton}`}
                        onClick={clearCanvas}
                    >
                        Clear Canvas
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className={styles.mainArea}>
                <div className={styles.canvasHeader}>
                    <h1 className={styles.canvasTitle}>Untitled Design</h1>
                    <div className={styles.canvasActions}>
                        <button className={styles.toolButton}>Download</button>
                        <button className={`${styles.toolButton} ${styles.active}`}>Share</button>
                    </div>
                </div>

                <div className={styles.canvasContainer}>
                    <div className={styles.canvasWrapper}>
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className={styles.canvas}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onClick={(e) => {
                                if (isTextMode) {
                                    const rect = canvasRef.current.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    addText(x, y);
                                }
                            }}
                        />
                    </div>
                </div>

                <div className={styles.statusBar}>
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
                    ) : isTextMode ? (
                        <span>Click anywhere to add text</span>
                    ) : isEraser ? (
                        <span>Eraser Mode</span>
                    ) : (
                        <span>Select a tool to begin drawing</span>
                    )}
                    <span>800 × 600</span>
                </div>
            </div>
        </div>
    );
};

export default Canvas;