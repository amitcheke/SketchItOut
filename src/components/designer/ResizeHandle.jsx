import React from 'react';

const ResizeHandle = ({ position, onResize }) => {
    const handleStyle = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        background: '#1a192b',
        borderRadius: '50%',
        cursor: 'nwse-resize', // default cursor
        zIndex: 1,
        ...getHandlePosition(position),
    };

    // Handle positioning logic
    function getHandlePosition(pos) {
        switch(pos) {
            case 'top-left':
                return { top: '-4px', left: '-4px', cursor: 'nwse-resize' };
            case 'top-right':
                return { top: '-4px', right: '-4px', cursor: 'nesw-resize' };
            case 'bottom-left':
                return { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' };
            case 'bottom-right':
                return { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' };
            default:
                return {};
        }
    }

    const handleMouseDown = (event) => {
        event.stopPropagation();
        onResize(position, event);
    };

    return <div style={handleStyle} onMouseDown={handleMouseDown} />;
};

export default ResizeHandle;