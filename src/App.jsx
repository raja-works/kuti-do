import React, { useState, useRef } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import CreditsModal from './components/CreditsModal';
import { FaImage, FaFilePdf, FaDownload, FaUpload, FaInfoCircle, FaPalette, FaBars, FaCaretLeft, FaChevronLeft } from 'react-icons/fa';
import './App.css';
import { processImageToOutline } from './utils/imageProcessor';
import { processPdfToImage } from './utils/pdfProcessor';

function App() {
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(10);
  const [imageSrc, setImageSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setImageSrc(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      try {
        const dataUrl = await processPdfToImage(file);
        setImageSrc(dataUrl);
      } catch (err) {
        alert("Failed to load PDF. Please try another file.");
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleOutlineUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const outlineUrl = await processImageToOutline(evt.target.result);
          setImageSrc(outlineUrl);
        } catch (err) {
          alert("Failed to create outline. Ensure OpenCV is loaded.");
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      canvasRef.current.saveImage();
    }
  };

  return (
    <div className="app-container">
      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Processing...
        </div>
      )}
      <header className="app-header">
        <div className="header-brand">
          <img src="/pwa-192x192.png" alt="Kuti Do Logo" className="app-logo" />
          <h1>Kuti Do..</h1>
          <button className="icon-btn" onClick={() => setIsCreditsOpen(true)} title="Credits" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginLeft: '10px' }}>
            <FaInfoCircle size={20} />
          </button>
        </div>

        <div className="header-right-group">
          <div className="header-actions">
            <label className="action-btn" title="Load Image Background">
              <FaImage />
              <span>Load Image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
            <label className="action-btn secondary" title="Load PDF Page">
              <FaFilePdf />
              <span>Load PDF</span>
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} hidden />
            </label>
            <label className="action-btn highlight" title="Photo to Coloring Page">
              <FaUpload />
              <span>Photo to Outline</span>
              <input type="file" accept="image/*" onChange={handleOutlineUpload} hidden />
            </label>
            <label className="action-btn primary" onClick={handleSave}>
              <FaDownload />
              <span>Save</span>
            </label>
            <button
              className="mobile-menu-btn"
              onClick={() => setIsToolbarOpen(!isToolbarOpen)}
              title="Open Color Palette"
            >
              <FaPalette size={24} color="#FF6B6B" />
              <FaChevronLeft size={12} color="#FF6B6B" />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="canvas-wrapper">
          <CanvasEditor
            ref={canvasRef}
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={brushSize}
            imageSrc={imageSrc}
            width={800}
            height={600}
          />
        </div>
        <Toolbar
          isOpen={isToolbarOpen}
          onClose={() => setIsToolbarOpen(false)}
          activeTool={activeTool}
          setTool={setActiveTool}
          activeColor={activeColor}
          setColor={setActiveColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />
      </main>
    </div>
  )
}
export default App;
