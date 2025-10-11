import {
  Controller,
  Get,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Response,
  Query,
} from "tsoa";
import { OpenApiService } from "../../Services/OpenApiService";
import { Service } from "typedi";

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  openapi?: {
    lastGenerated?: string;
    needsRegeneration?: boolean;
  };
}

interface GenerateResponse {
  success: boolean;
  message: string;
  generatedAt?: string;
}

@Route("system")
@Tags("System")
@Service()
export class SystemController extends Controller {
  /**
   * Enhanced health check with OpenAPI status
   */
  @Get("/health")
  @SuccessResponse("200", "System is healthy")
  public async getHealth(@Query() autoGen?: boolean): Promise<HealthResponse> {
    const { lastGeneratedAt } = OpenApiService.getStatus();
    const needsRegeneration = await OpenApiService.needsRegeneration();

    const response: HealthResponse = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      openapi: {
        lastGenerated: lastGeneratedAt?.toISOString(),
        needsRegeneration,
      },
    };

    // Auto-generate if requested and needed
    if (autoGen === true && needsRegeneration) {
      console.log(
        "🔄 Auto-generating OpenAPI spec (triggered by health check)",
      );

      // Run generation asynchronously (don't block health check response)
      OpenApiService.generateOpenApiSpec(true)
        .then((result) => {
          if (result.success) {
            console.log("✅ Auto-generation completed successfully");
          } else {
            console.error("❌ Auto-generation failed:", result.message);
          }
        })
        .catch((error) => {
          console.error("❌ Auto-generation error:", error);
        });
    }

    return response;
  }

  /**
   * Manually trigger OpenAPI spec generation
   */
  @Post("/generate-openapi")
  @SuccessResponse("200", "OpenAPI generation triggered")
  @Response("409", "Generation already in progress")
  @Response("500", "Generation failed")
  public async generateOpenApi(
    @Query() frontend?: boolean,
  ): Promise<GenerateResponse> {
    const includeFrontend = frontend === true;

    const result = await OpenApiService.generateOpenApiSpec(includeFrontend);

    if (!result.success) {
      this.setStatus(result.message.includes("progress") ? 409 : 500);
    }

    return {
      success: result.success,
      message: result.message,
      generatedAt: result.generatedAt?.toISOString(),
    };
  }

  /**
   * Get OpenAPI generation status
   */
  @Get("/openapi-status")
  @SuccessResponse("200", "OpenAPI status retrieved")
  public async getOpenApiStatus() {
    const { isGenerating, lastGeneratedAt } = OpenApiService.getStatus();
    const needsRegeneration = await OpenApiService.needsRegeneration();

    return {
      isGenerating,
      lastGeneratedAt: lastGeneratedAt?.toISOString(),
      needsRegeneration,
    };
  }
}
