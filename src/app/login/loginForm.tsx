"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import FormMessage from "@/components/ui/FormMessage/FormMessage";
import { authApi } from "@/services/api/auth/auth.api";
import { ApiError } from "@/services/api/api-client";
import styles from "./login.module.css";
import { getApiErrorMessage } from "@/services/api/error-messages";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function clearError() {
    setError("");
    setInvalidCredentials(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      await authApi.login({ email, password });

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (
          err.code === "INVALID_CREDENTIALS" ||
          (err.status === 401 && err.code === "UNKNOWN_ERROR")
        ) {
          setError("E-mail ou senha inválidos.");
          setInvalidCredentials(true);
        } else {
          setError(getApiErrorMessage(err.code, err.message));
        }
      } else {
        setError(
          "Não foi possível conectar ao servidor. Verifique sua conexão.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.formPreview} onSubmit={handleSubmit}>
      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="nome@empresa.com"
        autoComplete="username"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          clearError();
        }}
        required
        disabled={isLoading}
        error={invalidCredentials ? error : ""}
      />

      <Input
        label="Senha"
        name="password"
        type="password"
        showPasswordToggle
        placeholder="Digite sua senha"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          clearError();
        }}
        required
        disabled={isLoading}
        error={invalidCredentials ? error : ""}
      />

      <Button
        type="submit"
        loading={isLoading}
        text={"Entrar"}
        textLoading={"Entrando..."}
      />
    </form>
  );
}
