export const API_ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "Não foi possível processar sua solicitação.",
  INVALID_JSON: "Os dados enviados são inválidos.",
  VALIDATION_ERROR: "Verifique os campos informados.",
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  FORBIDDEN: "Você não tem permissão para realizar esta ação.",
  NOT_FOUND: "O conteúdo solicitado não foi encontrado.",
  USER_NOT_FOUND: "Usuário não encontrado.",
  CONFLICT: "Esta operação conflita com um registro existente.",
  TOO_MANY_REQUESTS: "Muitas tentativas. Aguarde e tente novamente.",
  INTERNAL_SERVER_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
  SERVICE_UNAVAILABLE:
    "O serviço está temporariamente indisponível. Tente novamente.",
};

export function getApiErrorMessage(code?: string, fallback?: string): string {
  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code];
  }

  return fallback || API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
}
