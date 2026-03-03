export interface User {
  _id?: string;
  phone: string;
  name?: string;
  email?: string;
  createdAt: Date;
}

export interface OTPRecord {
  _id?: string;
  phone: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Portfolio {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  collegeName: string;
  resumeBase64?: string;
  resumeFileName?: string;
  additionalDetails?: string;
  template: "basic" | "premium";
  paymentStatus: "pending" | "completed" | "failed";
  paymentId?: string;
  orderId?: string;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}
