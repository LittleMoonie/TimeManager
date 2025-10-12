import { generateSpec, generateRoutes } from "tsoa";
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
      const specOptions = {
        // Your tsoa spec options here
      };
      const routeOptions = {
        // Your tsoa route options here
      };

      await generateSpec(specOptions);
      await generateRoutes(routeOptions);

      if (includeFrontend) {
        await new Promise((resolve, reject) => {
          exec("yarn api:client", (err, stdout, stderr) => {
            if (err) {
              return reject(
                new InternalServerError(
                  `Frontend client generation failed: ${stderr}`,
                ),
              );
            }
            resolve(stdout);
          });
        });
      }

      lastGeneratedAt = new Date();
      return { success: true, message: "Generated successfully", generatedAt: lastGeneratedAt };
    } catch (error: any) {
      throw new InternalServerError(`OpenAPI generation failed: ${error.message}`);
    } finally {
      isGenerating = false;
    }
  }
}
