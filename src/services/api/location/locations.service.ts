import type { IbgeMunicipality, MunicipalityOption } from "./locations.types";

const IBGE_API_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export const locationsApi = {
  async findMunicipalitiesByState(
    state: string,
    signal?: AbortSignal,
  ): Promise<MunicipalityOption[]> {
    const response = await fetch(
      `${IBGE_API_URL}/estados/${state}/municipios`,
      { signal },
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar os municípios.");
    }

    const municipalities: IbgeMunicipality[] = await response.json();

    return municipalities
      .map((municipality) => ({
        value: municipality.nome,
        label: municipality.nome,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  },
};
