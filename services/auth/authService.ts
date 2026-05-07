import { httpClient } from "@/lib/httpClient";

export async function loginUser(email: string, password: string) {
  return httpClient.post("/auth/login", { email, password });
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "patient" | "professional";
  licenseNumber?: string;
  phone?: string;
}) {
  return httpClient.post("/auth/register", data);
}

export async function requestPasswordRecovery(email: string) {
  return httpClient.post("/auth/forgot-password/request", { email });
}

export async function resetPassword(token: string, newPassword: string) {
  return httpClient.post("/auth/forgot-password/reset", { token, new_password: newPassword });
}
