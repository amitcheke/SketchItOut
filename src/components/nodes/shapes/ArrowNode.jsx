"use client"

import { useState, useEffect } from 'react';

import { Handle, Position, useUpdateNodeInternals } from 'reactflow';

function ArrowNode({ data, selected, id }) {
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
            setLength(Math.max(60, startLength + deltaX));

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
                position: 'relative',
                width: `${length}px`,
                height: '20px',
                marginTop: '10px',
                marginBottom: '10px',
            }}
        >
            {/* Line part of the arrow */}
            <div
                style={{
                    position: 'absolute',
                    width: `${length - 10}px`,
                    height: '2px',
                    backgroundColor: data.backgroundColor || '#000',
                    top: '9px',
                }}
            />

            {/* Arrow head */}
            <div
                style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    width: '0',
                    height: '0',
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: `10px solid ${data.backgroundColor || '#000'}`,
                }}
            />

            {/* Handles for connections */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{ top: '10px' }}
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
                    className="absolute w-2 h-6 -mt-2 bg-blue-500 right-6 cursor-ew-resize"
                    style={{ top: '7px' }}
                    onMouseDown={handleResize}
                />
            )}
        </div>
    );
}

export default ArrowNode;