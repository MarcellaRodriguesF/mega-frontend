"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";

import {
  BrazilianState,
  BrazilianStateLabel,
} from "@/constants/enums/address/brazilian-state.enum";

import { useMunicipalities } from "@/hooks/queries/locations/use-municipalities";

export interface AddressFormValues {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type AddressFormField = keyof AddressFormValues;

export type AddressFormErrors = Partial<
  Record<AddressFormField, string | undefined>
>;

interface AddressFormProps {
  value: AddressFormValues;
  onChange: (field: AddressFormField, value: string) => void;
  errors?: AddressFormErrors;
  disabled?: boolean;
  initialZipCode?: string | null;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface PendingCepCity {
  city: string;
  state: string;
}

const stateOptions = Object.values(BrazilianState).map((state) => ({
  value: state,
  label: BrazilianStateLabel(state),
}));

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function AddressForm({
  value,
  onChange,
  errors = {},
  disabled = false,
  initialZipCode = null,
}: AddressFormProps) {
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [cepMessageType, setCepMessageType] = useState<
    "success" | "error" | "info" | undefined
  >();

  // Evita consultar novamente o CEP que já estava cadastrado.
  const lastSearchedCep = useRef((initialZipCode ?? "").replace(/\D/g, ""));

  const pendingCepCity = useRef<PendingCepCity | null>(null);

  const {
    data: municipalities = [],
    isLoading: isLoadingMunicipalities,
    isError: isMunicipalitiesError,
  } = useMunicipalities(value.state);

  const handleChange = useCallback(
    (field: AddressFormField, newValue: string) => {
      onChange(field, newValue);
    },
    [onChange]
  );

  // Seleciona a cidade depois que os municípios do IBGE são carregados.
  useEffect(() => {
    const pending = pendingCepCity.current;

    if (!pending || pending.state !== value.state) return;

    if (isLoadingMunicipalities) return;

    if (isMunicipalitiesError) {
      pendingCepCity.current = null;
      return;
    }

    const municipality = municipalities.find(
      (item) => normalizeText(item.label) === normalizeText(pending.city)
    );

    pendingCepCity.current = null;

    if (municipality) {
      handleChange("city", municipality.value);
    }
  }, [
    municipalities,
    isLoadingMunicipalities,
    isMunicipalitiesError,
    value.state,
    handleChange,
  ]);

  // Consulta automaticamente o CEP quando ele é alterado.
  useEffect(() => {
    const cleanCep = value.zipCode.replace(/\D/g, "");

    // CEP incompleto: não há consulta nem atualização de estado.
    if (cleanCep.length !== 8) {
      lastSearchedCep.current = "";
      pendingCepCity.current = null;
      return;
    }

    // Não consulta novamente o CEP já carregado ou consultado.
    if (lastSearchedCep.current === cleanCep) return;

    lastSearchedCep.current = cleanCep;
    pendingCepCity.current = null;

    const controller = new AbortController();

    async function searchCep() {
      try {
        setIsSearchingCep(true);
        setCepMessage("");
        setCepMessageType("info");

        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Falha na consulta do CEP.");
        }

        const data: ViaCepResponse = await response.json();

        if (data.erro) {
          setCepMessage("CEP não encontrado.");
          setCepMessageType("error");
          return;
        }

        pendingCepCity.current = {
          city: data.localidade || "",
          state: data.uf || "",
        };

        // Atualiza os dados encontrados pelo ViaCEP.
        handleChange("street", data.logradouro || "");
        handleChange("neighborhood", data.bairro || "");

        // Não limpa a cidade: ela será selecionada após carregar o IBGE.
        handleChange("state", data.uf || "");

        setCepMessage("Endereço localizado com sucesso.");
        setCepMessageType("success");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setCepMessage(
          "Não foi possível consultar o CEP. Preencha manualmente."
        );
        setCepMessageType("error");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingCep(false);
        }
      }
    }

    searchCep();

    return () => controller.abort();
  }, [value.zipCode, handleChange]);

  // Remove mensagens temporárias.
  useEffect(() => {
    if (!cepMessage) return;

    const timeout = setTimeout(() => {
      setCepMessage("");
      setCepMessageType(undefined);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [cepMessage]);

  // CEP alterado pelo usuário.
  function handleZipCodeChange(newValue: string) {
    setCepMessage("");
    setCepMessageType(undefined);

    if (newValue.replace(/\D/g, "").length !== 8) {
      setIsSearchingCep(false);
    }

    handleChange("zipCode", newValue);
  }

  // Estado alterado manualmente pelo usuário.
  function handleStateChange(newState: string) {
    if (newState === value.state) return;

    pendingCepCity.current = null;

    handleChange("city", "");
    handleChange("state", newState);
  }

  return (
    <>
      <Input
        label="CEP"
        placeholder="00000-000"
        inputMode="numeric"
        maxLength={9}
        disabled={disabled}
        value={value.zipCode}
        onChange={(event) => handleZipCodeChange(event.target.value)}
        error={errors.zipCode}
        helperText={
          isSearchingCep ? "Consultando CEP..." : cepMessage || undefined
        }
        helperTextType={isSearchingCep ? "info" : cepMessageType}
      />

      <Input
        label="Rua / Avenida"
        placeholder="Nome do logradouro"
        maxLength={255}
        disabled={disabled}
        value={value.street}
        onChange={(event) => handleChange("street", event.target.value)}
        error={errors.street}
      />

      <Input
        label="Número"
        placeholder="Nº"
        maxLength={20}
        disabled={disabled}
        value={value.number}
        onChange={(event) => handleChange("number", event.target.value)}
        error={errors.number}
      />

      <Input
        label="Complemento"
        placeholder="Sala, conjunto, bloco..."
        maxLength={150}
        disabled={disabled}
        value={value.complement}
        onChange={(event) => handleChange("complement", event.target.value)}
        error={errors.complement}
      />

      <Input
        label="Bairro"
        placeholder="Nome do bairro"
        maxLength={100}
        disabled={disabled}
        value={value.neighborhood}
        onChange={(event) => handleChange("neighborhood", event.target.value)}
        error={errors.neighborhood}
      />

      <Select
        label="Estado"
        options={stateOptions}
        placeholder="UF"
        disabled={disabled}
        value={value.state}
        onChange={(event) => handleStateChange(event.target.value)}
        error={errors.state}
      />

      <Select
        label="Cidade"
        options={municipalities}
        placeholder={
          !value.state
            ? "Selecione primeiro o estado"
            : isLoadingMunicipalities
              ? "Carregando municípios..."
              : "Selecione a cidade"
        }
        disabled={
          disabled ||
          !value.state ||
          isLoadingMunicipalities ||
          municipalities.length === 0
        }
        value={value.city}
        onChange={(event) => handleChange("city", event.target.value)}
        error={
          errors.city ||
          (isMunicipalitiesError
            ? "Não foi possível carregar os municípios."
            : undefined)
        }
      />
    </>
  );
}
