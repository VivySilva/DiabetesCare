import { httpClient } from "@/lib/httpClient";

export async function registerGlucose(data: {
  glucose_value: number;
  period: string;
  took_insulin: boolean;
  insulin_type?: string;
  insulin_amount?: number;
  injection_site?: string;
  symptoms?: string[];
  symptom_intensity?: number;
}, token: string) {
  return httpClient.post("/glucose", data, token);
}

export async function getGlucoseRecords(token: string) {
  return httpClient.get("/glucose", token);
}
