import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "materials-test-user",
    email: "materials@example.com",
    name: "Materials Test User",
    loginMethod: "manus",
    role,
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

  it("rejects shared publishing from regular students", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(
      caller.materials.upload({
        fileName: "routine.pdf",
        mimeType: "application/pdf",
        fileSize: 4,
        dataBase64: "dGVzdA==",
        visibility: "shared",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admins past the shared-publishing permission check", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(
      caller.materials.upload({
        fileName: "routine.exe",
        mimeType: "application/x-msdownload",
        fileSize: 4,
        dataBase64: "dGVzdA==",
        visibility: "shared",
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
