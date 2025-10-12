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

/**
 * @summary Controller for system-related operations, including health checks and OpenAPI specification management.
 */
@Route("system")
@Tags("System")
@Service()
export class SystemController extends Controller {
  /**
   * @summary Provides an enhanced health check for the API, including its uptime and the status of OpenAPI specification generation.
   * @param {boolean} [autoGen] - If true, triggers OpenAPI specification regeneration if needed.
   * @returns {Promise<HealthResponse>} The current health status of the system.
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
   * @summary Manually triggers the generation of the OpenAPI specification.
   * @param {boolean} [frontend] - If true, also generates the frontend API client.
   * @returns {Promise<GenerateResponse>} The result of the generation attempt.
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
   * @summary Retrieves the current status of the OpenAPI specification generation.
   * @returns {Promise<object>} An object containing information about the generation status, including whether it's currently generating, when it was last generated, and if it needs regeneration.
   */
  @Get("/openapi-status")
  @SuccessResponse("200", "OpenAPI status retrieved")
  public async getOpenApiStatus(): Promise<object> {
    const { isGenerating, lastGeneratedAt } = OpenApiService.getStatus();
    const needsRegeneration = await OpenApiService.needsRegeneration();

    return {
      isGenerating,
      lastGeneratedAt: lastGeneratedAt?.toISOString(),
      needsRegeneration,
    };
  }
}
