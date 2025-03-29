import { useState, useCallback } from 'react';

const useLayers = (shapes, updateShape) => {
    const [layers, setLayers] = useState([]);
    const [activeLayer, setActiveLayer] = useState(null);

    const createLayer = useCallback((name = 'New Layer') => {
        const newLayer = {
            id: Date.now(),
            name,
            visible: true,
            locked: false,
            opacity: 1
        };

        setLayers(prev => [...prev, newLayer]);
        return newLayer;
    }, []);

    const deleteLayer = useCallback((layerId) => {
        setLayers(prev => prev.filter(layer => layer.id !== layerId));
        // Move shapes from deleted layer to the default layer
        const defaultLayer = layers.find(layer => layer.name === 'Default') || layers[0];
        if (defaultLayer) {
            shapes.forEach((shape, index) => {
                if (shape.layerId === layerId) {
                    updateShape(index, { ...shape, layerId: defaultLayer.id });
                }
            });
        }
    }, [layers, shapes, updateShape]);

    const renameLayer = useCallback((layerId, newName) => {
        setLayers(prev =>
            prev.map(layer =>
                layer.id === layerId ? { ...layer, name: newName } : layer
            )
        );
    }, []);

    const toggleLayerVisibility = useCallback((layerId) => {
        setLayers(prev =>
            prev.map(layer =>
                layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
            )
        );
    }, []);

    const toggleLayerLock = useCallback((layerId) => {
        setLayers(prev =>
            prev.map(layer =>
                layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
            )
        );
    }, []);

    const updateLayerOpacity = useCallback((layerId, opacity) => {
        setLayers(prev =>
            prev.map(layer =>
                layer.id === layerId ? { ...layer, opacity } : layer
            )
        );
    }, []);

    const moveLayer = useCallback((layerId, direction) => {
        setLayers(prev => {
            const index = prev.findIndex(layer => layer.id === layerId);
            if (index === -1) return prev;

            const newLayers = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= newLayers.length) return prev;

            // Swap layers
            [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];

            // Update z-index of shapes in affected layers
            shapes.forEach((shape, shapeIndex) => {
                if (shape.layerId === layerId) {
                    updateShape(shapeIndex, { ...shape, zIndex: newIndex });
                } else if (shape.layerId === newLayers[newIndex].id) {
                    updateShape(shapeIndex, { ...shape, zIndex: index });
                }
            });

            return newLayers;
        });
    }, [shapes, updateShape]);

    const setActiveLayer = useCallback((layerId) => {
        setActiveLayer(layerId);
    }, []);

    const getLayerShapes = useCallback((layerId) => {
        return shapes.filter(shape => shape.layerId === layerId);
    }, [shapes]);

    const initializeDefaultLayer = useCallback(() => {
        if (layers.length === 0) {
            createLayer('Default');
        }
    }, [layers.length, createLayer]);

    return {
        layers,
        activeLayer,
        createLayer,
        deleteLayer,
        renameLayer,
        toggleLayerVisibility,
        toggleLayerLock,
        updateLayerOpacity,
        moveLayer,
        setActiveLayer,
        getLayerShapes,
        initializeDefaultLayer
    };
};

export default useLayers; 