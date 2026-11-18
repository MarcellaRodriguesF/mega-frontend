"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Button from "@/components/ui/Button/Button";
import FormMessage from "@/components/ui/FormMessage/FormMessage";
import { authApi } from "@/services/api/auth/auth.api";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import styles from "./login.module.css";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function clearError() {
    setError("");
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
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>E-mail</span>
        <input
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
        />
      </label>

      <label className={styles.field}>
        <span>Senha</span>
        <span className={styles.passwordWrap}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError();
            }}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlash size={18} weight="regular" />
            ) : (
              <Eye size={18} weight="regular" />
            )}
          </button>
        </span>
      </label>

      <FormMessage message={error} />

      <Button
        type="submit"
        className={styles.submit}
        loading={isLoading}
        text="Entrar"
        textLoading="Entrando..."
      />
    </form>
  );
}
