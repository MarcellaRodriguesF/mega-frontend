import { locationsApi } from "@/services/api/location/locations.service";
import { useQuery } from "@tanstack/react-query";

export function useMunicipalities(state: string) {
  return useQuery({
    queryKey: ["municipalities", state],
    queryFn: ({ signal }) =>
      locationsApi.findMunicipalitiesByState(state, signal),
    enabled: Boolean(state),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
}
