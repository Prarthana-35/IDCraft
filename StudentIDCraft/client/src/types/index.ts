export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  classDivision: string;
  rackNumber: string;
  busRoute: string;
  allergies: string[];
  photo: string;
  createdAt: string;
  uniqueId?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  customFields?: Record<string, string>;
  userId?: string; // For Firebase authentication
  syncedAt?: string; // When the record was last synced to cloud
}

export interface SavedCard {
  id: string;
  student: Student;
  template: number;
  createdAt: string;
  uniqueId?: string;
  customLayout?: CardLayout;
  userId?: string; // For Firebase authentication
  syncedAt?: string; // When the record was last synced to cloud
}

export interface CardLayout {
  fields: CardField[];
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface CardField {
  id: string;
  type: 'text' | 'image' | 'qrcode';
  label: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
}

export type BusRouteOption = {
  value: string;
  label: string;
};

export type AllergyOption = {
  id: string;
  label: string;
  value: string;
};
