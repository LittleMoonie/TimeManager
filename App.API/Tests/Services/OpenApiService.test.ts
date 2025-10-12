import { OpenApiService } from "../../Services/OpenApiService";
import { exec } from "child_process";
import * as fs from "fs/promises";
import { InternalServerError } from "../../Errors/HttpErrors";

// ---- Dual mocks (CJS + ESM paths) for Node 18+ and Node 20+ ----
jest.mock("child_process", () => ({ exec: jest.fn() }));
jest.mock("node:child_process", () => ({ exec: jest.fn() }));

jest.mock("fs/promises", () => ({ access: jest.fn() }));
jest.mock("node:fs/promises", () => ({ access: jest.fn() }));

// Optional: bcryptjs stub, if imported indirectly
jest.mock("bcryptjs", () => ({ hash: jest.fn(), compare: jest.fn() }));

describe("OpenApiService", () => {
  const mockedExec = exec as unknown as jest.MockedFunction<typeof exec>;
  const mockedAccess = fs.access as unknown as jest.MockedFunction<typeof fs.access>;

  beforeEach(() => {
    (OpenApiService as any).isGenerating = false;
    (OpenApiService as any).lastGeneratedAt = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up persistent state between test runs
    (OpenApiService as any).isGenerating = false;
    (OpenApiService as any).lastGeneratedAt = null;
  });

  // ---------------------- getStatus ----------------------
  describe("getStatus", () => {
    it("returns current generation status", () => {
      (OpenApiService as any).isGenerating = true;
      const now = new Date();
      (OpenApiService as any).lastGeneratedAt = now;

      const status = OpenApiService.getStatus();

      expect(status.isGenerating).toBe(true);
      expect(status.lastGeneratedAt).toBe(now);
    });
  });

  // ---------------------- needsRegeneration ----------------------
  describe("needsRegeneration", () => {
    it("returns true if swagger.json does not exist", async () => {
      mockedAccess.mockRejectedValueOnce(new Error("ENOENT"));
      const result = await OpenApiService.needsRegeneration();
      expect(result).toBe(true);
      expect(mockedAccess).toHaveBeenCalled();
    });

    it("returns false if swagger.json exists", async () => {
      mockedAccess.mockResolvedValueOnce(undefined as any);
      const result = await OpenApiService.needsRegeneration();
      expect(result).toBe(false);
    });
  });

  // ---------------------- generateOpenApiSpec ----------------------
  describe("generateOpenApiSpec", () => {
    it("executes 'yarn api:sync' when includeFrontend = true", async () => {
      mockedExec.mockImplementation((cmd: any, cb: any) => cb?.(null, "", ""));
      await OpenApiService.generateOpenApiSpec(true);
      expect(mockedExec).toHaveBeenCalledWith("yarn api:sync", expect.any(Function));
    });

    it("executes 'yarn api:generate' when includeFrontend = false", async () => {
      mockedExec.mockImplementation((cmd: any, cb: any) => cb?.(null, "", ""));
      await OpenApiService.generateOpenApiSpec(false);
      expect(mockedExec).toHaveBeenCalledWith("yarn api:generate", expect.any(Function));
    });

    it("updates internal flags and returns success result", async () => {
      mockedExec.mockImplementation((cmd: any, cb: any) => cb?.(null, "", ""));
      const before = Date.now();

      const result = await OpenApiService.generateOpenApiSpec(false);

      expect(result.success).toBe(true);
      expect((OpenApiService as any).isGenerating).toBe(false);
      expect((OpenApiService as any).lastGeneratedAt).toBeInstanceOf(Date);
      expect((OpenApiService as any).lastGeneratedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it("returns failure result if generation already in progress", async () => {
      (OpenApiService as any).isGenerating = true;
      const result = await OpenApiService.generateOpenApiSpec(false);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Generation already in progress");
    });

    it("throws InternalServerError if exec fails", async () => {
      mockedExec.mockImplementation((cmd: any, cb: any) =>
        cb?.(new Error("Exec failed"), "", "stderr")
      );

      await expect(OpenApiService.generateOpenApiSpec(false)).rejects.toThrow(
        InternalServerError
      );

      await expect(OpenApiService.generateOpenApiSpec(false)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringMatching(/internal/i),
        })
      );
    });
  });
});
