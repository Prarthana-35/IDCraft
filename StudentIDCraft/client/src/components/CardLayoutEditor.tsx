import { useState, useRef, useEffect } from 'react';
import { CardLayout, CardField, Student } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';

interface CardLayoutEditorProps {
  student: Student;
  initialLayout?: CardLayout;
  onSave: (layout: CardLayout) => void;
  onBack: () => void;
}

export default function CardLayoutEditor({ student, initialLayout, onSave, onBack }: CardLayoutEditorProps) {
  const [layout, setLayout] = useState<CardLayout>(() => initialLayout || {
    fields: [
      {
        id: nanoid(),
        type: 'text',
        label: 'Name',
        value: 'name',
        x: 10,
        y: 10,
        width: 200,
        height: 30,
        fontSize: 16,
        fontWeight: 'bold',
      },
      {
        id: nanoid(),
        type: 'text',
        label: 'Roll Number',
        value: 'rollNumber',
        x: 10,
        y: 50,
        width: 200,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
      },
      {
        id: nanoid(),
        type: 'text',
        label: 'Class',
        value: 'classDivision',
        x: 10,
        y: 90,
        width: 150,
        height: 30,
        fontSize: 14,
        fontWeight: 'normal',
      },
      {
        id: nanoid(),
        type: 'image',
        label: 'Photo',
        value: 'photo',
        x: 230,
        y: 10,
        width: 120,
        height: 140,
        fontSize: 14,
        fontWeight: 'normal',
      },
      {
        id: nanoid(),
        type: 'qrcode',
        label: 'QR Code',
        value: 'qrcode',
        x: 100,
        y: 160,
        width: 100,
        height: 100,
        fontSize: 14,
        fontWeight: 'normal',
      },
    ],
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#3b82f6',
  });
  
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('canvas');
  const [cardSize, setCardSize] = useState({ width: 375, height: 300 });
  const { toast } = useToast();

  const selectedField = layout.fields.find(f => f.id === selectedFieldId);
  
  // Get available field options based on student data
  const availableFields = [
    { label: 'Name', value: 'name' },
    { label: 'Roll Number', value: 'rollNumber' },
    { label: 'Class/Division', value: 'classDivision' },
    { label: 'Rack Number', value: 'rackNumber' },
    { label: 'Bus Route', value: 'busRoute' },
    { label: 'Photo', value: 'photo' },
    { label: 'QR Code', value: 'qrcode' },
  ];
  
  // Add optional fields if they exist
  if (student.emergencyContact) availableFields.push({ label: 'Emergency Contact', value: 'emergencyContact' });
  if (student.bloodGroup) availableFields.push({ label: 'Blood Group', value: 'bloodGroup' });
  if (student.dateOfBirth) availableFields.push({ label: 'Date of Birth', value: 'dateOfBirth' });
  if (student.address) availableFields.push({ label: 'Address', value: 'address' });
  if (student.parentName) availableFields.push({ label: 'Parent Name', value: 'parentName' });
  if (student.parentPhone) availableFields.push({ label: 'Parent Phone', value: 'parentPhone' });
  
  // Add custom fields
  if (student.customFields) {
    Object.keys(student.customFields).forEach(key => {
      availableFields.push({ label: key, value: `customFields.${key}` });
    });
  }

  // Event handlers
  const startDrag = (e: React.MouseEvent, fieldId: string) => {
    if (!canvasRef.current) return;
    
    setSelectedFieldId(fieldId);
    const field = layout.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - field.x;
    const offsetY = e.clientY - rect.top - field.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragging(true);
  };
  
  const handleDrag = (e: React.MouseEvent) => {
    if (!dragging || !selectedFieldId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;
    
    // Keep within bounds
    newX = Math.max(0, Math.min(cardSize.width - 50, newX));
    newY = Math.max(0, Math.min(cardSize.height - 50, newY));
    
    setLayout(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === selectedFieldId
          ? { ...field, x: newX, y: newY }
          : field
      )
    }));
  };
  
  const stopDrag = () => {
    setDragging(false);
  };
  
  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging) {
        stopDrag();
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        handleDrag(e as unknown as React.MouseEvent);
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging]);
  
  const handleAddField = () => {
    // Find an available field that's not already used
    const usedValues = new Set(layout.fields.map(f => f.value));
    const availableValue = availableFields.find(f => !usedValues.has(f.value));
    
    if (!availableValue) {
      toast({
        title: "No more fields available",
        description: "All available fields have been added to the card.",
      });
      return;
    }
    
    const newField: CardField = {
      id: nanoid(),
      type: availableValue.value === 'photo' ? 'image' : 
            availableValue.value === 'qrcode' ? 'qrcode' : 'text',
      label: availableValue.label,
      value: availableValue.value,
      x: 10,
      y: 10,
      width: availableValue.value === 'photo' ? 120 : 
            availableValue.value === 'qrcode' ? 100 : 200,
      height: availableValue.value === 'photo' ? 140 : 
             availableValue.value === 'qrcode' ? 100 : 30,
      fontSize: 14,
      fontWeight: 'normal',
    };
    
    setLayout(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setSelectedFieldId(newField.id);
  };
  
  const handleDeleteField = () => {
    if (!selectedFieldId) return;
    
    setLayout(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== selectedFieldId)
    }));
    
    setSelectedFieldId(null);
  };
  
  const handleFieldChange = (property: keyof CardField, value: any) => {
    if (!selectedFieldId) return;
    
    setLayout(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === selectedFieldId
          ? { ...field, [property]: value }
          : field
      )
    }));
  };
  
  const handleBackgroundColorChange = (color: string) => {
    setLayout(prev => ({ ...prev, backgroundColor: color }));
  };
  
  const handleTextColorChange = (color: string) => {
    setLayout(prev => ({ ...prev, textColor: color }));
  };
  
  const handleAccentColorChange = (color: string) => {
    setLayout(prev => ({ ...prev, accentColor: color }));
  };
  
  const handleSave = () => {
    onSave(layout);
  };
  
  // Helper function to resolve field values from student object
  const resolveFieldValue = (field: CardField): string => {
    if (field.type === 'qrcode') {
      // For QR code, create a small subset of student data to avoid "data too long" errors
      const qrData = {
        name: student.name,
        rollNumber: student.rollNumber,
        classDivision: student.classDivision,
        busRoute: student.busRoute,
        uniqueId: student.uniqueId,
        emergencyContact: student.emergencyContact,
        bloodGroup: student.bloodGroup
      };
      return JSON.stringify(qrData);
    }
    
    if (field.value === 'photo') {
      return student.photo;
    }
    
    if (field.value.startsWith('customFields.')) {
      const customFieldKey = field.value.split('.')[1];
      return student.customFields?.[customFieldKey] || '';
    }
    
    return student[field.value as keyof Student]?.toString() || '';
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Card Layout Editor</CardTitle>
          <CardDescription>
            Design your custom ID card layout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas">
              <div
                ref={canvasRef}
                className="relative border rounded-lg shadow-sm overflow-hidden"
                style={{
                  width: `${cardSize.width}px`,
                  height: `${cardSize.height}px`,
                  backgroundColor: layout.backgroundColor,
                  color: layout.textColor,
                }}
              >
                {layout.fields.map(field => {
                  const isSelected = field.id === selectedFieldId;
                  const value = resolveFieldValue(field);
                  
                  return (
                    <div
                      key={field.id}
                      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{
                        left: `${field.x}px`,
                        top: `${field.y}px`,
                        width: `${field.width}px`,
                        height: `${field.height}px`,
                      }}
                      onMouseDown={(e) => startDrag(e, field.id)}
                      onClick={() => setSelectedFieldId(field.id)}
                    >
                      {field.type === 'text' && (
                        <div
                          style={{
                            fontSize: `${field.fontSize}px`,
                            fontWeight: field.fontWeight,
                            color: layout.textColor,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {value}
                        </div>
                      )}
                      
                      {field.type === 'image' && value && (
                        <img
                          src={value}
                          alt={field.label}
                          className="object-cover w-full h-full"
                        />
                      )}
                      
                      {field.type === 'qrcode' && (
                        <QRCodeSVG
                          value={value}
                          size={Math.min(field.width, field.height)}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button size="sm" onClick={handleAddField}>Add Field</Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDeleteField}
                  disabled={!selectedFieldId}
                >
                  Delete Field
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="properties">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        value={cardSize.width}
                        onChange={(e) => setCardSize(prev => ({ ...prev, width: parseInt(e.target.value) || 375 }))}
                        min={300}
                        max={600}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        value={cardSize.height}
                        onChange={(e) => setCardSize(prev => ({ ...prev, height: parseInt(e.target.value) || 300 }))}
                        min={200}
                        max={500}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Card Colors</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Background</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={layout.backgroundColor}
                          onChange={(e) => handleBackgroundColorChange(e.target.value)}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={layout.backgroundColor}
                          onChange={(e) => handleBackgroundColorChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Text</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={layout.textColor}
                          onChange={(e) => handleTextColorChange(e.target.value)}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={layout.textColor}
                          onChange={(e) => handleTextColorChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Accent</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={layout.accentColor}
                          onChange={(e) => handleAccentColorChange(e.target.value)}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={layout.accentColor}
                          onChange={(e) => handleAccentColorChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedField && (
                  <div className="space-y-4 border p-4 rounded-lg">
                    <h4 className="font-medium">Selected Field: {selectedField.label}</h4>
                    
                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={selectedField.type}
                        onValueChange={(value) => handleFieldChange('type', value)}
                        disabled={selectedField.value === 'photo' || selectedField.value === 'qrcode'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image" disabled={selectedField.value !== 'photo'}>Image</SelectItem>
                          <SelectItem value="qrcode" disabled={selectedField.value !== 'qrcode'}>QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Field Content</Label>
                      <Select
                        value={selectedField.value}
                        onValueChange={(value) => handleFieldChange('value', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select content source" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields
                            .filter(f => 
                              (selectedField.type === 'image' && f.value === 'photo') ||
                              (selectedField.type === 'qrcode' && f.value === 'qrcode') ||
                              (selectedField.type === 'text' && f.value !== 'photo' && f.value !== 'qrcode')
                            )
                            .map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position X</Label>
                        <Input
                          type="number"
                          value={selectedField.x}
                          onChange={(e) => handleFieldChange('x', parseInt(e.target.value) || 0)}
                          min={0}
                          max={cardSize.width - 20}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position Y</Label>
                        <Input
                          type="number"
                          value={selectedField.y}
                          onChange={(e) => handleFieldChange('y', parseInt(e.target.value) || 0)}
                          min={0}
                          max={cardSize.height - 20}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          value={selectedField.width}
                          onChange={(e) => handleFieldChange('width', parseInt(e.target.value) || 50)}
                          min={20}
                          max={cardSize.width}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          value={selectedField.height}
                          onChange={(e) => handleFieldChange('height', parseInt(e.target.value) || 20)}
                          min={20}
                          max={cardSize.height}
                        />
                      </div>
                    </div>
                    
                    {selectedField.type === 'text' && (
                      <>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              defaultValue={[selectedField.fontSize || 14]}
                              min={8}
                              max={36}
                              step={1}
                              onValueChange={(value) => handleFieldChange('fontSize', value[0])}
                              className="flex-1"
                            />
                            <span className="w-10 text-right">{selectedField.fontSize}px</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Font Weight</Label>
                          <Select
                            value={selectedField.fontWeight || 'normal'}
                            onValueChange={(value) => handleFieldChange('fontWeight', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select font weight" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Layout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}