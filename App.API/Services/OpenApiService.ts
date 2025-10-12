import { exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { InternalServerError } from "../Errors/HttpErrors";

let isGenerating = false;
let lastGeneratedAt: Date | null = null;

/**
 * @description Service for managing OpenAPI specification generation. This service handles the logic
 * for checking the status of generation, determining if regeneration is needed, and executing the generation process.
 */
export class OpenApiService {
  /**
   * @description Retrieves the current status of the OpenAPI specification generation process.
   * @returns An object containing `isGenerating` (boolean indicating if a generation is in progress) and `lastGeneratedAt` (Date of the last successful generation).
   */
  static getStatus() {
    return { isGenerating, lastGeneratedAt };
  }

  /**
   * @description Determines if the OpenAPI specification needs to be regenerated. Currently, it checks if the `swagger.json` file exists.
   * @returns A Promise that resolves to `true` if regeneration is needed (file does not exist), `false` otherwise.
   */
  static async needsRegeneration(): Promise<boolean> {
    // Simple check: if spec file doesn't exist, it needs generation
    try {
      await fs.access(path.join(__dirname, "../../dist/swagger.json"));
      return false; // File exists
    } catch {
      return true; // File does not exist
    }
  }

  /**
   * @description Initiates the OpenAPI specification generation process. It can optionally include frontend client generation.
   * @param includeFrontend If `true`, both OpenAPI spec and frontend client are generated. Otherwise, only the OpenAPI spec.
   * @returns A Promise that resolves to an object indicating the success status, a message, and the generation timestamp.
   * @throws {InternalServerError} If the API generation process fails.
   */
  static async generateOpenApiSpec(includeFrontend: boolean) {
    if (isGenerating) {
      return { success: false, message: "Generation already in progress" };
    }

    isGenerating = true;

    try {
      const command = includeFrontend ? "yarn api:sync" : "yarn api:generate";

      await new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
          if (err) {
            return reject(
              new InternalServerError(`API generation failed: ${stderr}`),
            );
          }
          resolve(stdout);
        });
      });

      lastGeneratedAt = new Date();
      return {
        success: true,
        message: "Generated successfully",
        generatedAt: lastGeneratedAt,
      };
    } catch (error: any) {
      throw new InternalServerError(`API generation failed: ${error.message}`);
    } finally {
      isGenerating = false;
    }
  }
}
