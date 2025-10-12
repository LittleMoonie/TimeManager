// App.API/Controllers/Authentication/AuthenticationController.ts
import { Request as ExpressRequest } from "express";
import { LoginDto, RegisterDto } from "@/Dtos/Authentication/AuthenticationDto"; // unified file
import { AuthenticationService } from "@/Services/AuthenticationService/AuthenticationService";
import { UserResponseDto } from "@/Dtos/Users/UserResponseDto";
import { Service } from "typedi";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "@/Errors/HttpErrors";
import { validate } from "class-validator";
import {
  Body, Controller, Post, Route, Tags, SuccessResponse, Response, Get, Security, Request,
} from "tsoa";

@Route("auth")
@Tags("Authentication")
@Service()
export class AuthenticationController extends Controller {
  constructor(private authenticationService: AuthenticationService) {
    super();
  }

  @Post("/register")
  @SuccessResponse("201", "User registered successfully")
  public async register(@Body() requestBody: RegisterDto): Promise<UserResponseDto> {
    const errors = await validate(requestBody);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`,
      );
    }

    const user = await this.authenticationService.register(requestBody);
    this.setStatus(201);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      roleId: user.roleId,
      statusId: user.statusId,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      lastLogin: user.lastLogin,
    };
  }

  @Post("/login")
  @SuccessResponse("200", "User logged in successfully")
  public async login(
    @Body() requestBody: LoginDto,
    @Request() request: ExpressRequest,
  ) {
    const errors = await validate(requestBody);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map(e => e.toString()).join(", ")}`,
      );
    }

    const authResponse = await this.authenticationService.login(
      requestBody,
      request.ip,
      request.headers["user-agent"],
    );

    // Set cookies
    request.res?.cookie("jwt", authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day (matches JWT expiry)
      sameSite: "lax",
    });
    request.res?.cookie("refreshToken", authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    // Return the same payload as before (omit refreshToken from body if you prefer cookie-only)
    return {
      token: authResponse.token,
      user: authResponse.user,
    };
  }

  @Post("/logout")
  @Security("jwt")
  @SuccessResponse("204", "User logged out successfully")
  public async logout(
    @Request() request: ExpressRequest,
  ): Promise<void> {
    const refreshToken =
      request.cookies?.refreshToken ||
      (request.headers["x-refresh-token"] as string | undefined);

    if (!refreshToken) {
      throw new NotFoundError("No refresh token provided");
    }

    const companyId = (request.user as UserResponseDto)?.companyId;
    await this.authenticationService.logout(companyId, refreshToken);

    // Clear cookies
    request.res?.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    request.res?.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    this.setStatus(204);
  }

  @Get("/current")
  @Security("jwt")
  public async getCurrentUser(@Request() request: ExpressRequest): Promise<UserResponseDto> {
    if (!request.user) {
      throw new ForbiddenError("User not authenticated");
    }
    const user = request.user as UserResponseDto;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      roleId: user.roleId,
      statusId: user.statusId,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      lastLogin: user.lastLogin,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            timezone: user.company.timezone,
          }
        : undefined,
      status: user.status
        ? {
            id: user.status.id,
            code: user.status.code,
            name: user.status.name,
            description: user.status.description,
            canLogin: user.status.canLogin,
            isTerminal: user.status.isTerminal,
          }
        : undefined,
    };
  }
}
