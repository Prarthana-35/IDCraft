import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function createDefaultStudent() {
  return {
    id: "",
    name: "",
    rollNumber: "",
    classDivision: "",
    rackNumber: "",
    busRoute: "",
    allergies: [],
    photo: "",
    createdAt: new Date().toISOString(),
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): { valid: boolean; message: string } {
  // Check file type
  if (!file.type.match('image.*')) {
    return { 
      valid: false, 
      message: "Please select an image file (JPG or PNG)" 
    };
  }
  
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { 
      valid: false, 
      message: "Image size should not exceed 2MB" 
    };
  }
  
  return { valid: true, message: "" };
}
