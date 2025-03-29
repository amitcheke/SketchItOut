import { useEffect, useCallback, useRef } from 'react';

const useAutosave = (shapes, layers, saveInterval = 30000) => {
    const autosaveKey = 'canvas-autosave';
    const lastSaveRef = useRef(Date.now());
    const saveTimeoutRef = useRef(null);

    const saveToLocalStorage = useCallback(() => {
        try {
            const canvasData = {
                shapes,
                layers,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(autosaveKey, JSON.stringify(canvasData));
            lastSaveRef.current = Date.now();
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [shapes, layers]);

    const loadFromLocalStorage = useCallback(() => {
        try {
            const savedData = localStorage.getItem(autosaveKey);
            if (savedData) {
                const canvasData = JSON.parse(savedData);
                return canvasData;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
        return null;
    }, []);

    const clearAutosave = useCallback(() => {
        try {
            localStorage.removeItem(autosaveKey);
            lastSaveRef.current = Date.now();
        } catch (error) {
            console.error('Error clearing autosave:', error);
        }
    }, []);

    const scheduleAutosave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveToLocalStorage();
            scheduleAutosave();
        }, saveInterval);
    }, [saveInterval, saveToLocalStorage]);

    useEffect(() => {
        scheduleAutosave();
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [scheduleAutosave]);

    // Save when the window is about to close
    useEffect(() => {
        const handleBeforeUnload = () => {
            saveToLocalStorage();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveToLocalStorage]);

    // Save when the page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveToLocalStorage();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [saveToLocalStorage]);

    const getLastSaveTime = useCallback(() => {
        return lastSaveRef.current;
    }, []);

    const hasUnsavedChanges = useCallback(() => {
        const lastSave = loadFromLocalStorage();
        if (!lastSave) return false;
        return lastSave.timestamp !== lastSaveRef.current;
    }, [loadFromLocalStorage]);

    return {
        saveToLocalStorage,
        loadFromLocalStorage,
        clearAutosave,
        getLastSaveTime,
        hasUnsavedChanges
    };
};

export default useAutosave; 