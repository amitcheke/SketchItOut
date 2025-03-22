"use client"
import React, { useState, useCallback } from 'react';

import { Handle, Position, useReactFlow } from 'reactflow';
import ResizeHandle from '../../designer/ResizeHandle';
import ArrowNode from "@/components/nodes/shapes/ArrowNode";

export const CircleNode = ({ id, data, selected }) => {
    const reactFlow = useReactFlow();
    const [resizing, setResizing] = useState(false);

    // Set default size if not provided
    const size = data.size || 100;

    const onResizeStart = useCallback((position, event) => {
        event.preventDefault();
        setResizing(true);

        const startSize = data.size;
        const startX = event.clientX;
        const startY = event.clientY;

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            // Calculate new size based on diagonal distance from cursor movement
            const delta = Math.max(Math.abs(dx), Math.abs(dy));
            const direction = (position.includes('top') || position.includes('left')) ? -1 : 1;
            const newSize = Math.max(30, startSize + (direction * delta));

            // Update the node data
            reactFlow.setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                size: newSize,
                            },
                        };
                    }
                    return node;
                })
            );
        };

        const onMouseUp = () => {
            setResizing(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [data.size, id, reactFlow]);

    const nodeStyle = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: data.backgroundColor || '#ffffff',
        border: selected ? '2px solid #1a192b' : '1px solid #777',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: resizing ? 'nwse-resize' : 'move',
    };

    return (
        <div style={nodeStyle}>
            <div style={{ padding: '8px', textAlign: 'center' }}>{data.label}</div>

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />

            {selected && (
                <>
                    <ResizeHandle position="top-left" onResize={onResizeStart} />
                    <ResizeHandle position="top-right" onResize={onResizeStart} />
                    <ResizeHandle position="bottom-left" onResize={onResizeStart} />
                    <ResizeHandle position="bottom-right" onResize={onResizeStart} />
                </>
            )}
        </div>
    );
};

export default CircleNode;