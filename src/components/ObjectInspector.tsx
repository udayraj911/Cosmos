import React from 'react';

export const ObjectInspector = ({ object, onClose }: { object: any, onClose: () => void }) => {
    if (!object) return null;
    return (
        <div className="absolute right-4 top-4 z-50 bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-600 text-white w-64">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{object.name || 'Celestial Object'}</h3>
                <button onClick={onClose}>✕</button>
            </div>
            <div className="text-sm space-y-1">
                <p>Type: <span className="capitalize">{object.type}</span></p>
                <p>Mass: {object.mass || 50}%</p>
                <p>Gravity: {object.gravity || 50}%</p>
                <p>Position: ({Math.round(object.x)}, {Math.round(object.y)})</p>
            </div>
        </div>
    );
};
