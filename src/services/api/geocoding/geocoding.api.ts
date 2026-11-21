
import { apiClient } from "../api-client";

export interface ReverseGeocodingResult {
    city: string;
    state: string;
    country: string;
    plusCode: string;
    zipCode: string | null;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
}

interface ReverseGeocodingResponse {
  status: "success";
  message: string;
  data: ReverseGeocodingResult;
}

export const geocodingApi = {
  reverse(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodingResponse> {
    return apiClient.post<ReverseGeocodingResponse>(
      "/geocoding/reverse",
      { latitude, longitude },
    );
  },
};
