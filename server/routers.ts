import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { deleteSharedStudyMaterial, deleteStudyMaterial, insertStudyMaterial, listSharedStudyMaterials, listStudyMaterials } from "./db";
import { storagePut } from "./storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"]);

function safeFileName(fileName: string) {
  const normalized = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
  return normalized.replace(/^-+|-+$/g, "") || "study-material";
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  materials: router({
    list: protectedProcedure.query(({ ctx }) => listStudyMaterials(ctx.user.id)),
    shared: publicProcedure.query(() => listSharedStudyMaterials()),

    upload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(128),
        fileSize: z.number().int().positive().max(MAX_FILE_SIZE),
        dataBase64: z.string().min(1).max(14_000_000),
        visibility: z.enum(["private", "shared"]).default("private"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.visibility === "shared" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can publish official materials." });
        }
        if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported file type." });
        }

        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.length !== input.fileSize) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "File payload size did not match its metadata." });
        }

        const stored = await storagePut(
          `study-materials/${input.visibility}/${ctx.user.id}/${safeFileName(input.fileName)}`,
          bytes,
          input.mimeType,
        );
        const created = await insertStudyMaterial({
          userId: ctx.user.id,
          fileKey: stored.key,
          fileUrl: stored.url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          visibility: input.visibility,
        });

        if (!created) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "File metadata could not be saved." });
        }
        return created;
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await deleteStudyMaterial(ctx.user.id, input.id);
        return { success: true } as const;
      }),

    removeShared: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteSharedStudyMaterial(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
