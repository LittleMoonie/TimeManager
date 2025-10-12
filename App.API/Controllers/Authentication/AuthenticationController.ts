import { Request as ExpressRequest } from "express";
import { LoginDto } from "../../Dtos/Authentication/LoginDto";
import { RegisterDto } from "../../Dtos/Authentication/RegisterDto";
import { AuthenticationService } from "../../Services/AuthenticationService/AuthenticationService";
import { AuthResponse, UserDto } from "../../Dtos/Users/UserDto";
import { Service } from "typedi";
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../Errors/HttpErrors";
import { validate } from "class-validator";
import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Response,
  Get,
  Security,
  Request, // Import Request decorator
} from "tsoa";

/**
 * @summary Handles user authentication and authorization.
 * @tags Authentication
 */
@Route("auth")
@Tags("Authentication")
@Service()
// @Service()
export class AuthenticationController extends Controller {
  constructor(private authenticationService: AuthenticationService) {
    super();
  }

  /**
   * @summary Registers a new user with the provided details.
   * @param {RegisterDto} requestBody - The registration data for the new user.
   * @returns {Promise<UserDto>} The newly registered user's details.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {Error} If email already exists or other internal server error.
   */
  @Post("/register")
  @SuccessResponse("201", "User registered successfully")
  @Response("400", "Email already exists")
  @Response("422", "Validation error")
  @Response("500", "Internal server error")
  public async register(
    @Body() requestBody: RegisterDto,
  ): Promise<UserDto> {
    const errors = await validate(requestBody);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(", ")}`,
      );
    }

    const user = await this.authenticationService.register(requestBody);
    this.setStatus(201); // tsoa specific
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
   * @summary Logs in a user and provides a JWT token.
   * @param {LoginDto} requestBody - The login credentials (email and password).
   * @param {ExpressRequest} request - The Express request object, used for IP and user-agent.
   * @returns {Promise<AuthResponse>} An object containing the JWT token and user details.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {Error} If wrong credentials or other internal server error.
   */
  @Post("/login")
  @SuccessResponse("200", "User logged in successfully")
  @Response("401", "Wrong credentials")
  @Response("422", "Validation error")
  @Response("500", "Internal server error")
  public async login(
    @Body() requestBody: LoginDto,
    @Request() request: ExpressRequest, // Added @Request() decorator
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
   * @summary Logs out the current user and invalidates their token.
   * @param {ExpressRequest} request - The Express request object, used to clear the JWT cookie.
   * @returns {Promise<AuthResponse>} An empty AuthResponse after successful logout.
   * @throws {NotFoundError} If no token is provided.
   * @throws {Error} If internal server error.
   */
  @Post("/logout")
  @Security("jwt")
  @SuccessResponse("200", "User logged out successfully")
  @Response("401", "Authentication required")
  @Response("500", "Internal server error")
  public async logout(
    @Request() request: ExpressRequest, // Added @Request() decorator
  ): Promise<AuthResponse> {
    const token =
      request.cookies?.jwt || request.headers?.authorization?.split(" ")[1];

    if (!token) {
      throw new NotFoundError("No token provided");
    }

    await this.authenticationService.logout(request.user as string);

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
   * @summary Retrieves the details of the currently authenticated user.
   * @param {ExpressRequest} request - The Express request object, containing user information.
   * @returns {Promise<UserDto>} The details of the current user.
   * @throws {ForbiddenError} If the user is not authenticated.
   * @throws {Error} If internal server error.
   */
  @Get("/current")
  @Security("jwt")
  @SuccessResponse("200", "Current user retrieved successfully")
  @Response("401", "Authentication required")
  @Response("403", "Forbidden: User not authenticated")
  @Response("500", "Internal server error")
  public async getCurrentUser(
    @Request() request: ExpressRequest, // Added @Request() decorator
  ): Promise<UserDto> {
    if (!request.user) {
      throw new ForbiddenError("User not authenticated");
    }
    const user = request.user as UserDto;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      roleId: user.roleId,
      statusId: user.statusId,
      createdAt: user.createdAt,
      phone: user.phone,
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
