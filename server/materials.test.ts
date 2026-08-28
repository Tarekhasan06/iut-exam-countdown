import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "materials-test-user",
    email: "materials@example.com",
    name: "Materials Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("materials.upload", () => {
  it("rejects unsupported file types before touching storage", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.materials.upload({
        fileName: "notes.exe",
        mimeType: "application/x-msdownload",
        fileSize: 4,
        dataBase64: "dGVzdA==",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects payloads whose decoded bytes do not match the declared size", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.materials.upload({
        fileName: "notes.txt",
        mimeType: "text/plain",
        fileSize: 99,
        dataBase64: "dGVzdA==",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
