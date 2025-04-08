import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Student } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Download, Camera, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeScannerProps {
  onResult?: (student: Student) => void;
  onBack?: () => void;
}

export default function QRCodeScanner({ onResult, onBack }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [parsedStudent, setParsedStudent] = useState<Student | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [sampleData, setSampleData] = useState<Student | null>(null);
  const { toast } = useToast();
  
  // Fetch sample QR code data
  const handleShowSample = async () => {
    try {
      const response = await fetch('/sample-qr-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch sample data');
      }
      const data = await response.json();
      setSampleData(data);
      setShowSample(true);
      
      toast({
        title: "Sample QR Code Loaded",
        description: "You can now scan this QR code for testing",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample QR code data",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    // Cleanup function to stop scanner when component unmounts
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      
      setScanning(true);
      
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          setQrCodeData(decodedText);
          try {
            const student = JSON.parse(decodedText);
            setParsedStudent(student);
            if (onResult) {
              onResult(student);
            }
            stopScanner();
          } catch (err) {
            toast({
              title: "Invalid QR Code",
              description: "The scanned QR code doesn't contain valid student data.",
              variant: "destructive"
            });
          }
        },
        (errorMessage) => {
          // Error callback
          console.log(errorMessage);
        }
      );
    } catch (err) {
      console.error('Failed to start scanner:', err);
      toast({
        title: "Scanner Error",
        description: "Couldn't access camera. Please check permissions.",
        variant: "destructive"
      });
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
        // Just set scanning to false even if there's an error
        setScanning(false);
      }
    }
  };

  const handleStartScan = () => {
    setQrCodeData(null);
    setParsedStudent(null);
    startScanner();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Scan student ID QR codes or use our sample for testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
            <TabsTrigger value="sample">Sample QR</TabsTrigger>
            <TabsTrigger value="result" disabled={!parsedStudent}>Result</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner">
            <div className="flex flex-col items-center space-y-4">
              <div id="qr-reader" className="w-full h-64 border rounded" />
              
              {!scanning ? (
                <Button onClick={handleStartScan} className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button variant="secondary" onClick={stopScanner}>Stop Scanning</Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sample">
            <div className="flex flex-col items-center space-y-4">
              {!showSample ? (
                <div className="flex flex-col items-center space-y-4 p-4">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-sm text-muted-foreground">
                    Generate a sample QR code for testing the scanner
                  </p>
                  <Button onClick={handleShowSample} className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    Generate Sample QR Code
                  </Button>
                </div>
              ) : sampleData && (
                <div className="flex flex-col items-center space-y-4 p-4">
                  <div className="border p-3 rounded-md bg-white">
                    <QRCodeCanvas 
                      value={JSON.stringify(sampleData)} 
                      size={200}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"L"}
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Scan this QR code with the scanner to test the functionality.
                    <br />Contains sample student data.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSample(false)} 
                    className="flex items-center gap-1"
                  >
                    Hide Sample
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="result">
            {parsedStudent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Name:</div>
                  <div>{parsedStudent.name}</div>
                  
                  <div className="font-semibold">Roll Number:</div>
                  <div>{parsedStudent.rollNumber}</div>
                  
                  <div className="font-semibold">Class/Division:</div>
                  <div>{parsedStudent.classDivision}</div>
                  
                  <div className="font-semibold">Bus Route:</div>
                  <div>{parsedStudent.busRoute}</div>
                  
                  {parsedStudent.emergencyContact && (
                    <>
                      <div className="font-semibold">Emergency Contact:</div>
                      <div>{parsedStudent.emergencyContact}</div>
                    </>
                  )}
                  
                  {parsedStudent.bloodGroup && (
                    <>
                      <div className="font-semibold">Blood Group:</div>
                      <div>{parsedStudent.bloodGroup}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>Back</Button>
        )}
      </CardFooter>
    </Card>
  );
}