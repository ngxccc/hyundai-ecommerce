export interface paths {
  "/": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * System health check
     * @description Returns service operational status.
     */
    get: operations["AppController_getHealth"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/register": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Register new user account
     * @description Creates an unverified account and enqueues an email verification link.
     */
    post: operations["AuthController_register"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/verify-email": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Verify account email
     * @description Validates a 64-character verification token and activates the user account.
     */
    post: operations["AuthController_verifyEmail"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/resend-verification": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Resend email verification link
     * @description Generates a fresh verification token and dispatches an activation email.
     */
    post: operations["AuthController_resendVerification"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Authenticate user and issue tokens
     * @description Verifies credentials and returns a short-lived access token and refresh token.
     */
    post: operations["AuthController_login"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Rotate refresh token and renew access token
     * @description Validates single-use refresh token, revokes it, and issues a new token pair.
     */
    post: operations["AuthController_refresh"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/logout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Revoke current refresh session
     * @description Revokes the provided refresh token to end the active device session.
     */
    post: operations["AuthController_logout"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/logout-all": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Revoke all active user sessions
     * @description Revokes all refresh tokens across every device for the authenticated user.
     */
    post: operations["AuthController_logoutAll"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/forgot-password": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Request password reset email
     * @description Generates a time-limited password reset token and enqueues a recovery email.
     */
    post: operations["AuthController_forgotPassword"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/reset-password": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Reset password with token
     * @description Applies new password using valid reset token and invalidates all existing sessions.
     */
    post: operations["AuthController_resetPassword"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/change-password": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Change account password
     * @description Updates password for authenticated user and revokes all active refresh tokens.
     */
    post: operations["AuthController_changePassword"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/users/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get authenticated user profile
     * @description Returns profile details and account status for the currently authenticated user.
     */
    get: operations["UsersController_getMe"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/bookings/reserve": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Reserve show seats with temporary lock
     * @description Acquires a 10-minute temporary lock on selected seats using Redlock and pessimistic database row locking.
     */
    post: operations["BookingController_reserveSeats"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/bookings/confirm": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Confirm booking and record payment
     * @description Confirms a pending reservation, records payment history, and transitions seats to booked status.
     */
    post: operations["BookingController_confirmBooking"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/payments/payos-webhook": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Process PayOS payment webhook
     * @description Verifies HMAC-SHA256 signature and 5-minute anti-replay window to process payment notifications.
     */
    post: operations["PayOSWebhookController_handlePayOSWebhook"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shows": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create showtime with pre-allocated seats
     * @description Admin endpoint to schedule a showtime, calculate end time, check 15m schedule collision, and pre-allocate seats.
     */
    post: operations["ShowsController_createShow"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/shows/batch": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Create recurring batch showtimes across date range
     * @description Admin endpoint to schedule recurring showtimes across a date range with seat pre-allocation, intra-batch timeline validation, and all-or-nothing rollback.
     */
    post: operations["ShowsController_createShowBatch"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    InvalidParamDto: {
      /**
       * @description Invalid field name
       * @example email
       */
      name: string;
      /**
       * @description Detailed reason for the validation error
       * @example Invalid email address format
       */
      reason: string;
    };
    Rfc9457ErrorResponseDto: {
      /**
       * @description Standard HTTP error type URI
       * @example http://localhost:3000/errors/bad-request
       */
      type: string;
      /**
       * @description Standard HTTP error title
       * @example Bad Request
       */
      title: string;
      /**
       * @description HTTP status code
       * @example 400
       */
      status: number;
      /**
       * @description Detailed error message
       * @example Submitted data format is invalid
       */
      detail: string;
      /**
       * @description API request path that triggered the error
       * @example /auth/register
       */
      instance: string;
      /** @description List of invalid parameters that failed validation */
      invalidParams?: components["schemas"]["InvalidParamDto"][];
      /**
       * @description Timestamp when error occurred in ISO 8601 format
       * @example 2026-07-25T02:45:00.000Z
       */
      timestamp: string;
    };
    ApiResponseDto: {
      /** @example true */
      success: boolean;
    };
    RegisterDto: {
      /**
       * @description User email address
       * @example user@example.com
       */
      email: string;
      /**
       * @description User full name
       * @example John Doe
       */
      fullName: string;
      /**
       * @description Valid 10-digit Vietnamese phone number
       * @example 0912345678
       */
      phoneNumber: string;
      /**
       * @description Strong password with letters, numbers, and symbols
       * @example Password123!
       */
      password: string;
      /**
       * @description Must match password exactly
       * @example Password123!
       */
      confirmPassword: string;
      /**
       * @description Must accept terms of service
       * @example true
       */
      agreeTerms: boolean;
    };
    VerifyEmailDto: {
      /**
       * @description 64-character hexadecimal email verification token
       * @example a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
       */
      token: string;
    };
    ResendVerificationDto: {
      /**
       * @description Email address awaiting verification
       * @example user@example.com
       */
      email: string;
    };
    UserInfoDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example user@example.com */
      email: string;
      /** @example John Doe */
      fullName: string;
      /** @example USER */
      role: string;
    };
    LoginResponseDto: {
      /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... */
      accessToken: string;
      /** @example d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e */
      refreshToken: string;
      user: components["schemas"]["UserInfoDto"];
    };
    LoginDto: {
      /**
       * @description Registered user email address
       * @example user@example.com
       */
      email: string;
      /**
       * @description Account password
       * @example Password123!
       */
      password: string;
    };
    RefreshResponseDto: {
      /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... */
      accessToken: string;
      /** @example d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e */
      refreshToken: string;
    };
    RefreshTokenDto: {
      /**
       * @description Active refresh token string
       * @example d9b2e8a1-3c5f-4a7b-8e9d-1f2a3b4c5d6e
       */
      refreshToken: string;
    };
    ForgotPasswordDto: {
      /**
       * @description Email address associated with account
       * @example user@example.com
       */
      email: string;
    };
    ResetPasswordDto: {
      /**
       * @description 64-character password reset token received via email
       * @example a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
       */
      token: string;
      /**
       * @description New strong password
       * @example NewPassword123!
       */
      password: string;
      /**
       * @description Must match new password
       * @example NewPassword123!
       */
      confirmPassword: string;
    };
    ChangePasswordDto: {
      /**
       * @description Current account password
       * @example CurrentPassword123!
       */
      currentPassword: string;
      /**
       * @description New account password (must differ from current)
       * @example NewSecurePassword456!
       */
      newPassword: string;
    };
    UserResponseDto: {
      /** @example 123e4567-e89b-12d3-a456-426614174000 */
      id: string;
      /** @example user@example.com */
      email: string;
      /** @example John Doe */
      fullName: string;
      /** @example user */
      role: string;
      /**
       * @description True if user email is verified (status !== 'pending_verification')
       * @example true
       */
      isVerified: boolean;
      /**
       * @example active
       * @enum {string}
       */
      status: "active" | "inactive" | "suspended" | "pending_verification";
    };
    ReserveSeatsResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      bookingId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      showId: string;
      /** @example 100000 */
      totalPrice: number;
      /** @example pending_payment */
      status: string;
      /** @example 2026-07-28T12:45:00.000Z */
      expiresAt: string;
      /**
       * @example [
       *       "019fa8bc-8f4d-7000-b366-e691f45cfb8f"
       *     ]
       */
      seats: string[];
    };
    ReserveSeatsDto: {
      /**
       * @description UUIDv7 of the scheduled movie show
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      showId: string;
      /**
       * @description Array of 1 to 6 seat UUIDv7s to reserve and lock
       * @example [
       *       "019fa8bc-8f4d-7000-b366-e691f45cfb01",
       *       "019fa8bc-8f4d-7000-b366-e691f45cfb02"
       *     ]
       */
      seatIds: string[];
      /**
       * @description Optional promotion or voucher code
       * @example DISCOUNT50
       */
      voucherCode?: string;
    };
    ConfirmedTicketDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      ticketId: string;
      /** @example TKT-A1B2C3D4 */
      ticketCode: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      showSeatId: string;
      /** @example 100000 */
      finalPrice: number;
    };
    ConfirmBookingResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      bookingId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      paymentId: string;
      /** @example PAYOS-TX-12345 */
      transactionId: string;
      /** @example confirmed */
      status: string;
      /** @example 2026-07-28T12:45:00.000Z */
      confirmedAt: string;
      /** @example 100000 */
      totalPrice: number;
      tickets: components["schemas"]["ConfirmedTicketDto"][];
    };
    ConfirmBookingDto: {
      /**
       * @description UUIDv7 of the pending reservation to confirm
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      bookingId: string;
      /**
       * @description PayOS unique numerical order code
       * @example 123456
       */
      orderCode: number;
      /**
       * @description Payment method used for the transaction
       * @example PAYOS
       * @enum {string}
       */
      paymentMethod: "PAYOS" | "CASH" | "VNPAY" | "MOMO" | "ZALOPAY";
      /**
       * @description External payment gateway transaction ID
       * @example TXN-123456789
       */
      transactionId: string;
      /**
       * @description Actual paid amount in VND
       * @example 200000
       */
      amount: number;
    };
    PayOSWebhookDataDto: {
      /**
       * @description PayOS unique order code
       * @example 123456
       */
      orderCode: number;
      /**
       * @description Payment amount in VND
       * @example 200000
       */
      amount: number;
      /**
       * @description Payment description string
       * @example Thanh toan ve xem phim
       */
      description: string;
      /**
       * @description PayOS receiving bank account number
       * @example 1234567890
       */
      accountNumber: string;
      /**
       * @description Banking system transaction reference
       * @example FT2401019999
       */
      reference: string;
      /**
       * @description Transaction datetime formatted string
       * @example 2026-08-30 10:00:00
       */
      transactionDateTime: string;
      /**
       * @description Currency unit
       * @example VND
       */
      currency: string;
      /**
       * @description Payment link ID
       * @example link123
       */
      paymentLinkId: string;
      /**
       * @description PayOS payment status code
       * @example 00
       */
      code: string;
      /**
       * @description Status description
       * @example success
       */
      desc: string;
      /** @example null */
      counterAccountBankId?: string | null;
      /** @example null */
      counterAccountBankName?: string | null;
      /** @example null */
      counterAccountName?: string | null;
      /** @example null */
      counterAccountNumber?: string | null;
      /** @example null */
      virtualAccountName?: string | null;
      /** @example null */
      virtualAccountNumber?: string | null;
    };
    PayOSWebhookDto: {
      /**
       * @description Webhook result code
       * @example 00
       */
      code: string;
      /**
       * @description Result description
       * @example success
       */
      desc: string;
      /** @description PayOS transaction payload details */
      data: components["schemas"]["PayOSWebhookDataDto"];
      /**
       * @description PayOS HMAC-SHA256 verification signature
       * @example a1b2c3d4e5f6...
       */
      signature: string;
    };
    PayOSWebhookResponseDto: {
      /** @example true */
      success: boolean;
      /** @example Webhook processed successfully */
      message: string;
    };
    ShowResponseDto: {
      /**
       * @description UUIDv7 of the newly created show
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb91
       */
      id: string;
      /**
       * @description UUIDv7 of the scheduled movie
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      movieId: string;
      /**
       * @description UUIDv7 of the cinema hall
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb90
       */
      hallId: string;
      /**
       * @description ISO 8601 start timestamp
       * @example 2026-09-01T10:00:00.000Z
       */
      startTime: string;
      /**
       * @description ISO 8601 end timestamp (automatically computed)
       * @example 2026-09-01T12:00:00.000Z
       */
      endTime: string;
      /**
       * @description Base ticket price in VND
       * @example 100000
       */
      basePrice: number;
      /**
       * @description Total number of physical seats pre-allocated as available
       * @example 100
       */
      totalSeats: number;
    };
    CreateShowDto: {
      /**
       * @description UUIDv7 of the movie to be scheduled
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      movieId: string;
      /**
       * @description UUIDv7 of the cinema hall where the show takes place
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb90
       */
      hallId: string;
      /**
       * @description ISO 8601 start timestamp with timezone
       * @example 2026-09-01T10:00:00.000Z
       */
      startTime: string;
      /**
       * @description Base ticket price in VND
       * @example 100000
       */
      basePrice: number;
    };
    BatchShowResponseDto: {
      /**
       * @description Total number of showtimes successfully created
       * @example 12
       */
      createdCount: number;
      /**
       * @description Array of UUIDv7 identifiers for all created showtimes
       * @example [
       *       "019fa8bc-8f4d-7000-b366-e691f45cfb91",
       *       "019fa8bc-8f4d-7000-b366-e691f45cfb92"
       *     ]
       */
      showIds: string[];
    };
    CreateShowBatchDto: {
      /**
       * @description UUIDv7 of the movie to be scheduled
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      movieId: string;
      /**
       * @description UUIDv7 of the cinema hall where shows take place
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb90
       */
      hallId: string;
      /**
       * @description Start date of the batch schedule (YYYY-MM-DD)
       * @example 2026-09-01
       */
      startDate: string;
      /**
       * @description End date of the batch schedule (inclusive, YYYY-MM-DD)
       * @example 2026-09-03
       */
      endDate: string;
      /**
       * @description Array of recurring daily time slots in 24-hour HH:mm format
       * @example [
       *       "10:00",
       *       "14:30",
       *       "19:00"
       *     ]
       */
      timeSlots: string[];
      /**
       * @description Base ticket price in VND
       * @example 100000
       */
      basePrice: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  AppController_getHealth: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Service is operational */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            /** @example ok */
            status?: string;
          };
        };
      };
    };
  };
  AuthController_register: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RegisterDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource conflict (Conflict) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/conflict",
           *       "title": "Conflict",
           *       "status": 409,
           *       "detail": "Email address already exists",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_verifyEmail: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["VerifyEmailDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_resendVerification: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ResendVerificationDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["LoginDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["LoginResponseDto"];
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_refresh: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RefreshTokenDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["RefreshResponseDto"];
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RefreshTokenDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_logoutAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_forgotPassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ForgotPasswordDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_resetPassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ResetPasswordDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  AuthController_changePassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChangePasswordDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Internal server error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/internal-server-error",
           *       "title": "Internal Server Error",
           *       "status": 500,
           *       "detail": "An internal server error occurred. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  UsersController_getMe: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["UserResponseDto"];
          };
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Forbidden access (Forbidden) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/forbidden",
           *       "title": "Forbidden",
           *       "status": 403,
           *       "detail": "Account suspended or inactive",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource not found (Not Found) */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/not-found",
           *       "title": "Not Found",
           *       "status": 404,
           *       "detail": "User profile not found",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Rate limit exceeded (Too Many Requests) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/too-many-requests",
           *       "title": "Too Many Requests",
           *       "status": 429,
           *       "detail": "Rate limit exceeded. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  BookingController_reserveSeats: {
    parameters: {
      query?: never;
      header: {
        /** @description Client-generated UUID idempotency key for preventing duplicate booking requests */
        "idempotency-key": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ReserveSeatsDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["ReserveSeatsResponseDto"];
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource conflict (Conflict) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/conflict",
           *       "title": "Conflict",
           *       "status": 409,
           *       "detail": "Email address already exists",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Rate limit exceeded (Too Many Requests) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/too-many-requests",
           *       "title": "Too Many Requests",
           *       "status": 429,
           *       "detail": "Rate limit exceeded. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  BookingController_confirmBooking: {
    parameters: {
      query?: never;
      header: {
        /** @description Client-generated UUID idempotency key for preventing duplicate payment confirmations */
        "idempotency-key": string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ConfirmBookingDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["ConfirmBookingResponseDto"];
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource conflict (Conflict) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/conflict",
           *       "title": "Conflict",
           *       "status": 409,
           *       "detail": "Email address already exists",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Rate limit exceeded (Too Many Requests) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/too-many-requests",
           *       "title": "Too Many Requests",
           *       "status": 429,
           *       "detail": "Rate limit exceeded. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  PayOSWebhookController_handlePayOSWebhook: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PayOSWebhookDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PayOSWebhookResponseDto"];
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  ShowsController_createShow: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateShowDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["ShowResponseDto"];
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Forbidden access (Forbidden) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/forbidden",
           *       "title": "Forbidden",
           *       "status": 403,
           *       "detail": "Account suspended or inactive",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource not found (Not Found) */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/not-found",
           *       "title": "Not Found",
           *       "status": 404,
           *       "detail": "User profile not found",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource conflict (Conflict) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/conflict",
           *       "title": "Conflict",
           *       "status": 409,
           *       "detail": "Email address already exists",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Rate limit exceeded (Too Many Requests) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/too-many-requests",
           *       "title": "Too Many Requests",
           *       "status": 429,
           *       "detail": "Rate limit exceeded. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
  ShowsController_createShowBatch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateShowBatchDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["BatchShowResponseDto"];
          };
        };
      };
      /** @description Validation failure (Bad Request) */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/bad-request",
           *       "title": "Bad Request",
           *       "status": 400,
           *       "detail": "Submitted data format is invalid",
           *       "instance": "/api/example",
           *       "invalidParams": [
           *         {
           *           "name": "email",
           *           "reason": "Invalid email address format"
           *         }
           *       ],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Authentication required or invalid token (Unauthorized) */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/unauthorized",
           *       "title": "Unauthorized",
           *       "status": 401,
           *       "detail": "Unauthorized access",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Forbidden access (Forbidden) */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/forbidden",
           *       "title": "Forbidden",
           *       "status": 403,
           *       "detail": "Account suspended or inactive",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource not found (Not Found) */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/not-found",
           *       "title": "Not Found",
           *       "status": 404,
           *       "detail": "User profile not found",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Resource conflict (Conflict) */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/conflict",
           *       "title": "Conflict",
           *       "status": 409,
           *       "detail": "Email address already exists",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
      /** @description Rate limit exceeded (Too Many Requests) */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "type": "http://localhost:3000/errors/too-many-requests",
           *       "title": "Too Many Requests",
           *       "status": 429,
           *       "detail": "Rate limit exceeded. Please try again later.",
           *       "instance": "/api/example",
           *       "invalidParams": [],
           *       "timestamp": "2026-07-25T02:45:00.000Z"
           *     }
           */
          "application/problem+json": components["schemas"]["Rfc9457ErrorResponseDto"];
        };
      };
    };
  };
}
