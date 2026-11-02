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
}: AddressFormProps) {
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepMessage, setCepMessage] = useState("");
  const [cepMessageType, setCepMessageType] = useState<
    "success" | "error" | "info" | undefined
  >();

  const lastSearchedCep = useRef("");
  const pendingCepCity = useRef<PendingCepCity | null>(null);
  const previousState = useRef(value.state);

  const {
    data: municipalities = [],
    isLoading: isLoadingMunicipalities,
    isError: isMunicipalitiesError,
  } = useMunicipalities(value.state);

  const handleChange = useCallback(
    (field: AddressFormField, newValue: string) => {
      onChange(field, newValue);
    },
    [onChange],
  );

  // Limpa a cidade quando o usuário altera manualmente o estado.
  useEffect(() => {
    if (previousState.current === value.state) return;

    previousState.current = value.state;

    // Preserva a cidade quando a mudança de estado veio do ViaCEP.
    if (pendingCepCity.current?.state === value.state) return;

    pendingCepCity.current = null;

    handleChange("city", "");
  }, [value.state, handleChange]);

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
      (item) => normalizeText(item.label) === normalizeText(pending.city),
    );

    if (municipality) {
      handleChange("city", municipality.value);
    }

    pendingCepCity.current = null;
  }, [
    municipalities,
    isLoadingMunicipalities,
    isMunicipalitiesError,
    value.state,
    handleChange,
  ]);

  // Consulta automaticamente o CEP.
  useEffect(() => {
    const cleanCep = value.zipCode.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      lastSearchedCep.current = "";
      pendingCepCity.current = null;
      setCepMessage("");
      setCepMessageType(undefined);
      setIsSearchingCep(false);
      return;
    }

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
          { signal: controller.signal },
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

        // Guarda a cidade e a UF para selecionar após a consulta ao IBGE.
        pendingCepCity.current = {
          city: data.localidade || "",
          state: data.uf || "",
        };

        handleChange("street", data.logradouro || "");
        handleChange("neighborhood", data.bairro || "");
        handleChange("state", data.uf || "");

        setCepMessage("Endereço localizado com sucesso.");
        setCepMessageType("success");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setCepMessage(
          "Não foi possível consultar o CEP. Preencha manualmente.",
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

  return (
    <>
      <Input
        label="CEP"
        placeholder="00000-000"
        inputMode="numeric"
        maxLength={9}
        disabled={disabled}
        value={value.zipCode}
        onChange={(event) => handleChange("zipCode", event.target.value)}
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
        onChange={(event) => handleChange("state", event.target.value)}
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
