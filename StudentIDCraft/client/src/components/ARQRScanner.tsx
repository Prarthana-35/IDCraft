import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student } from '@/types';
import { QrCode, Camera, Loader2, ArrowLeft, Box } from 'lucide-react';

interface ARQRScannerProps {
  onResult?: (student: Student) => void;
  onBack?: () => void;
}

export default function ARQRScanner({ onResult, onBack }: ARQRScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [detectedStudent, setDetectedStudent] = useState<Student | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanTab, setScanTab] = useState<'scanner' | 'overlay' | 'vr'>('scanner');
  const [vrMode, setVrMode] = useState(false);
  
  const toggleCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };
  
  const switchToVRMode = () => {
    if (detectedStudent) {
      setVrMode(true);
      setScanTab('vr');
    } else {
      setFlashMessage('Scan a QR code first to view in VR');
      setTimeout(() => setFlashMessage(null), 3000);
    }
  };

  // Process the QR code from the video stream
  const scanQRCode = useCallback(() => {
    if (!scanning || !webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Match canvas dimensions to video
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Draw video frame to canvas for processing
    ctx.drawImage(video, 0, 0, width, height);
    
    // Get image data for QR code scanning
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, width, height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      try {
        // Parse QR data as student
        const studentData = JSON.parse(code.data);
        
        // Verify it has expected student properties
        if (studentData.id && studentData.name && studentData.rollNumber) {
          setDetectedStudent(studentData);
          setScanning(false);
          
          // Show success message
          setFlashMessage('QR Code detected!');
          setTimeout(() => setFlashMessage(null), 2000);
          
          // Draw AR overlay
          if (overlayCanvas && scanTab === 'overlay') {
            drawStudentOverlay(overlayCanvas, studentData, { x: code.location.topLeftCorner.x, y: code.location.topLeftCorner.y });
          }
          
          if (onResult) {
            onResult(studentData);
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing QR code data:', error);
      }
    }
    
    // Continue scanning if no valid QR code was found
    requestAnimationFrame(scanQRCode);
  }, [scanning, webcamRef, canvasRef, overlayCanvasRef, scanTab, onResult]);

  // Draw student info as an overlay
  const drawStudentOverlay = (
    canvas: HTMLCanvasElement, 
    student: Student, 
    position: { x: number, y: number }
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background for the info card
    const cardX = position.x - 50;
    const cardY = position.y - 180;
    const cardWidth = 300;
    const cardHeight = 160;
    
    // Draw card background with rounded corners
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 8);
    ctx.fill();
    
    // Add a border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw student info
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(student.name, cardX + 15, cardY + 30);
    
    ctx.font = '14px sans-serif';
    ctx.fillText(`ID: ${student.rollNumber}`, cardX + 15, cardY + 60);
    ctx.fillText(`Class: ${student.classDivision}`, cardX + 15, cardY + 85);
    ctx.fillText(`Bus Route: ${student.busRoute}`, cardX + 15, cardY + 110);
    
    if (student.allergies && student.allergies.length > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`Allergies: ${Array.isArray(student.allergies) ? student.allergies.join(', ') : student.allergies}`, cardX + 15, cardY + 135);
    }
    
    // Draw connecting line from QR to info
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(cardX + cardWidth / 2, cardY + cardHeight);
    ctx.stroke();
  };

  // Start scanning when component mounts or tab changes
  useEffect(() => {
    if (scanTab === 'scanner' || scanTab === 'overlay') {
      // Scan for QR codes in both scanner and overlay modes
      setScanning(true);
      requestAnimationFrame(scanQRCode);
    } else if (scanTab === 'vr') {
      // In VR mode, don't scan
      setScanning(false);
    }
    
    return () => {
      setScanning(false);
    };
  }, [scanTab, scanQRCode]);

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative">
        <Tabs 
          value={scanTab} 
          onValueChange={(value) => setScanTab(value as 'scanner' | 'overlay' | 'vr')} 
          className="w-full"
        >
          <div className="px-4 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </h3>
              {onBack && (
                <Button variant="outline" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            
            <TabsList className="w-full">
              <TabsTrigger value="scanner">Basic Scanner</TabsTrigger>
              <TabsTrigger value="overlay">AR Overlay</TabsTrigger>
              <TabsTrigger value="vr" disabled={!detectedStudent}>VR View</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="scanner" className="m-0">
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Position the QR code within the camera frame to scan student information.
              </p>
            </div>
            
            <div className="relative bg-black aspect-video overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
                className="w-full h-full object-cover"
              />
              
              {/* Hidden canvas for processing */}
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-indigo-500/70 w-64 h-64 rounded-lg elevation-1 bg-white/10 backdrop-blur-sm shadow-lg">
                  {scanning && (
                    <>
                      <div className="absolute inset-0 ar-scan-animation"></div>
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-indigo-500 rounded-br-lg"></div>
                    </>
                  )}
                </div>
                <div className="absolute -bottom-16 text-white bg-indigo-500/70 px-3 py-1 rounded-lg backdrop-blur-sm animate-pulse-custom">
                  <p className="text-sm font-medium">Scanning for QR code</p>
                </div>
              </div>
              
              {/* Flash message */}
              {flashMessage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-md animate-fade-up">
                    {flashMessage}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleCamera}
              >
                <Camera className="h-4 w-4 mr-1" />
                Switch Camera
              </Button>
              
              <div className="flex gap-2">
                {detectedStudent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchToVRMode}
                  >
                    <div className="flex items-center">
                      <span className="h-4 w-4 mr-1">🥽</span> View in VR
                    </div>
                  </Button>
                )}
                
                {detectedStudent && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      // Call onResult to pass the student to the parent
                      if (onResult) {
                        onResult(detectedStudent);
                      }
                      
                      setFlashMessage('Saving card to gallery...');
                      setTimeout(() => {
                        // Go back to main view which will redirect to 3D gallery
                        if (onBack) {
                          onBack();
                        }
                      }, 1000);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Box className="h-4 w-4" />
                      Save to 3D Gallery
                    </div>
                  </Button>
                )}
                
                {scanning ? (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Scanning...
                  </Badge>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setScanning(true);
                      setDetectedStudent(null);
                      requestAnimationFrame(scanQRCode);
                    }}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    Start Scanning
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="overlay" className="m-0">
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Position QR code in camera frame to scan. AR overlay will display student information directly on the video feed.
              </p>
            </div>
            
            <div className="relative bg-black aspect-video overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
                className="w-full h-full object-cover"
              />
              
              {/* Canvas for overlay drawing */}
              <canvas 
                ref={overlayCanvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              
              {/* Processing canvas (hidden) */}
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
              />
              
              {/* Instruction overlay if no student detected */}
              {!detectedStudent && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-indigo-900/70 backdrop-blur-sm text-white px-8 py-6 rounded-xl text-center elevation-3 animate-pulse-custom">
                    <div className="relative">
                      <QrCode className="h-16 w-16 mx-auto mb-3 text-indigo-100 animate-floating" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin-slow"></div>
                      </div>
                    </div>
                    <p className="text-lg font-medium animate-slideInLeft">Point camera at a student ID card QR code</p>
                    <p className="text-sm text-indigo-200 mt-2 animate-slideInRight">
                      The AR overlay will appear when a card is detected
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="w-14 h-1 bg-indigo-400 rounded-full animate-pulse-custom"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AR scan animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="ar-scan-animation"></div>
              </div>
            </div>
            
            <div className="p-4 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleCamera}
              >
                <Camera className="h-4 w-4 mr-1" />
                Switch Camera
              </Button>
              
              <div className="flex gap-2">
                {detectedStudent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchToVRMode}
                  >
                    <div className="flex items-center">
                      <span className="h-4 w-4 mr-1">🥽</span> View in VR
                    </div>
                  </Button>
                )}
                
                {detectedStudent && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      // Call onResult to pass the student to the parent
                      if (onResult) {
                        onResult(detectedStudent);
                      }
                      
                      setFlashMessage('Saving card to gallery...');
                      setTimeout(() => {
                        // Go back to main view which will redirect to 3D gallery
                        if (onBack) {
                          onBack();
                        }
                      }, 1000);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Box className="h-4 w-4" />
                      Save to 3D Gallery
                    </div>
                  </Button>
                )}
                
                {detectedStudent && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDetectedStudent(null)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="vr" className="m-0">
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                VR view displays the student card in a virtual 3D environment.
              </p>
            </div>
            
            {detectedStudent ? (
              <div className="bg-black aspect-video relative overflow-hidden">
                <div className="h-full w-full">
                  <Canvas
                    shadows
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    className="w-full h-full"
                  >
                    <ambientLight intensity={0.4} />
                    <spotLight
                      position={[0, 5, 5]}
                      angle={0.3}
                      penumbra={1}
                      intensity={1}
                      castShadow
                    />
                    
                    {/* Floor plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                      <planeGeometry args={[20, 20]} />
                      <meshStandardMaterial color="#f3f4f6" />
                    </mesh>
                    
                    {/* 3D Student Card */}
                    <group position={[0, 0, 0]}>
                      {/* Card base */}
                      <mesh castShadow receiveShadow position={[0, 0, 0]}>
                        <boxGeometry args={[3.5, 5, 0.1]} />
                        <meshStandardMaterial color="#3b82f6" />
                      </mesh>
                      
                      {/* Card photo area */}
                      <mesh position={[0, 1, 0.06]}>
                        <planeGeometry args={[2.5, 2.5]} />
                        <meshBasicMaterial color="white" />
                      </mesh>
                      
                      {/* Student name */}
                      <Text 
                        position={[0, -1, 0.06]} 
                        fontSize={0.3}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        maxWidth={3}
                      >
                        {detectedStudent.name}
                      </Text>
                      
                      {/* ID number */}
                      <Text 
                        position={[0, -1.5, 0.06]} 
                        fontSize={0.2}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                      >
                        {detectedStudent.rollNumber}
                      </Text>
                      
                      {/* Class */}
                      <Text 
                        position={[0, -2, 0.06]} 
                        fontSize={0.2}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                      >
                        {detectedStudent.classDivision}
                      </Text>
                    </group>
                    
                    <OrbitControls enableZoom={true} />
                  </Canvas>
                </div>
                
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 py-1 mx-auto inline-block px-4 rounded-full">
                    Drag to rotate • Scroll to zoom
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">No Student Detected</h3>
                  <p className="text-gray-500 mb-4">
                    You need to scan a student QR code first before viewing in VR mode.
                  </p>
                  <Button onClick={() => setScanTab('scanner')}>
                    Go to Scanner
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-4 flex justify-between items-center">
              <div className="flex gap-2">
                {detectedStudent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScanTab('overlay')}
                  >
                    View in AR
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {detectedStudent && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      // Create a SavedCard object with default template
                      const card = {
                        id: '',
                        student: detectedStudent,
                        template: 0,
                        createdAt: new Date().toISOString(),
                        uniqueId: detectedStudent.uniqueId || detectedStudent.id
                      };
                      
                      // Call onResult to pass the student to the parent
                      if (onResult) {
                        onResult(detectedStudent);
                      }
                      
                      setFlashMessage('Saving card to gallery...');
                      setTimeout(() => {
                        // Go back to main view which will redirect to 3D gallery
                        if (onBack) {
                          onBack();
                        }
                      }, 1000);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Box className="h-4 w-4" />
                      Save to 3D Gallery
                    </div>
                  </Button>
                )}
                
                {detectedStudent && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={onBack}
                  >
                    Go to 3D Gallery
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}