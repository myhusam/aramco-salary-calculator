import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { host: "localhost" } } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("salaryCertificate.extract", () => {
  it("rejects unsupported file types before processing", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.salaryCertificate.extract({
      fileName: "certificate.txt",
      mimeType: "text/plain" as never,
      base64: "dGVzdA==",
    })).rejects.toThrow();
  });
});
