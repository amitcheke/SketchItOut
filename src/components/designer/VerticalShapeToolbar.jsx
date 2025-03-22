// src/components/designer/VerticalShapeToolbar.jsx
import React, { useState } from 'react';
import { Icon } from "@iconify/react";

const VerticalShapeToolbar = ({ onShapeSelect }) => {
    const [selectedTool, setSelectedTool] = useState(null);

    const shapes = [
        { type: 'select', label: 'Select', icon: <Icon icon="mdi:cursor-default" className="w-5 h-5" /> },
        { type: 'rectangle', label: 'Rectangle', icon: <Icon icon="mdi-light:square" className="w-5 h-5" /> },
        { type: 'circle', label: 'Circle', icon: <Icon icon="mynaui:circle" className="w-5 h-5" /> },
        { type: 'arrow', label: 'Arrow', icon: <Icon icon="material-symbols:line-end-arrow" className="w-5 h-5" /> },
        { type: 'line', label: 'Line', icon: <Icon icon="pepicons-pencil:line-x" className="w-5 h-5" /> },
        { type: 'oval', label: 'Oval', icon: <Icon icon="hugeicons:oval" className="w-5 h-5" /> },
        { type: 'text', label: 'Text', icon: <Icon icon="mdi:format-text" className="w-5 h-5" /> },
    ];

    const handleToolSelect = (type) => {
        setSelectedTool(type);
        if (onShapeSelect) {
            onShapeSelect(type);
        }
    };

    return (
        <div className="fixed left-3 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-md flex flex-col items-center p-1 z-10">
            {shapes.map((shape) => (
                <div
                    key={shape.type}
                    onClick={() => handleToolSelect(shape.type)}
                    className={`p-3 hover:bg-gray-100 rounded-md mb-1 relative cursor-pointer ${
                        selectedTool === shape.type ? 'bg-gray-200' : ''
                    }`}
                    title={shape.label}
                >
                    <div className="text-gray-700">
                        {shape.icon}
                    </div>

                    {/* Selected indicator */}
                    {selectedTool === shape.type && (
                        <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-full"></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VerticalShapeToolbar;