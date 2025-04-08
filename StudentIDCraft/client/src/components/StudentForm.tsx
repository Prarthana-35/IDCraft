import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student } from "@/types";
import { nanoid } from "nanoid";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  rollNumber: z.string().min(1, { message: "Roll number is required" }),
  classDivision: z.string().min(1, { message: "Class/Division is required" }),
  rackNumber: z.string().min(1, { message: "Rack number is required" }),
  busRoute: z.string().min(1, { message: "Bus route is required" }),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  // Custom fields will be handled separately
});

type FormData = z.infer<typeof formSchema>;

interface StudentFormProps {
  onSubmit: (student: Student) => void;
}

const BUS_ROUTES = [
  { value: "101", label: "Route 101 - North Campus" },
  { value: "102", label: "Route 102 - South Hills" },
  { value: "103", label: "Route 103 - East District" },
  { value: "104", label: "Route 104 - West Valley" },
  { value: "105", label: "Route 105 - City Center" },
];

const ALLERGIES = [
  { id: "dairy", label: "Dairy", value: "dairy" },
  { id: "nuts", label: "Nuts", value: "nuts" },
  { id: "seafood", label: "Seafood", value: "seafood" },
  { id: "eggs", label: "Eggs", value: "eggs" },
  { id: "gluten", label: "Gluten", value: "gluten" },
];

const BLOOD_GROUPS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export default function StudentForm({ onSubmit }: StudentFormProps) {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [newCustomField, setNewCustomField] = useState({ name: "", value: "" });
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      classDivision: "",
      rackNumber: "",
      busRoute: "",
      allergies: [],
      emergencyContact: "",
      bloodGroup: "",
      dateOfBirth: "",
      address: "",
      parentName: "",
      parentPhone: "",
    },
  });

  const watchedAllergies = watch("allergies", []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should not exceed 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Error",
        description: "Please select an image file (JPG or PNG)",
        variant: "destructive",
      });
      return;
    }

    setPhotoFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhotoPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFormSubmit = (data: FormData) => {
    if (!photoPreview) {
      toast({
        title: "Error",
        description: "Please upload a photo",
        variant: "destructive",
      });
      return;
    }
    
    const student: Student = {
      id: `UNI${new Date().getFullYear()}${nanoid(3)}`,
      ...data,
      allergies: data.allergies || [],
      photo: photoPreview,
      createdAt: new Date().toISOString(),
      uniqueId: nanoid(),
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined
    };
    
    onSubmit(student);
    
    toast({
      title: "Success",
      description: "ID Card generated successfully!",
    });
  };

  const handleAllergyChange = (checked: boolean | "indeterminate", allergyValue: string) => {
    if (checked) {
      setValue("allergies", [...(watchedAllergies || []), allergyValue]);
    } else {
      setValue(
        "allergies",
        (watchedAllergies || []).filter((value) => value !== allergyValue)
      );
    }
  };
  
  const handleAddCustomField = () => {
    if (!newCustomField.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a field name",
        variant: "destructive",
      });
      return;
    }
    
    setCustomFields(prev => ({
      ...prev,
      [newCustomField.name]: newCustomField.value
    }));
    
    setNewCustomField({ name: "", value: "" });
    
    toast({
      title: "Success",
      description: `Added custom field: ${newCustomField.name}`,
    });
  };
  
  const handleRemoveCustomField = (fieldName: string) => {
    const updatedFields = { ...customFields };
    delete updatedFields[fieldName];
    setCustomFields(updatedFields);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 float-animation">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
        <i className="ri-user-add-line mr-2 text-primary"></i> Student Information
      </h2>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name Input */}
          <div className="relative">
            <Input
              id="name"
              placeholder="Full Name"
              {...register("name")}
              className={`transition-all duration-200 hover:border-primary/50 focus:border-primary ${errors.name ? "border-red-500" : ""} backdrop-blur-sm bg-white/50`}
            />
            <Label htmlFor="name" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
              Full Name
            </Label>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          {/* Roll Number Input */}
          <div className="relative">
            <Input
              id="rollNumber"
              placeholder="Roll Number"
              {...register("rollNumber")}
              className={errors.rollNumber ? "border-red-500" : ""}
            />
            <Label htmlFor="rollNumber" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
              Roll Number
            </Label>
            {errors.rollNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.rollNumber.message}</p>
            )}
          </div>
        </div>
        
        {/* Class & Rack Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Class/Division Input */}
          <div className="relative">
            <Input
              id="classDivision"
              placeholder="Class/Division"
              {...register("classDivision")}
              className={errors.classDivision ? "border-red-500" : ""}
            />
            <Label htmlFor="classDivision" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
              Class/Division
            </Label>
            {errors.classDivision && (
              <p className="mt-1 text-xs text-red-500">{errors.classDivision.message}</p>
            )}
          </div>
          
          {/* Rack Number Input */}
          <div className="relative">
            <Input
              id="rackNumber"
              placeholder="Rack Number"
              {...register("rackNumber")}
              className={errors.rackNumber ? "border-red-500" : ""}
            />
            <Label htmlFor="rackNumber" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
              Rack Number
            </Label>
            {errors.rackNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.rackNumber.message}</p>
            )}
          </div>
        </div>
        
        {/* Bus Route Dropdown */}
        <div>
          <Label htmlFor="busRoute" className="block text-sm font-medium text-gray-700 mb-1">
            Bus Route Number
          </Label>
          <Select
            defaultValue=""
            onValueChange={(value) => setValue("busRoute", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Bus Route" />
            </SelectTrigger>
            <SelectContent>
              {BUS_ROUTES.map((route) => (
                <SelectItem key={route.value} value={route.value}>
                  {route.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.busRoute && (
            <p className="mt-1 text-xs text-red-500">{errors.busRoute.message}</p>
          )}
        </div>
        
        {/* Allergies Multi-select */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Allergies
          </Label>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map((allergy) => (
              <div key={allergy.id} className="form-check inline-flex items-center">
                <Checkbox
                  id={`allergy-${allergy.id}`}
                  checked={(watchedAllergies || []).includes(allergy.value)}
                  onCheckedChange={(checked) => 
                    handleAllergyChange(checked, allergy.value)
                  }
                  className="mr-2"
                />
                <Label
                  htmlFor={`allergy-${allergy.id}`}
                  className="text-sm text-gray-700"
                >
                  {allergy.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Photo Upload Section */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Student Photo
          </Label>
          <div className="flex items-center space-x-5">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-32 h-32 flex items-center justify-center bg-gray-50 relative overflow-hidden">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="object-cover w-full h-full absolute inset-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <i className="ri-image-add-line text-2xl"></i>
                  <span className="text-xs mt-1">Upload Photo</span>
                </div>
              )}
              
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Image requirements:</p>
              <ul className="list-disc ml-5 text-xs">
                <li>Format: JPG or PNG</li>
                <li>Size: Max 2MB</li>
                <li>Ratio: 1:1 (square)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Additional Information Section */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional-info">
            <AccordionTrigger className="text-sm font-medium text-gray-700">
              Additional Information (Optional)
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Blood Group */}
                <div>
                  <Label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("bloodGroup", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Emergency Contact */}
                <div className="relative">
                  <Input
                    id="emergencyContact"
                    placeholder="Emergency Contact"
                    {...register("emergencyContact")}
                  />
                  <Label htmlFor="emergencyContact" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
                    Emergency Contact Number
                  </Label>
                </div>
                
                {/* Date of Birth */}
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                  />
                  <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </Label>
                </div>
                
                {/* Parent Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <Input
                      id="parentName"
                      placeholder="Parent/Guardian Name"
                      {...register("parentName")}
                    />
                    <Label htmlFor="parentName" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
                      Parent/Guardian Name
                    </Label>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="parentPhone"
                      placeholder="Parent/Guardian Phone"
                      {...register("parentPhone")}
                    />
                    <Label htmlFor="parentPhone" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2 peer-focus:text-primary">
                      Parent/Guardian Phone
                    </Label>
                  </div>
                </div>
                
                {/* Address */}
                <div>
                  <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter student's address"
                    {...register("address")}
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Custom Fields Section */}
          <AccordionItem value="custom-fields">
            <AccordionTrigger className="text-sm font-medium text-gray-700">
              Custom Fields
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Add New Custom Field */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Input
                      placeholder="Field Name"
                      value={newCustomField.name}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      placeholder="Field Value"
                      value={newCustomField.value}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button onClick={handleAddCustomField} type="button" className="w-full">
                      Add Field
                    </Button>
                  </div>
                </div>
                
                {/* Display Custom Fields */}
                {Object.keys(customFields).length > 0 && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Added Custom Fields</h4>
                    <div className="space-y-2">
                      {Object.entries(customFields).map(([name, value]) => (
                        <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{name}: </span>
                            <span>{value}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveCustomField(name)}
                            className="text-red-500 hover:text-red-700"
                            type="button"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Generate Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-6 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <i className="ri-id-card-line mr-2"></i> Generate ID Card
          </Button>
        </div>
      </form>
    </Card>
  );
}
