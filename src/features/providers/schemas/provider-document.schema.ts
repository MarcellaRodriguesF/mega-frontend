import { z } from "zod";

export const PROVIDER_DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const PROVIDER_DOCUMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.doc,.docx,.xls,.xlsx";

export const NO_DOCUMENT_UNIT = "__no_unit__";

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "txt",
  "doc",
  "docx",
  "xls",
  "xlsx",
]);

function fileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");

  if (index <= 0) return "";

  return fileName.slice(index + 1).toLowerCase();
}

export function createProviderDocumentFormSchema(requireFile: boolean) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "O nome do documento é obrigatório.")
        .max(150, "O nome deve ter no máximo 150 caracteres."),

      type: z
        .string()
        .max(50, "O tipo deve ter no máximo 50 caracteres.")
        .transform((value) => value.trim() || null),

      unitId: z
        .string()
        .transform((value) =>
          value === "" || value === NO_DOCUMENT_UNIT ? null : value,
        )
        .pipe(z.string().uuid("Unidade inválida.").nullable()),

      file: z.custom<File | null>(
        (value) => value === null || value instanceof File,
        "Selecione um arquivo válido.",
      ),

      observations: z
        .string()
        .trim()
        .transform((value) => value || null),
    })
    .superRefine((data, context) => {
      if (requireFile && !(data.file instanceof File)) {
        context.addIssue({
          code: "custom",
          path: ["file"],
          message: "Selecione um arquivo.",
        });
        return;
      }

      if (!(data.file instanceof File)) return;

      if (data.file.size <= 0) {
        context.addIssue({
          code: "custom",
          path: ["file"],
          message: "O arquivo está vazio.",
        });
      }

      if (data.file.size > PROVIDER_DOCUMENT_MAX_SIZE_BYTES) {
        context.addIssue({
          code: "custom",
          path: ["file"],
          message: "O arquivo excede o tamanho máximo de 10 MB.",
        });
      }

      if (!ALLOWED_EXTENSIONS.has(fileExtension(data.file.name))) {
        context.addIssue({
          code: "custom",
          path: ["file"],
          message:
            "Tipo de arquivo não permitido. Envie PDF, imagem, TXT ou documento do Office.",
        });
      }
    });
}

const providerDocumentFormSchema = createProviderDocumentFormSchema(true);

export type ProviderDocumentFormInput = z.input<
  typeof providerDocumentFormSchema
>;

export type ProviderDocumentFormData = z.output<
  typeof providerDocumentFormSchema
>;

export const providerDocumentDefaultValues: ProviderDocumentFormInput = {
  name: "",
  type: "",
  unitId: NO_DOCUMENT_UNIT,
  file: null,
  observations: "",
};
