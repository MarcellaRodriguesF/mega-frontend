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
  CONNECTIVITY_ALREADY_EXISTS:
    "Esta unidade já possui uma conectividade cadastrada.",
  TOO_MANY_REQUESTS: "Muitas tentativas. Aguarde e tente novamente.",
  FORM_TEMPLATE_IN_USE:
    "Não é possível excluir este formulário porque ele está associado a requisitos.",
  FORM_TEMPLATE_INACTIVE:
    "O formulário precisa estar ativo para ser associado a uma atividade.",
  ORDER_CONFLICT:
    "Já existe um item com a mesma ordem ou chave neste grupo.",
  TEMPLATE_NOT_PUBLISHED:
    "A implantação só pode ser criada a partir de um template publicado.",
  IMPLEMENTATION_TEMPLATE_NOT_FOUND: "Template não encontrado.",
  IMPLEMENTATION_UNIT_NOT_FOUND: "Unidade não encontrada.",
  IMPLEMENTATION_NOT_FOUND: "Implantação não encontrada.",
  FORM_SNAPSHOT_SOURCE_MISSING:
    "Não foi possível copiar um formulário associado ao template.",
  IMPLEMENTATION_SNAPSHOT_CONFLICT:
    "Não foi possível copiar a estrutura do template.",
  CONNECTIVITY_TARGET_INVALID:
    "O campo não pode ser publicado nesta propriedade da conectividade.",
  TEMPLATE_STRUCTURE_INVALID:
    "O template publicado não possui etapas e atividades para copiar.",
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
