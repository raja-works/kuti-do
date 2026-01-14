
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { FaPaintBrush, FaFillDrip, FaEraser } from 'react-icons/fa';
import './Toolbar.css';

const Toolbar = ({ activeTool, setTool, activeColor, setColor, brushSize, setBrushSize, isOpen, onClose }) => {
    const presetColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF', '#FFA500', '#800080'];

    return (
        <>
            {isOpen && <div className="toolbar-overlay" onClick={onClose}></div>}
            <div className={`toolbar ${isOpen ? 'open' : ''}`}>
                <div className="toolbar-header">
                    <h2 className="toolbar-title">Tools</h2>
                    <button className="close-toolbar-btn" onClick={onClose}>×</button>
                </div>

                <div className="tools-grid">
                    <button
                        className={`tool-btn ${activeTool === 'brush' && activeColor !== '#FFFFFF' ? 'active' : ''}`}
                        onClick={() => { setTool('brush'); if (activeColor === '#FFFFFF') setColor('#000000'); }}
                        title="Brush"
                    >
                        <FaPaintBrush />
                    </button>
                    <button
                        className={`tool-btn ${activeTool === 'bucket' ? 'active' : ''}`}
                        onClick={() => setTool('bucket')}
                        title="Fill"
                    >
                        <FaFillDrip />
                    </button>
                    <button
                        className={`tool-btn ${activeTool === 'brush' && activeColor === '#FFFFFF' ? 'active' : ''}`}
                        onClick={() => { setTool('brush'); setColor('#FFFFFF'); }}
                        title="Eraser"
                    >
                        <FaEraser />
                    </button>
                </div>

                <div className="control-group">
                    <label>Size: {brushSize}px</label>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="size-slider"
                    />
                </div>

                <div className="control-group">
                    <label>Color</label>
                    <div className="color-picker-wrapper">
                        <HexColorPicker color={activeColor} onChange={setColor} />
                    </div>
                    <div className="preset-colors">
                        {presetColors.map(c => (
                            <button
                                key={c}
                                className="color-swatch"
                                style={{ backgroundColor: c, border: activeColor === c ? '2px solid #333' : '1px solid #ccc' }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Toolbar;
