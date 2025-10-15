# 🔐 API Authentication and Authorization

Secure access to the GoGoTime API is paramount. This document outlines the authentication and authorization mechanisms implemented to protect our API endpoints and ensure data integrity.

## 🔑 Authentication

Authentication is the process of verifying the identity of a user or client attempting to access the API. The GoGoTime API utilizes **JSON Web Tokens (JWT)** for stateless authentication.

### JSON Web Tokens (JWT)

JWTs are an open, industry-standard RFC 7519 method for representing claims securely between two parties. They are widely used for authentication and information exchange.

**How it Works:**

1.  **Login**: A user sends their credentials (e.g., email and password) to the API's login endpoint.
2.  **Token Issuance**: Upon successful authentication, the API generates two tokens:
    - **Access Token**: A short-lived JWT used to authenticate subsequent API requests.
    - **Refresh Token**: A longer-lived token used to obtain new access tokens without requiring the user to re-authenticate.
3.  **API Requests**: For every subsequent API request to a protected endpoint, the client must include the access token in the `Authorization` header as a Bearer token.

    ```http
    Authorization: Bearer <your_access_token>
    ```

4.  **Token Validation**: The API validates the access token on each request. If valid, the request is processed; otherwise, an `401 Unauthorized` error is returned.
5.  **Token Refresh**: When an access token expires, the client can use the refresh token to request a new access token from a dedicated refresh endpoint.

### Authentication Architecture Highlights

Our JWT implementation is supported by:

- **Secure Password Hashing**: Using `argon2` for robust password storage.
- **Refresh Token Management**: Long-lived refresh tokens are stored securely in the database (via `ActiveSessionService`) and can be used to obtain new access tokens.
- **Token Storage**: Access tokens are typically used as Bearer tokens, while refresh tokens can be managed via HttpOnly cookies for web clients.
- **Authentication Flow**: A clear flow ensures secure login, token issuance, and refresh mechanisms.

## 🛡️ Authorization

Authorization is the process of determining whether an authenticated user has permission to perform a specific action or access a particular resource. The GoGoTime API implements **Role-Based Access Control (RBAC)**.

### Role-Based Access Control (RBAC)

RBAC is a method of restricting system access to authorized users. Permissions are associated with roles, and users are assigned to appropriate roles.

**Key Concepts:**

- **Roles**: Collections of permissions (e.g., `Admin`, `Employee`, `Manager`).
- **Permissions**: Specific actions that can be performed (e.g., `read:user`, `create:timesheet`, `update:company`).
- **Users**: Assigned one or more roles.

**How it Works:**

1.  **Role Assignment**: Each user in the GoGoTime platform is assigned one or more roles.
2.  **Permission Definition**: Each role is associated with a set of granular permissions.
3.  **Endpoint Protection**: API endpoints are protected by specifying the required roles or permissions.
4.  **Access Check**: When an authenticated user makes a request, the API checks if the user's assigned roles have the necessary permissions to access the requested resource or perform the action.

### Granular Permissions

Our RBAC system supports granular permissions, allowing for fine-tuned control over what each role can do. For example, a `Manager` role might have `read:timesheet` and `approve:timesheet` permissions, while an `Employee` role might only have `create:timesheet` and `read:own:timesheet`.

## 🔒 Security Best Practices

Beyond authentication and authorization, our API and backend incorporate several security best practices:

- **Input Validation & Sanitization**: Rigorous validation of all incoming request data using `class-validator` and sanitization techniques to prevent common vulnerabilities like injection attacks and XSS.
- **Security Headers**: Implementation of HTTP security headers (e.g., via Helmet) to mitigate common web vulnerabilities.
- **CORS Configuration**: Carefully configured Cross-Origin Resource Sharing (CORS) policies to control access from different domains.
- **Rate Limiting**: Protection against brute-force attacks and API abuse using `express-rate-limit` with Redis.
- **Secrets Management**: Secure handling of sensitive configuration data through environment variables, with mechanisms for validation and rotation.
- **Security Monitoring**: Logging of security events and intrusion detection capabilities to identify and respond to suspicious activities.
- **Security Testing**: Integration of security tests into the development pipeline to continuously assess and improve the API's resilience.
- **HTTPS Everywhere**: All API communication is enforced over HTTPS to ensure data encryption in transit.

---

**SUMMARY**: The GoGoTime API employs JWT for secure, stateless authentication and a robust RBAC system for fine-grained authorization, ensuring that only authorized users can access and manipulate resources. This is complemented by a suite of security best practices covering validation, headers, rate limiting, secrets management, monitoring, and testing.
