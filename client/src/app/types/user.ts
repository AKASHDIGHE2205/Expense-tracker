export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  isAdmin: string;
}

export interface UserProfile {
  id: string,
  name: string,
  email: string,
  mobile: string,
  isAdmin: boolean,
  createdAt: string,
  isVerified: boolean,
  status: "A" | "I" | "D" | "B",
  plane: "Free" | "Premium"
}