/* eslint-disable no-unused-vars */

export enum CompanyAddressType {
  HEADQUARTERS = "HEADQUARTERS",
  BRANCH = "BRANCH",
  TECHNICAL_INSTALLATION = "TECHNICAL_INSTALLATION",
  RURAL_PROPERTY = "RURAL_PROPERTY",
  OTHER = "OTHER",
}

export const CompanyAddressTypeLabel = (value?: CompanyAddressType): string => {
  const map: Record<CompanyAddressType, string> = {
    [CompanyAddressType.HEADQUARTERS]: "Matriz",
    [CompanyAddressType.BRANCH]: "Filial",
    [CompanyAddressType.TECHNICAL_INSTALLATION]: "Instalação técnica",
    [CompanyAddressType.RURAL_PROPERTY]: "Propriedade rural",
    [CompanyAddressType.OTHER]: "Outro",
  };

  return value ? map[value] : "Não identificado";
};
