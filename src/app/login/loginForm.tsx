"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { authApi } from "@/services/api/auth/auth.api";
import { ApiError } from "@/services/api/api-client";
import styles from "./login.module.css";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authApi.login({ email, password });

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401 ? "E-mail ou senha inválidos." : err.message,
        );
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
        onChange={(event) => setEmail(event.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        label="Senha"
        name="password"
        type="password"
        placeholder="Digite sua senha"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        disabled={isLoading}
      />

      {error && (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
