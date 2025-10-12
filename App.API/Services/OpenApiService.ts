import { exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { InternalServerError } from "../Errors/HttpErrors";

let isGenerating = false;
let lastGeneratedAt: Date | null = null;

export class OpenApiService {
  static getStatus() {
    return { isGenerating, lastGeneratedAt };
  }

  static async needsRegeneration(): Promise<boolean> {
    // Simple check: if spec file doesn't exist, it needs generation
    try {
      await fs.access(path.join(__dirname, "../../dist/swagger.json"));
      return false; // File exists
    } catch {
      return true; // File does not exist
    }
  }

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
