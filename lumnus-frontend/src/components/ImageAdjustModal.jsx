import { useState, useRef, useEffect } from 'react';
import './ImageAdjustModal.css';

export default function ImageAdjustModal({ imageFile, onClose, onApply }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas(img, 1, 0);
    };

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const drawCanvas = (img, currentZoom, currentRotation) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Center point
    ctx.translate(size / 2, size / 2);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.scale(currentZoom, currentZoom);

    // Draw image centered
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;

    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  };

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    if (imageRef.current) {
      drawCanvas(imageRef.current, newZoom, rotation);
    }
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (imageRef.current) {
      drawCanvas(imageRef.current, zoom, newRotation);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    if (imageRef.current) {
      drawCanvas(imageRef.current, 1, 0);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onApply(blob);
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        <div className="crop-modal-header">
          <h3>Adjust Profile Photo</h3>
          <button className="crop-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="crop-modal-body">
          <div className="crop-canvas-wrapper">
            <canvas ref={canvasRef} className="crop-canvas" />
            <div className="crop-overlay-circle" />
          </div>

          <div className="crop-controls">
            <div className="crop-control-row">
              <label>Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={handleZoomChange}
                className="crop-range-slider"
              />
              <span>{Math.round(zoom * 100)}%</span>
            </div>

            <div className="crop-buttons-row">
              <button type="button" className="crop-tool-btn" onClick={handleRotate}>
                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rotate 90°
              </button>
              <button type="button" className="crop-tool-btn secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button type="button" className="crop-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="crop-btn apply" onClick={handleSave}>
            Apply & Upload
          </button>
        </div>
      </div>
    </div>
  );
}
