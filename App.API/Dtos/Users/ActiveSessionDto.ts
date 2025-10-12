/**
 * @summary Data transfer object for an active session response.
 */
export class ActiveSessionResponseDto {
  /**
   * @description The unique identifier of the active session.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id!: string;
  /**
   * @description The ID of the user associated with the session.
   * @example "f0e9d8c7-b6a5-4321-fedc-ba9876543210"
   */
  userId!: string;
  /**
   * @description The ID of the company associated with the session.
   * @example "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
   */
  companyId!: string;
  /**
   * @description Optional: The IP address from which the session originated.
   * @example "192.168.1.1"
   */
  ip?: string;
  /**
   * @description Optional: The user agent string of the client.
   * @example "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
   */
  userAgent?: string;
  /**
   * @description Optional: The timestamp of the last activity in the session.
   * @example "2023-10-27T10:00:00Z"
   */
  lastSeenAt?: Date;
}
