import { useState, useCallback, useRef } from 'react';

export const useLongPress = (callback: (e: any) => void, threshold = 500) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const onPointerDown = useCallback((e: any) => {
        timerRef.current = setTimeout(() => {
            callback(e);
        }, threshold);
    }, [callback, threshold]);

    const onPointerUp = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return {
        onPointerDown,
        onPointerUp
    };
};
