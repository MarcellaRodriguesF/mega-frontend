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
  UNIT_COMPANY_MISMATCH: "A unidade não pertence ao cliente informado.",
  ACTIVITY_ALREADY_LINKED:
    "A atividade já pertence a outra implantação. Mova-a dentro da implantação atual ou desvincule antes.",
  ACTIVITY_COMPLETED_MOVE_REQUIRES_CONFIRMATION:
    "Confirme explicitamente para mover ou vincular uma atividade concluída.",
  SUPERVISOR_ALREADY_ASSIGNED: "Esta atividade já possui um supervisor.",
  ASSIGNMENT_DUPLICATE: "Este responsável já está atribuído com esse papel.",
  ACTIVITY_EXECUTE_FORBIDDEN:
    "Somente um executor atribuído, ou quem tem gestão global de atividades, pode iniciar a execução.",
  ACTIVITY_COMPLETE_FORBIDDEN:
    "Somente o supervisor atribuído, ou quem tem gestão global de atividades, pode concluir a atividade.",
  ACTIVITY_STAGE_WITHOUT_IMPLEMENTATION:
    "Uma etapa só pode ser usada dentro de uma implantação.",
  STAGE_IMPLEMENTATION_MISMATCH: "A etapa não pertence a esta implantação.",
  IMPLEMENTATION_ALREADY_CANCELLED: "Esta implantação já está cancelada.",
  IMPLEMENTATION_CANCELLED:
    "Não é possível vincular uma atividade a uma implantação cancelada.",
  ACTIVITY_ALREADY_INDEPENDENT: "A atividade já está independente.",
  ACTIVITY_ALREADY_COMPLETED: "A atividade já foi concluída.",
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
