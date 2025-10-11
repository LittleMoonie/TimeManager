import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Security,
  Request,
  Get,
} from "tsoa";
import { validate } from "class-validator";
import { Request as ExpressRequest } from "express";
import { LoginDto } from "../../Dtos/Authentication/LoginDto";
import { RegisterDto } from "../../Dtos/Authentication/RegisterDto";
import { AuthenticationService } from "../../Services/AuthenticationService/AuthenticationService";
import { AuthResponse, UserResponseDto } from "../../Dtos/Users/UserDto";
import User from "../../Entities/Users/User";
import { Service } from "typedi";
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../Errors/HttpErrors";

@Route("auth")
@Tags("Authentication")
@Service()
export class AuthenticationController extends Controller {
  constructor(private authenticationService: AuthenticationService) {
    super();
  }

  /**
   * Register a new user
   * @param requestBody User registration data
   * @returns Registration result
   */
  @Post("register")
  @SuccessResponse("201", "User registered successfully")
  @Response<AuthResponse>("422", "Validation error")
  @Response<AuthResponse>("400", "Email already exists")
  @Response<AuthResponse>("500", "Internal server error")
  public async register(
    @Body() requestBody: RegisterDto,
  ): Promise<UserResponseDto> {
    const errors = await validate(requestBody);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(", ")}`,
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
      phone: user.phoneNumber,
      lastLogin: user.lastLogin,
    };
  }

  /**
   * Login user and get JWT token
   * @param requestBody User login credentials
   * @returns Authentication result with JWT token
   */
  @Post("login")
  @SuccessResponse("200", "User logged in successfully")
  @Response<AuthResponse>("422", "Validation error")
  @Response<AuthResponse>("401", "Wrong credentials")
  @Response<AuthResponse>("500", "Internal server error")
  public async login(
    @Body() requestBody: LoginDto,
    @Request() request: ExpressRequest,
  ): Promise<AuthResponse> {
    const errors = await validate(requestBody);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(", ")}`,
      );
    }

    const authResponse = await this.authenticationService.login(
      requestBody,
      request.ip,
      request.headers["user-agent"],
    );

    if (request.res) {
      request.res.cookie("jwt", authResponse.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });
    }

    return {
      token: authResponse.token,
      user: {
        id: authResponse.user.id,
        email: authResponse.user.email,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        companyId: authResponse.user.companyId,
        roleId: authResponse.user.roleId,
        statusId: authResponse.user.statusId,
        createdAt: authResponse.user.createdAt,
        phone: authResponse.user.phone,
        lastLogin: authResponse.user.lastLogin,
        company: authResponse.user.company
          ? {
              id: authResponse.user.company.id,
              name: authResponse.user.company.name,
              timezone: authResponse.user.company.timezone,
            }
          : undefined,
        status: authResponse.user.status
          ? {
              id: authResponse.user.status.id,
              code: authResponse.user.status.code,
              name: authResponse.user.status.name,
              description: authResponse.user.status.description,
              canLogin: authResponse.user.status.canLogin,
              isTerminal: authResponse.user.status.isTerminal,
            }
          : undefined,
      },
    };
  }

  /**
   * Logout user and invalidate token
   * @param request Express request object containing headers
   * @returns Logout result
   */
  @Post("logout")
  @Security("jwt")
  @SuccessResponse("200", "User logged out successfully")
  @Response<AuthResponse>("401", "Authentication required")
  @Response<AuthResponse>("500", "Internal server error")
  public async logout(
    @Request() request: ExpressRequest,
  ): Promise<AuthResponse> {
    const token =
      request.cookies?.jwt || request.headers?.authorization?.split(" ")[1];

    if (!token) {
      throw new NotFoundError("No token provided");
    }

    await this.authenticationService.logout(request.user);

    // Clear HttpOnly cookie
    if (request.res) {
      request.res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return {
      token: "",
      user: {
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        companyId: "",
        roleId: "",
        statusId: "",
        createdAt: new Date(),
        phone: "",
        lastLogin: new Date(),
      },
    };
  }
  /**
   * Get current user
   * @param request Express request object containing headers
   * @returns Current user
   */
  @Get("current")
  @Security("jwt")
  @SuccessResponse("200", "Current user retrieved successfully")
  @Response<AuthResponse>("401", "Authentication required")
  @Response<AuthResponse>("500", "Internal server error")
  public async getCurrentUser(
    @Request() request: ExpressRequest,
  ): Promise<UserResponseDto> {
    if (!request.user) {
      throw new ForbiddenError("User not authenticated");
    }
    const user = request.user as User;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      roleId: user.roleId,
      statusId: user.statusId,
      createdAt: user.createdAt,
      phone: user.phoneNumber,
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
