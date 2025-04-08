import React, { useRef, useEffect, useState } from 'react';

interface Panorama360BackgroundProps {
  imagePath: string;
  rotationSpeed?: number; // degrees per second
  autoRotate?: boolean;
  initialRotation?: number;
  children?: React.ReactNode;
}

const Panorama360Background: React.FC<Panorama360BackgroundProps> = ({
  imagePath,
  rotationSpeed = 5,
  autoRotate = true,
  initialRotation = 0,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  
  // Auto rotation effect
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + rotationSpeed / 60) % 360);
    }, 1000 / 60); // 60fps
    
    return () => clearInterval(rotationInterval);
  }, [autoRotate, rotationSpeed, isDragging]);
  
  // Handle mouse/touch events for manual rotation
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setStartRotation(rotation);
  };
  
  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startX;
    const sensitivity = 0.5;
    const newRotation = (startRotation - deltaX * sensitivity) % 360;
    
    setRotation(newRotation);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };
  
  const handleMouseUp = () => {
    handleDragEnd();
  };
  
  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    handleDragEnd();
  };
  
  // Mouse leave container - stop dragging
  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };
  
  useEffect(() => {
    // Add document-level event listeners for edge cases
    const handleDocumentMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };
    
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('touchend', handleDocumentMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('touchend', handleDocumentMouseUp);
    };
  }, [isDragging]);
  
  // Create the faces of the cube (we only need 4 sides for a 360 panorama)
  const faces = [
    { transform: 'rotateY(0deg) translateZ(50vw)', backgroundPosition: '0% 50%' },
    { transform: 'rotateY(90deg) translateZ(50vw)', backgroundPosition: '25% 50%' },
    { transform: 'rotateY(180deg) translateZ(50vw)', backgroundPosition: '50% 50%' },
    { transform: 'rotateY(270deg) translateZ(50vw)', backgroundPosition: '75% 50%' }
  ];
  
  return (
    <div 
      ref={containerRef}
      className="panorama-container h-full w-full overflow-hidden"
      style={{ 
        position: 'absolute',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="panorama-scene"
        style={{ 
          position: 'absolute',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.05s ease-out'
        }}
      >
        {faces.map((face, index) => (
          <div 
            key={index}
            className="panorama-face"
            style={{ 
              position: 'absolute',
              width: '100vw',
              height: '100%',
              backgroundImage: `url(${imagePath})`,
              backgroundSize: 'cover', // Use cover for better quality
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: face.transform,
              backfaceVisibility: 'hidden'
            }}
          />
        ))}
      </div>
      
      {/* Overlay content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default Panorama360Background;