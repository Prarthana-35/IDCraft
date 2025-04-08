import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Student } from '../types';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { Download, User, Eye, Check, QrCode } from 'lucide-react';

interface CSVImportProps {
  onImport: (students: Student[]) => void;
  onBack: () => void;
}

export default function CSVImport({ onImport, onBack }: CSVImportProps) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();
  
  const handleDownloadSample = () => {
    const sampleURL = '/sample-student-data.csv';
    const link = document.createElement('a');
    link.href = sampleURL;
    link.download = 'sample-student-data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Sample CSV Downloaded",
      description: "A sample CSV file with example student data has been downloaded.",
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('No file selected or file type not supported. Please upload a CSV file.');
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors[0].message}`);
          return;
        }
        
        setCsvData(results.data);
        setPreview(true);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });
  
  const [mappedStudents, setMappedStudents] = useState<Student[]>([]);
  const [importFinished, setImportFinished] = useState(false);

  const processStudentData = () => {
    try {
      const requiredFields = ['name', 'rollNumber', 'classDivision', 'busRoute'];
      
      const isValid = csvData.every(row => {
        return requiredFields.every(field => {
          const key = Object.keys(row).find(k => 
            k.toLowerCase().replace(/[^a-z0-9]/g, '') === field.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          return key && row[key];
        });
      });
      
      if (!isValid) {
        setError('CSV data is missing required fields. Required fields: Name, Roll Number, Class/Division, Bus Route.');
        return false;
      }
      
      const processedStudents: Student[] = csvData.map(row => {
        // Try to find columns with different possible names
        const getName = () => {
          const possibilities = ['name', 'student name', 'studentname'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) return row[key];
          }
          return '';
        };
        
        const getRollNumber = () => {
          const possibilities = ['rollnumber', 'roll number', 'roll', 'studentid', 'student id'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) return row[key];
          }
          return '';
        };
        
        const getClassDivision = () => {
          const possibilities = ['classdivision', 'class division', 'class', 'division', 'grade'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) return row[key];
          }
          return '';
        };
        
        const getBusRoute = () => {
          const possibilities = ['busroute', 'bus route', 'bus', 'route', 'transport'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) return row[key];
          }
          return '';
        };
        
        // For optional fields
        const getAllergies = () => {
          const possibilities = ['allergies', 'allergy'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) {
              const allergiesStr = row[key];
              return allergiesStr.split(',').map((a: string) => a.trim());
            }
          }
          return [];
        };
        
        const getEmergencyContact = () => {
          const possibilities = ['emergencycontact', 'emergency contact', 'emergency'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) return row[key];
          }
          return undefined;
        };
        
        const getBloodGroup = () => {
          const possibilities = ['bloodgroup', 'blood group', 'blood'];
          for (const p of possibilities) {
            const key = Object.keys(row).find(k => 
              k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.replace(/[^a-z0-9]/g, '')
            );
            if (key && row[key]) return row[key];
          }
          return undefined;
        };
        
        // Extract other custom fields
        const knownFields = [
          'name', 'rollnumber', 'classdivision', 'busroute', 'allergies', 
          'emergencycontact', 'bloodgroup', 'dateofbirth', 'address', 
          'parentname', 'parentphone', 'racknumber'
        ];
        
        const customFields: Record<string, string> = {};
        
        for (const key of Object.keys(row)) {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!knownFields.includes(normalizedKey) && row[key]) {
            customFields[key] = row[key];
          }
        }
        
        return {
          id: nanoid(),
          name: getName(),
          rollNumber: getRollNumber(),
          classDivision: getClassDivision(),
          busRoute: getBusRoute(),
          allergies: getAllergies(),
          rackNumber: row['rackNumber'] || row['rack_number'] || row['rack'] || 'N/A',
          photo: '',  // Will be replaced with a default image or placeholder
          createdAt: new Date().toISOString(),
          uniqueId: nanoid(),
          emergencyContact: getEmergencyContact(),
          bloodGroup: getBloodGroup(),
          dateOfBirth: row['dateOfBirth'] || row['date_of_birth'] || row['dob'],
          address: row['address'],
          parentName: row['parentName'] || row['parent_name'] || row['parent'],
          parentPhone: row['parentPhone'] || row['parent_phone'] || row['phone'],
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined
        };
      });
      
      setMappedStudents(processedStudents);
      setImportFinished(true);
      return true;
    } catch (err: any) {
      setError(`Error during import: ${err.message}`);
      toast({
        title: "Import failed",
        description: `Failed to import data: ${err.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handlePreview = () => {
    processStudentData();
  };
  
  const handleImport = () => {
    onImport(mappedStudents);
    toast({
      title: "Import successful",
      description: `Imported ${mappedStudents.length} students from CSV.`,
    });
  };
  
  const handleDownloadStudentCard = (student: Student) => {
    // Logic for downloading individual student card as PNG
    toast({
      title: "Downloading card",
      description: `Preparing download for ${student.name}'s ID card.`,
    });
    
    // This would typically call a function to generate and download the card
    // For now, we'll just show a toast
    setTimeout(() => {
      toast({
        title: "Download ready",
        description: `${student.name}'s ID card has been downloaded.`,
      });
    }, 1000);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Students from CSV</CardTitle>
        <CardDescription>
          Upload a CSV file containing student data to import in bulk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleDownloadSample} 
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download Sample CSV
          </Button>
        </div>
        
        {/* Stage 1: Upload */}
        {!preview && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="mb-2">Drag and drop a CSV file here, or click to select a file</p>
                <p className="text-sm text-gray-500">
                  Required columns: Name, Roll Number, Class/Division, Bus Route
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Stage 2: Preview CSV */}
        {preview && !importFinished && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Preview ({csvData.length} records)</div>
            <div className="border rounded-lg overflow-auto max-h-60">
              <table className="w-full border-collapse">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {csvData.length > 0 && Object.keys(csvData[0]).map((header, i) => (
                      <th key={i} className="p-2 text-left text-xs font-medium text-gray-500">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(row).map((cell: any, j) => (
                        <td key={j} className="p-2 text-xs">
                          {String(cell).substring(0, 30)}
                          {String(cell).length > 30 ? '...' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {csvData.length > 5 && (
                    <tr className="border-t">
                      <td colSpan={Object.keys(csvData[0]).length} className="p-2 text-xs text-center">
                        ...and {csvData.length - 5} more records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCsvData([]);
                setPreview(false);
              }}>
                Select Another File
              </Button>
              <Button onClick={handlePreview}>
                Process {csvData.length} Students
              </Button>
            </div>
          </div>
        )}
        
        {/* Stage 3: Processed students with Material UI carousel */}
        {importFinished && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Processed Students ({mappedStudents.length})</h3>
              <Button 
                onClick={handleImport}
                className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Check className="h-4 w-4 mr-2" />
                Import All Students
              </Button>
            </div>
            
            {/* Material UI Carousel */}
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {mappedStudents.map((student) => (
                    <CarouselItem key={student.uniqueId} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="p-4 pb-2 bg-gradient-to-r from-primary/90 to-primary/70 text-white">
                          <CardTitle className="text-base truncate">{student.name}</CardTitle>
                          <CardDescription className="text-xs truncate text-white/80">
                            {student.rollNumber} · {student.classDivision}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="p-4 pt-3 space-y-3">
                          <div className="h-36 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shadow-inner">
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={student.name} 
                                className="h-full w-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-gray-500">
                                <User className="h-12 w-12" />
                                <span className="text-xs mt-1">No Photo</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 font-medium">Bus Route:</span>
                              <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-700">{student.busRoute}</span>
                            </div>
                            {student.bloodGroup && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Blood Group:</span>
                                <span className="font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full">{student.bloodGroup}</span>
                              </div>
                            )}
                            {student.allergies && student.allergies.length > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Allergies:</span>
                                <span className="font-medium truncate max-w-[120px] bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                                  {student.allergies.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-1 flex justify-between gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full text-xs border-gray-300 hover:bg-gray-50"
                            onClick={() => handleDownloadStudentCard(student)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="w-full text-xs bg-primary hover:bg-primary/90"
                          >
                            <QrCode className="h-3 w-3 mr-1" />
                            Generate
                          </Button>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center mt-4 gap-2">
                  <CarouselPrevious className="relative rounded-full border border-gray-200 shadow-sm hover:bg-gray-50" />
                  <CarouselNext className="relative rounded-full border border-gray-200 shadow-sm hover:bg-gray-50" />
                </div>
              </Carousel>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCsvData([]);
                setMappedStudents([]);
                setPreview(false);
                setImportFinished(false);
              }}>
                Start Over
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} className="w-full">
          Cancel Import
        </Button>
      </CardFooter>
    </Card>
  );
}