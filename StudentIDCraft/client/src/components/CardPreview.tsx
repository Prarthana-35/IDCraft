import { useState } from "react";
import { Student, SavedCard, CardLayout, CardField } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QRCodeSVG } from "qrcode.react";
import { nanoid } from "nanoid";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface CardPreviewProps {
  student: Student | null;
  activeTemplate: number;
  onTemplateChange: (template: number) => void;
  onSave: (card: SavedCard) => void;
  customLayout?: CardLayout | null;
}

export default function CardPreview({
  student,
  activeTemplate,
  onTemplateChange,
  onSave,
  customLayout,
}: CardPreviewProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleTemplateToggle = (checked: boolean) => {
    // If custom layout is available and checked is true, set to template 3
    if (customLayout && checked) {
      onTemplateChange(3);
    } else {
      onTemplateChange(checked ? 2 : 1);
    }
  };

  const handleDownload = async () => {
    if (!student || !cardRef.current) {
      toast({
        title: "Error",
        description: "Please generate an ID card first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      
      // Create a link and trigger download
      const link = document.createElement("a");
      link.download = `unity-id-${student.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();

      // Save to local storage
      const card: SavedCard = {
        id: nanoid(),
        student,
        template: activeTemplate,
        createdAt: new Date().toISOString(),
      };
      onSave(card);

      toast({
        title: "Success",
        description: "ID Card downloaded successfully!",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to download ID card",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      {/* Template Selection Toggle */}
      <Card className="bg-white p-4 rounded-xl shadow-md mb-6 shimmer-effect hover-gentle-pop">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <i className="ri-layout-2-line mr-2 text-primary"></i> ID Card Template
          </h2>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Template 1</span>
            <Switch
              checked={activeTemplate !== 1}
              onCheckedChange={handleTemplateToggle}
            />
            <span className="text-sm text-gray-500">
              {customLayout && activeTemplate === 3 ? "Custom Layout" : "Template 2"}
            </span>
          </div>
        </div>
      </Card>
      
      {/* ID Card Preview Container */}
      <div className="relative">
        {/* Template 1 */}
        <Card 
          className={`bg-white p-6 rounded-xl shadow-lg mb-6 transition-all duration-300 transform ${activeTemplate !== 1 ? 'hidden' : ''}`}
          ref={activeTemplate === 1 ? cardRef : null}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="border-8 border-primary rounded-xl overflow-hidden shadow-xl bg-white">
              {/* Card Header */}
              <div className="bg-primary text-white py-3 px-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3">
                    {/* School Logo */}
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xl">U</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">UNITY SCHOOL</h3>
                    <p className="text-xs text-blue-100">Student Identity Card</p>
                  </div>
                </div>
                {/* Academic Year */}
                <div className="text-right">
                  <span className="text-xs bg-white text-primary px-2 py-1 rounded font-medium">
                    {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-4 flex">
                {/* Left: Photo */}
                <div className="w-1/3 mr-4">
                  <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden shadow">
                    {student?.photo ? (
                      <img
                        src={student.photo}
                        alt="Student"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="ri-user-line text-3xl"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code */}
                  <div className="mt-3 bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                    {student ? (
                      <div className="w-24 h-24 bg-white p-1 rounded">
                        <QRCodeSVG
                          value={JSON.stringify({
                            id: student.id,
                            name: student.name,
                            rollNumber: student.rollNumber,
                            classDivision: student.classDivision,
                            rackNumber: student.rackNumber,
                            busRoute: student.busRoute,
                            allergies: student.allergies
                          })}
                          size={96}
                          level="M"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-white p-1 rounded flex items-center justify-center text-gray-300">
                        <i className="ri-qr-code-line text-3xl"></i>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right: Student Info */}
                <div className="w-2/3">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Name:</td>
                        <td className="py-2 font-semibold text-gray-800">{student?.name || "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Roll Number:</td>
                        <td className="py-2 font-semibold text-gray-800">{student?.rollNumber || "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Class/Division:</td>
                        <td className="py-2 font-semibold text-gray-800">{student?.classDivision || "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Rack Number:</td>
                        <td className="py-2 font-semibold text-gray-800">{student?.rackNumber || "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Bus Route:</td>
                        <td className="py-2 font-semibold text-gray-800">
                          {student?.busRoute 
                            ? `Route ${student.busRoute}` 
                            : "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium align-top">Allergies:</td>
                        <td className="py-2">
                          {student?.allergies && student.allergies.length > 0 ? (
                            student.allergies.map((allergy) => (
                              <span
                                key={allergy}
                                className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                              >
                                {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="bg-gray-100 px-4 py-3 text-center text-xs text-gray-600 flex justify-between items-center">
                <div>Valid until: <span className="font-medium">June 30, {new Date().getFullYear() + 1}</span></div>
                <div>ID: <span className="font-medium">{student?.id || "—"}</span></div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Template 2 */}
        <Card 
          className={`bg-white p-6 rounded-xl shadow-lg mb-6 transition-all duration-300 transform ${activeTemplate !== 2 ? 'hidden' : ''}`}
          ref={activeTemplate === 2 ? cardRef : null}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-indigo-800 to-indigo-600">
              {/* Card Header */}
              <div className="py-3 px-5 flex items-center justify-between bg-white">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-3">
                    {/* School Logo */}
                    <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">U</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-indigo-800">UNITY SCHOOL</h3>
                    <p className="text-xs text-indigo-600">Excellence in Education</p>
                  </div>
                </div>
                {/* Academic Year */}
                <div className="text-right">
                  <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                    {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5">
                {/* Student Info */}
                <div className="mb-4 text-center">
                  <h3 className="font-bold text-xl text-white mb-1">
                    {student?.name || "Student Name"}
                  </h3>
                  <p className="text-indigo-200">
                    {student?.classDivision || "Class"} | Roll #{student?.rollNumber || "—"}
                  </p>
                </div>
                
                <div className="flex items-center">
                  {/* Left: Photo */}
                  <div className="w-1/3">
                    <div className="w-full aspect-square bg-white rounded-lg overflow-hidden shadow-lg p-1">
                      {student?.photo ? (
                        <img
                          src={student.photo}
                          alt="Student"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 rounded">
                          <i className="ri-user-line text-3xl"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right: Student Details Table */}
                  <div className="w-2/3 pl-5">
                    <div className="bg-indigo-700 bg-opacity-50 rounded-lg p-3">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 text-indigo-200">Roll No:</td>
                            <td className="py-1 font-medium text-white">{student?.rollNumber || "—"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-indigo-200">Rack No:</td>
                            <td className="py-1 font-medium text-white">{student?.rackNumber || "—"}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-indigo-200">Bus Route:</td>
                            <td className="py-1 font-medium text-white">
                              {student?.busRoute 
                                ? `Route ${student.busRoute}` 
                                : "—"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 text-indigo-200">Allergies:</td>
                            <td className="py-1 font-medium">
                              {student?.allergies && student.allergies.length > 0 ? (
                                student.allergies.map((allergy) => (
                                  <span
                                    key={allergy}
                                    className="inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded mr-1 mb-1"
                                  >
                                    {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-indigo-200">None</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {/* QR Code Row */}
                <div className="flex justify-center mt-4">
                  <div className="bg-white p-2 rounded-lg">
                    {student ? (
                      <QRCodeSVG
                        value={JSON.stringify({
                          id: student.id,
                          name: student.name,
                          rollNumber: student.rollNumber,
                          classDivision: student.classDivision,
                          rackNumber: student.rackNumber,
                          busRoute: student.busRoute,
                          allergies: student.allergies
                        })}
                        size={96}
                        level="M"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-gray-300">
                        <i className="ri-qr-code-line text-3xl"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="bg-indigo-900 px-5 py-2.5 text-center text-xs text-indigo-200 flex justify-between items-center">
                <div>Valid until: <span className="font-medium text-white">June 30, {new Date().getFullYear() + 1}</span></div>
                <div>ID: <span className="font-medium text-white">{student?.id || "—"}</span></div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Custom Layout Template */}
        {customLayout && (
          <Card 
            className={`bg-white p-6 rounded-xl shadow-lg mb-6 transition-all duration-300 transform ${activeTemplate !== 3 ? 'hidden' : ''}`}
            ref={activeTemplate === 3 ? cardRef : null}
            style={{ backgroundColor: customLayout.backgroundColor || '#ffffff' }}
          >
            <div className="w-full max-w-md mx-auto">
              <div className="rounded-xl overflow-hidden shadow-xl relative" 
                   style={{ 
                     backgroundColor: customLayout.backgroundColor || '#ffffff',
                     color: customLayout.textColor || '#000000',
                     minHeight: '350px',
                     position: 'relative'
                   }}
              >
                {/* Render all custom fields */}
                {customLayout.fields.map((field) => {
                  if (field.type === 'text') {
                    return (
                      <div 
                        key={field.id}
                        style={{
                          position: 'absolute',
                          left: `${field.x}px`,
                          top: `${field.y}px`,
                          width: `${field.width}px`,
                          overflow: 'hidden',
                          color: customLayout.textColor || '#000000',
                          fontSize: `${field.fontSize || 14}px`,
                          fontWeight: field.fontWeight || 'normal',
                        }}
                      >
                        {field.label && (
                          <span className="font-medium mr-1">{field.label}:</span>
                        )}
                        <span>{field.value}</span>
                      </div>
                    );
                  } else if (field.type === 'image' && student?.photo) {
                    return (
                      <div
                        key={field.id}
                        style={{
                          position: 'absolute',
                          left: `${field.x}px`,
                          top: `${field.y}px`,
                          width: `${field.width}px`,
                          height: `${field.height}px`,
                        }}
                      >
                        <img 
                          src={student.photo} 
                          alt={field.label} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    );
                  } else if (field.type === 'qrcode' && student) {
                    return (
                      <div
                        key={field.id}
                        style={{
                          position: 'absolute',
                          left: `${field.x}px`,
                          top: `${field.y}px`,
                          width: `${field.width}px`,
                          height: `${field.height}px`,
                          backgroundColor: '#ffffff',
                          padding: '5px',
                          borderRadius: '5px',
                        }}
                      >
                        <QRCodeSVG
                          value={JSON.stringify({
                            id: student.id,
                            name: student.name,
                            rollNumber: student.rollNumber,
                            classDivision: student.classDivision
                          })}
                          size={Math.min(field.width, field.height) - 10}
                          level="M"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </Card>
        )}
        
        {/* Download Button */}
        <Card className="bg-white p-4 rounded-xl shadow-md">
          <Button 
            className="w-full bg-accent hover:bg-amber-600 text-white font-medium py-6 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center"
            onClick={handleDownload}
            disabled={!student || isDownloading}
          >
            <i className="ri-download-line mr-2"></i> 
            {isDownloading ? "Processing..." : "Download as PNG"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
