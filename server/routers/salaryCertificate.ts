import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { publicProcedure, router } from "../_core/trpc";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
type ExtractedSalary = { basicSalary: number | null; housing: number | null; housingBasis: "annual" | "percent" | "monthly" | "unknown" | null; bonus: number | null; transportation: number | null; otherAllowances: number | null; currency: string | null; confidence: "high" | "medium" | "low"; notes: string[] };
const acceptedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

const extractionSchema = {
  type: "object",
  properties: {
    basicSalary: { type: ["number", "null"], description: "Monthly basic salary amount exactly as printed, or null if not found." },
    housing: { type: ["number", "null"], description: "Housing amount exactly as printed, or null if not found." },
    housingBasis: { type: ["string", "null"], enum: ["annual", "percent", "monthly", "unknown", null], description: "Whether housing is annual, a percentage, monthly, or unknown." },
    bonus: { type: ["number", "null"], description: "Ramadan allowance, bonus, or equivalent amount exactly as printed, or null if not found." },
    transportation: { type: ["number", "null"], description: "Transportation allowance amount, or null if not found." },
    otherAllowances: { type: ["number", "null"], description: "Other allowance amount, or null if not found." },
    currency: { type: ["string", "null"], description: "Currency code or symbol shown on the document, or null if not found." },
    confidence: { type: "string", enum: ["high", "medium", "low"], description: "Overall confidence in the extraction." },
    notes: { type: "array", items: { type: "string" }, description: "Short notes about ambiguity, missing fields, or the source labels used." },
  },
  required: ["basicSalary", "housing", "housingBasis", "bonus", "transportation", "otherAllowances", "currency", "confidence", "notes"],
  additionalProperties: false,
} as const;

function absoluteStorageUrl(req: { protocol?: string; headers: Record<string, unknown> }, relativeUrl: string) {
  const forwardedProto = typeof req.headers["x-forwarded-proto"] === "string" ? req.headers["x-forwarded-proto"] : req.protocol || "https";
  const host = typeof req.headers.host === "string" ? req.headers.host : "localhost";
  return `${forwardedProto}://${host}${relativeUrl}`;
}

export const salaryCertificateRouter = router({
  extract: publicProcedure
    .input(z.object({
      fileName: z.string().min(1).max(180),
      mimeType: z.enum(acceptedMimeTypes),
      base64: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const fileBuffer = Buffer.from(input.base64, "base64");
      if (fileBuffer.length === 0 || fileBuffer.length > MAX_FILE_BYTES) {
        throw new Error("Please upload a certificate smaller than 8 MB.");
      }

      const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const stored = await storagePut(`salary-certificates/${Date.now()}-${safeFileName}`, fileBuffer, input.mimeType);
      const documentUrl = absoluteStorageUrl(ctx.req, stored.url);
      const content = input.mimeType === "application/pdf"
        ? [{ type: "text" as const, text: "Read this salary certificate and extract the requested salary fields." }, { type: "file_url" as const, file_url: { url: documentUrl, mime_type: "application/pdf" as const } }]
        : [{ type: "text" as const, text: "Read this salary certificate image and extract the requested salary fields." }, { type: "image_url" as const, image_url: { url: documentUrl, detail: "high" as const } }];

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You extract salary figures from salary certificates. Return only values that are visibly present. Never infer, calculate, or invent a missing amount. Preserve the document's amount basis: monthly, annual, or percentage. Saudi salary certificates may label basic salary as Basic Salary, housing as Housing Allowance, and Ramadan/bonus as Ramadan Allowance, Bonus, or Annual Bonus. If a field is missing or ambiguous, return null and explain briefly in notes.",
          },
          { role: "user", content },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "salary_certificate_extraction",
            strict: true,
            schema: extractionSchema,
          },
        },
      });

      const rawContent = response.choices?.[0]?.message?.content;
      if (typeof rawContent !== "string") throw new Error("The certificate could not be read. Please check the document and try again.");
      return {
        fileName: input.fileName,
        extraction: JSON.parse(rawContent) as ExtractedSalary,
      };
    }),
});
