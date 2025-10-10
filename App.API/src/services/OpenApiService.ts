import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export class OpenApiService {
  private static isGenerating = false;
  private static lastGeneratedAt: Date | null = null;

  /**
   * Generate OpenAPI spec and optionally frontend client
   */
  static async generateOpenApiSpec(includeFrontend: boolean = false): Promise<{
    success: boolean;
    message: string;
    generatedAt?: Date;
  }> {
    if (this.isGenerating) {
      return {
        success: false,
        message: 'Generation already in progress'
      };
    }

    this.isGenerating = true;
    const startTime = new Date();

    try {
      console.log('🔄 Generating OpenAPI specification...');
      
      // Generate OpenAPI spec and routes
      const { stdout: specOutput, stderr: specError } = await execAsync('yarn openapi:generate');
      
      if (specError && !specError.includes('warning')) {
        throw new Error(`OpenAPI generation failed: ${specError}`);
      }

      // Verify swagger.json was created
      const swaggerPath = path.join(process.cwd(), 'swagger.json');
      await fs.access(swaggerPath);
      
      console.log('✅ OpenAPI spec generated successfully');

      // Generate frontend client if requested
      if (includeFrontend) {
        console.log('🔄 Generating frontend TypeScript client...');
        
        const { stdout: clientOutput, stderr: clientError } = await execAsync(
          'cd ../../../../App.Web && yarn api:client'
        );
        
        if (clientError && !clientError.includes('warning')) {
          console.warn(`⚠️ Frontend client generation warning: ${clientError}`);
        } else {
          console.log('✅ Frontend client generated successfully');
        }
      }

      this.lastGeneratedAt = new Date();
      
      return {
        success: true,
        message: includeFrontend 
          ? 'OpenAPI spec and frontend client generated successfully'
          : 'OpenAPI spec generated successfully',
        generatedAt: this.lastGeneratedAt
      };

    } catch (error) {
      console.error('❌ OpenAPI generation failed:', error);
      
      return {
        success: false,
        message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Check if OpenAPI spec needs regeneration based on file timestamps
   */
  static async needsRegeneration(): Promise<boolean> {
    try {
      const swaggerPath = path.join(process.cwd(), 'swagger.json');
      const controllersPath = path.join(process.cwd(), 'src/controllers');
      const dtosPath = path.join(process.cwd(), 'src/dto');

      // Check if swagger.json exists
      try {
        await fs.access(swaggerPath);
      } catch {
        console.log('📝 swagger.json not found, regeneration needed');
        return true;
      }

      // Get swagger.json modification time
      const swaggerStats = await fs.stat(swaggerPath);
      const swaggerTime = swaggerStats.mtime;

      // Check if any controller or DTO files are newer
      const checkDirectory = async (dirPath: string): Promise<boolean> => {
        try {
          const files = await fs.readdir(dirPath, { withFileTypes: true });
          
          for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            
            if (file.isDirectory()) {
              if (await checkDirectory(filePath)) return true;
            } else if (file.name.endsWith('.ts')) {
              const fileStats = await fs.stat(filePath);
              if (fileStats.mtime > swaggerTime) {
                console.log(`📝 File ${filePath} is newer than swagger.json, regeneration needed`);
                return true;
              }
            }
          }
        } catch (error) {
          // Directory doesn't exist, skip
        }
        return false;
      };

      return await checkDirectory(controllersPath) || await checkDirectory(dtosPath);

    } catch (error) {
      console.log('📝 Error checking regeneration need, assuming needed:', error);
      return true;
    }
  }

  /**
   * Get generation status
   */
  static getStatus() {
    return {
      isGenerating: this.isGenerating,
      lastGeneratedAt: this.lastGeneratedAt
    };
  }
}
