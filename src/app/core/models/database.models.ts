export interface User {
  id?: number;
  location: any;
  username: string;
  email: string;
  name: string;
  lastname: string;
  number: number;
  address: string;
  photo?: any;
  password: string;
  autencationUserID: string;
  language: string;
}

export interface WaterSources {
  id?: number;
  location: any;
  name: string;
  address: string;
  ispotable: boolean;
  available: boolean;
  created_at: any;
  photo: string;
  description: string;
  watersourcetype: string;
  updated_at: Date;
}

export interface Forms {
  id?: number;
  username: string;
  watersourcesname: string;
  created_at: any;
  location: any;
  photo: string;
  address: string;
  description: string;
  is_potable: boolean;
  watersourcetype: string;
  approved: boolean | null;
  autencationUserID: string;
}

export interface UserType {
  id?: number;
  admin_role: boolean;
  user_role: boolean;
  autencationUserID?: string;
}
