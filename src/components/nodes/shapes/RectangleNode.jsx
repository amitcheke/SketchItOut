import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

function RectangleNode({ data, selected, id }) {
    const [size, setSize] = useState({ width: data.width || 150, height: data.height || 75 });
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        // Update node internals when size changes to reposition handles
        updateNodeInternals(id);
    }, [size, updateNodeInternals, id]);

    const handleResize = (e, direction) => {
        e.stopPropagation();

        // Get initial mouse position and size
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        // Handle mousemove for resizing
        const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();

            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (direction === 'right') {
                setSize({
                    width: Math.max(50, startWidth + deltaX),
                    height: size.height,
                });
            } else if (direction === 'bottom') {
                setSize({
                    width: size.width,
                    height: Math.max(50, startHeight + deltaY),
                });
            } else if (direction === 'corner') {
                setSize({
                    width: Math.max(50, startWidth + deltaX),
                    height: Math.max(50, startHeight + deltaY),
                });
            }

            // Update node's data to store the new size
            data.width = size.width;
            data.height = size.height;
        };

        // Handle mouseup to stop resizing
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div
            style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                backgroundColor: data.backgroundColor || '#fff',
                border: `2px solid ${selected ? '#1a192b' : '#ddd'}`,
                borderRadius: '3px',
                position: 'relative',
            }}
        >
            {data.label && (
                <div className="text-center p-2 overflow-hidden text-ellipsis">
                    {data.label}
                </div>
            )}

            {/* Handles for connections */}
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Right} id="right" />
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Left} id="left" />
            <Handle type="target" position={Position.Top} id="top-target" />
            <Handle type="target" position={Position.Right} id="right-target" />
            <Handle type="target" position={Position.Bottom} id="bottom-target" />
            <Handle type="target" position={Position.Left} id="left-target" />

            {/* Resize handles, only visible when selected */}
            {selected && (
                <>
                    <div
                        className="absolute w-2 h-2 bg-blue-500 right-0 top-1/2 -mt-1 cursor-ew-resize"
                        onMouseDown={(e) => handleResize(e, 'right')}
                    />
                    <div
                        className="absolute w-2 h-2 bg-blue-500 bottom-0 left-1/2 -ml-1 cursor-ns-resize"
                        onMouseDown={(e) => handleResize(e, 'bottom')}
                    />
                    <div
                        className="absolute w-2 h-2 bg-blue-500 bottom-0 right-0 cursor-nwse-resize"
                        onMouseDown={(e) => handleResize(e, 'corner')}
                    />
                </>
            )}
        </div>
    );
}

export default RectangleNode;