"use client"
import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

function LineNode({ data, selected, id }) {
    const [length, setLength] = useState(data.length || 150);
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        updateNodeInternals(id);
    }, [length, updateNodeInternals, id]);

    const handleResize = (e) => {
        e.stopPropagation();

        const startX = e.clientX;
        const startLength = length;

        const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();

            const deltaX = moveEvent.clientX - startX;
            setLength(Math.max(50, startLength + deltaX));

            // Update node's data
            data.length = length;
        };

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
                width: `${length}px`,
                height: '2px',
                backgroundColor: data.backgroundColor || '#000',
                position: 'relative',
                marginTop: '10px',
                marginBottom: '10px',
            }}
        >
            {/* Handles for connections */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{ top: '0px' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{ top: '0px' }}
            />

            {/* Label if needed */}
            {data.label && (
                <div
                    className="absolute text-xs -mt-4 text-center w-full"
                    style={{ top: '-10px' }}
                >
                    {data.label}
                </div>
            )}

            {/* Resize handle */}
            {selected && (
                <div
                    className="absolute w-2 h-6 -mt-2 bg-blue-500 right-0 cursor-ew-resize"
                    onMouseDown={handleResize}
                />
            )}
        </div>
    );
}

export default LineNode;