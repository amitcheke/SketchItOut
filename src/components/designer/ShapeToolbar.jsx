// src/components/designer/ShapeToolbar.jsx
import React from 'react';
import { Icon } from "@iconify/react";

const ShapeToolbar = ({ onShapeSelect }) => {
    const shapes = [
        { type: 'rectangle', label: 'Rectangle', icon:<Icon icon="mdi-light:square" className="w-6 h-6 text-blue-500" />},
        { type: 'circle', label: 'Circle', icon: <Icon icon="mynaui:circle" className="w-6 h-6 text-blue-500" /> },
        { type: 'oval', label: 'Oval', icon: <Icon icon="hugeicons:oval" className="w-6 h-6 text-blue-500" /> },
        { type: 'line', label: 'Line', icon: <Icon icon="pepicons-pencil:line-x" className="w-6 h-6 text-blue-500" /> },
        { type: 'arrow', label: 'Arrow', icon: <Icon icon="material-symbols:line-end-arrow" className="w-6 h-6 text-blue-500" /> },
        { type: 'server', label: 'Server', icon: <Icon icon="mdi:server-network" className="w-6 h-6 text-blue-500" /> },
        { type: 'database', label: 'Database', icon: <Icon icon="mdi:database" className="w-6 h-6 text-green-500" /> },
        { type: 'client', label: 'Client', icon: '👤' },
    ];

    return (
        <div className="p-2 bg-white rounded shadow-md">
            <h3 className="text-sm font-bold mb-2">Shapes</h3>
            <div className="flex flex-wrap gap-2">
                {shapes.map((shape) => (
                    <button
                        key={shape.type}
                        onClick={() => onShapeSelect(shape.type)}
                        className="p-2 border rounded hover:bg-gray-100 flex flex-col items-center justify-center w-16 h-16"
                        title={shape.label}
                    >
                        <span className="text-2xl">{shape.icon}</span>
                        <span className="text-xs mt-1">{shape.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ShapeToolbar;