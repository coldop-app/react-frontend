export interface Farmer {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  imageUrl?: string | null;
  password: string;
  createdAt: string; // or Date, depending on how you parse it
  updatedAt: string; // or Date
}
