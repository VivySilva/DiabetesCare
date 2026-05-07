import { httpClient } from "@/lib/httpClient";

export async function registerMedication(data: {
  category: string;
  medication_name: string;
  time: string;
  notify: boolean;
}, token: string) {
  return httpClient.post("/medications", data, token);
}
