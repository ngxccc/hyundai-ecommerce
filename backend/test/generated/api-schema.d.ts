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
  "/dealer-tiers": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all dealer discount tiers
     * @description Returns all configured B2B dealer tiers with their minimum spend and discount percentages.
     */
    get: operations["DealerTiersController_getAll"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/dealer-tiers/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get dealer tier by ID
     * @description Returns details of a specific dealer tier by UUID.
     */
    get: operations["DealerTiersController_getById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/leads": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all leads (CMS Admin & Sales)
     * @description Returns all leads and quote requests ordered by latest submission date.
     */
    get: operations["LeadsController_getAll"];
    put?: never;
    /**
     * Submit Request for Quote (Storefront RFQ)
     * @description Public endpoint allowing customers and B2B buyers to request quotes for products without signing up.
     */
    post: operations["LeadsController_submitRfq"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/leads/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get lead by ID (CMS Admin & Sales)
     * @description Returns full lead information and list of requested items.
     */
    get: operations["LeadsController_getById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/leads/{id}/status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Update lead status (CMS Admin & Sales)
     * @description Updates lead status in sales pipeline (CONTACTING, SURVEY_SCHEDULED, QUOTED, LOST, etc.).
     */
    patch: operations["LeadsController_updateStatus"];
    trace?: never;
  };
  "/leads/{id}/assign": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /**
     * Assign sales representative to lead (Admin only)
     * @description Assigns a designated sales user ID to manage this lead.
     */
    patch: operations["LeadsController_assignSales"];
    trace?: never;
  };
  "/categories": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all categories
     * @description Returns a flat list of all active categories ordered by name.
     */
    get: operations["CategoriesController_getAll"];
    put?: never;
    /**
     * Create category (Admin only)
     * @description Creates a new category in the catalog.
     */
    post: operations["CategoriesController_create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/categories/tree": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get category tree
     * @description Returns recursive hierarchical tree of categories.
     */
    get: operations["CategoriesController_getTree"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/categories/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get category by ID
     * @description Returns details of a specific category by UUID.
     */
    get: operations["CategoriesController_getById"];
    /**
     * Update category (Admin only)
     * @description Updates an existing category by UUID.
     */
    put: operations["CategoriesController_update"];
    post?: never;
    /**
     * Delete category (Admin only)
     * @description Deletes an existing category by UUID.
     */
    delete: operations["CategoriesController_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/brands": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List all brands
     * @description Returns a list of all active brands ordered by name.
     */
    get: operations["BrandsController_getAll"];
    put?: never;
    /**
     * Create brand (Admin only)
     * @description Creates a new brand in the catalog.
     */
    post: operations["BrandsController_create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/brands/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get brand by ID
     * @description Returns details of a specific brand by UUID.
     */
    get: operations["BrandsController_getById"];
    /**
     * Update brand (Admin only)
     * @description Updates an existing brand by UUID.
     */
    put: operations["BrandsController_update"];
    post?: never;
    /**
     * Delete brand (Admin only)
     * @description Deletes an existing brand by UUID.
     */
    delete: operations["BrandsController_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/products": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * List products with hybrid faceted search and pagination
     * @description Returns a paginated list of products matching filter criteria (power, price, brand, category, specs).
     */
    get: operations["ProductsController_getProducts"];
    put?: never;
    /**
     * Create product (Admin only)
     * @description Creates a new product with technical specifications and images.
     */
    post: operations["ProductsController_create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/products/metadata": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get faceted filter metadata
     * @description Returns available filter ranges (price, power) and facet counts for brands, categories, fuel types, and phases.
     */
    get: operations["ProductsController_getMetadata"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/products/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get product by ID or slug
     * @description Returns full product details by UUID or URL slug.
     */
    get: operations["ProductsController_getById"];
    /**
     * Update product (Admin only)
     * @description Updates an existing product by UUID.
     */
    put: operations["ProductsController_update"];
    post?: never;
    /**
     * Delete product (Admin only)
     * @description Soft deletes an existing product by UUID.
     */
    delete: operations["ProductsController_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/warehouses": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List all physical warehouses */
    get: operations["WarehouseController_getAll"];
    put?: never;
    /** Create a new physical warehouse (Admin Only) */
    post: operations["WarehouseController_create"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/warehouses/stock/product/{productId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get stock distribution across all warehouses for a product */
    get: operations["WarehouseController_getProductStocks"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/warehouses/{id}/stock": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all product inventory stocks located in a warehouse */
    get: operations["WarehouseController_getWarehouseStocks"];
    /** Update product stock in a warehouse and atomically sync totalStockCache (Admin Only) */
    put: operations["WarehouseController_updateStock"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/warehouses/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get warehouse details by UUID */
    get: operations["WarehouseController_getById"];
    /** Update warehouse details (Admin Only) */
    put: operations["WarehouseController_update"];
    post?: never;
    /** Deactivate warehouse (Admin Only) */
    delete: operations["WarehouseController_delete"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/cart": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get current authenticated user shopping cart */
    get: operations["CartController_getCart"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/cart/items": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Add item to cart or increment quantity */
    post: operations["CartController_addItem"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/cart/items/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Update quantity of a cart item */
    put: operations["CartController_updateItemQuantity"];
    post?: never;
    /** Remove item from cart */
    delete: operations["CartController_removeItem"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/cart/merge": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Merge guest cart items into authenticated user cart with inventory stock clamping */
    post: operations["CartController_mergeGuestCart"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List quotes with filtering and pagination */
    get: operations["QuotesController_listQuotes"];
    put?: never;
    /** Submit customer Request For Quotation (RFQ) */
    post: operations["QuotesController_submitRfq"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes/admin": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create official B2B quotation (Admin only) */
    post: operations["QuotesController_createAdminQuote"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get detailed quote by ID */
    get: operations["QuotesController_getQuoteById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes/{id}/status": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Update quote status along the state machine (Admin only) */
    patch: operations["QuotesController_updateStatus"];
    trace?: never;
  };
  "/quotes/{id}/items/{itemId}/price": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Update negotiated price for a quote line item (Admin only) */
    put: operations["QuotesController_updateItemPrice"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes/{id}/messages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Post a message to quote negotiation timeline */
    post: operations["QuotesController_sendMessage"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes/{id}/approve-to-order": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Approve quote and convert to order (Admin only) */
    post: operations["QuotesController_approveToOrder"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/quotes/{id}/export-excel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Download B2B quote Excel (.xlsx) spreadsheet */
    get: operations["QuotesController_exportExcel"];
    put?: never;
    post?: never;
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
      /**
       * @example SALES
       * @enum {string}
       */
      role: "ADMIN" | "SALES";
      /**
       * @example ACTIVE
       * @enum {string}
       */
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
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
    DealerTierInfoDto: {
      /** @example 123e4567-e89b-12d3-a456-426614174000 */
      id: string;
      /** @example Đại lý Vàng */
      nameVi: string;
      /** @example Gold Dealer */
      nameEn: string | null;
      /** @example 15.00 */
      discountPercentage: string;
    };
    DealerCompanyDto: {
      /** @example Công ty Cổ phần Cơ điện Miền Nam */
      companyName: string | null;
      /** @example 0314567890 */
      taxId: string | null;
      /**
       * @example DEALER
       * @enum {string|null}
       */
      businessType:
        | "CONTRACTOR"
        | "COMMERCIAL"
        | "GOVERNMENT"
        | "END_USER"
        | "DEALER"
        | null;
      /** @example Thành phố Hồ Chí Minh */
      province: string | null;
      /** @example 500000000.00 */
      creditLimit: string;
      /** @example 50000000.00 */
      currentDebt: string;
      /** @example 450000000.00 */
      availableCredit: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      parentId: string | null;
      tier: components["schemas"]["DealerTierInfoDto"] | null;
    };
    UserResponseDto: {
      /** @example 123e4567-e89b-12d3-a456-426614174000 */
      id: string;
      /** @example user@example.com */
      email: string;
      /** @example John Doe */
      fullName: string;
      /** @example 0912345678 */
      phoneNumber: string;
      /** @example https://cloudinary.com/avatar.jpg */
      avatarUrl: string | null;
      /**
       * @example SALES
       * @enum {string}
       */
      role: "ADMIN" | "SALES";
      /**
       * @example ACTIVE
       * @enum {string}
       */
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
      /**
       * @description True if user email is verified
       * @example true
       */
      isVerified: boolean;
      dealerCompany: components["schemas"]["DealerCompanyDto"] | null;
    };
    DealerTierResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Hạng Vàng */
      nameVi: string;
      /** @example Gold Tier */
      nameEn: string | null;
      /**
       * @description Discount percentage applied to wholesale catalog prices
       * @example 15.00
       */
      discountPercentage: string;
      /**
       * @description Minimum spend requirement to qualify for this tier
       * @example 500000000.00
       */
      minimumSpend: string;
    };
    LeadItemResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb99 */
      productId: string;
      /** @example 1 */
      quantity: number;
      /** @example Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha */
      productNameVi: string;
      /** @example Hyundai DHY65KSE 60kVA 3-Phase Diesel Generator */
      productNameEn: string | null;
      /** @example DHY65KSE */
      productModel: string | null;
      /** @example GEN-DHY65KSE */
      productSku: string | null;
    };
    LeadResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example RFQ-20260904-001 */
      leadCode: string;
      /** @example Nguyễn Văn An */
      fullName: string;
      /** @example 0912345678 */
      phoneNumber: string;
      /** @example an.nguyen@example.com */
      email: string | null;
      /** @example Công ty TNHH Cơ điện Bình Dương */
      companyName: string | null;
      /** @example Bình Dương */
      city: string;
      /** @example Phường Dĩ An */
      ward: string;
      /** @example Khu công nghiệp Sóng Thần 1, Đường số 3 */
      streetAddress: string | null;
      /** @example Cần tư vấn máy phát điện diesel 60kVA kèm tủ ATS cho nhà máy may */
      notes: string | null;
      /**
       * @example NEW
       * @enum {string}
       */
      status:
        | "NEW"
        | "CONTACTING"
        | "SURVEY_SCHEDULED"
        | "QUOTED"
        | "CONVERTED"
        | "REJECTED"
        | "LOST";
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb11 */
      assignedSalesId: string | null;
      /** @example null */
      lostReason: string | null;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      items: components["schemas"]["LeadItemResponseDto"][];
    };
    CreateLeadItemDto: {
      /**
       * @description UUID of the requested product
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId: string;
      /**
       * @description Requested quantity
       * @default 1
       * @example 1
       */
      quantity: number;
    };
    CreateLeadDto: {
      /**
       * @description Full name of the contact person
       * @example Nguyễn Văn An
       */
      fullName: string;
      /**
       * @description 10-digit Vietnamese mobile phone number
       * @example 0912345678
       */
      phoneNumber: string;
      /**
       * @description Optional email for formal PDF quote dispatch
       * @example an.nguyen@example.com
       */
      email?: string;
      /**
       * @description Optional company name for B2B/project quotes
       * @example Công ty TNHH Cơ điện Bình Dương
       */
      companyName?: string;
      /**
       * @description Province / Municipality (Cấp 1)
       * @example Bình Dương
       */
      city: string;
      /**
       * @description Ward / Commune (Cấp 2 tinh gọn)
       * @example Phường Dĩ An
       */
      ward: string;
      /**
       * @description Detailed street address, factory, or project site
       * @example Khu công nghiệp Sóng Thần 1, Đường số 3
       */
      streetAddress?: string;
      /**
       * @description Customer power load notes or project description
       * @example Cần tư vấn máy phát điện diesel 60kVA kèm tủ ATS cho nhà máy may
       */
      notes?: string;
      /** @description List of requested products and quantities */
      items: components["schemas"]["CreateLeadItemDto"][];
    };
    UpdateLeadStatusDto: {
      /**
       * @description New pipeline status of the lead
       * @example CONTACTING
       * @enum {string}
       */
      status:
        | "NEW"
        | "CONTACTING"
        | "SURVEY_SCHEDULED"
        | "QUOTED"
        | "CONVERTED"
        | "REJECTED"
        | "LOST";
      /**
       * @description Reason when status is REJECTED or LOST
       * @example Khách chê giá đắt, đã chọn phương án thuê máy cũ
       */
      lostReason?: string;
    };
    CategoryResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Máy phát điện công nghiệp */
      nameVi: string;
      /** @example Industrial Generators */
      nameEn?: string | null;
      /** @example may-phat-dien-cong-nghiep */
      slug: string;
      /**
       * @description Parent category ID or null if root
       * @example null
       */
      parentId?: string | null;
      /** @example Mô tả danh mục */
      descriptionVi?: string | null;
      /** @example Category description */
      descriptionEn?: string | null;
      /** @example https://res.cloudinary.com/hyundai/image/upload/cat.jpg */
      image?: string | null;
      /** @example true */
      isActive: boolean;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
      /** @description Recursive child categories tree */
      children?: components["schemas"]["CategoryResponseDto"][];
    };
    CreateCategoryDto: {
      /**
       * @description Category name in Vietnamese
       * @example Máy phát điện công nghiệp
       */
      nameVi: string;
      /**
       * @description Category name in English
       * @example Industrial Generators
       */
      nameEn?: string;
      /**
       * @description Unique URL slug
       * @example may-phat-dien-cong-nghiep
       */
      slug: string;
      /**
       * @description Parent category UUID for hierarchical trees
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      parentId?: string;
      /** @example Dòng máy phát điện công suất lớn từ 20kVA đến 2500kVA */
      descriptionVi?: string;
      /** @example Heavy-duty industrial generator sets from 20kVA to 2500kVA */
      descriptionEn?: string;
      /** @example https://res.cloudinary.com/hyundai/image/upload/category.jpg */
      image?: string;
      /**
       * @default true
       * @example true
       */
      isActive: boolean;
    };
    UpdateCategoryDto: {
      /** @example Máy phát điện công nghiệp cập nhật */
      nameVi?: string;
      /** @example Updated Industrial Generators */
      nameEn?: string;
      /** @example may-phat-dien-cong-nghiep-moi */
      slug?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      parentId?: string;
      /** @example Mô tả mới */
      descriptionVi?: string;
      /** @example New description */
      descriptionEn?: string;
      /** @example https://example.com/new-image.jpg */
      image?: string;
      /** @example true */
      isActive?: boolean;
    };
    Object: Record<string, never>;
    BrandResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Hyundai Power */
      name: string;
      /** @example hyundai-power */
      slug: string;
      /** @example https://res.cloudinary.com/hyundai/image/upload/logo.png */
      logo?: string | null;
      /** @example Thương hiệu thiết bị năng lượng hàng đầu */
      descriptionVi?: string | null;
      /** @example Leading power equipment brand */
      descriptionEn?: string | null;
      /** @example true */
      isActive: boolean;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
    };
    CreateBrandDto: {
      /**
       * @description Brand name
       * @example Hyundai Power
       */
      name: string;
      /**
       * @description Brand URL slug
       * @example hyundai-power
       */
      slug: string;
      /** @example https://res.cloudinary.com/hyundai/image/upload/logo.png */
      logo?: string;
      /** @example Thương hiệu thiết bị năng lượng và máy phát điện hàng đầu Hàn Quốc */
      descriptionVi?: string;
      /** @example Leading Korean power equipment and generator manufacturer */
      descriptionEn?: string;
      /**
       * @default true
       * @example true
       */
      isActive: boolean;
    };
    UpdateBrandDto: {
      /** @example Hyundai Power Vietnam */
      name?: string;
      /** @example hyundai-power-vietnam */
      slug?: string;
      /** @example https://example.com/new-logo.png */
      logo?: string;
      /** @example Mô tả thương hiệu mới */
      descriptionVi?: string;
      /** @example New brand description */
      descriptionEn?: string;
      /** @example true */
      isActive?: boolean;
    };
    ProductResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha */
      nameVi: string;
      /** @example Hyundai DHY65KSE 60kVA 3-Phase Diesel Generator */
      nameEn?: string | null;
      /** @example may-phat-dien-diesel-hyundai-dhy65kse */
      slug: string;
      /** @example 245000000.00 */
      price: string;
      /** @example null */
      descriptionVi?: Record<string, never> | null;
      /** @example null */
      descriptionEn?: Record<string, never> | null;
      /** @example Máy phát điện 60kVA vỏ chống ồn */
      shortDescriptionVi?: string | null;
      /** @example 60kVA diesel generator */
      shortDescriptionEn?: string | null;
      /**
       * @example [
       *       "https://res.cloudinary.com/hyundai/image/upload/dhy65kse.jpg"
       *     ]
       */
      images: string[];
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      brandId?: string | null;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      categoryId?: string | null;
      /**
       * @example generator
       * @enum {string}
       */
      productType?: "generator" | "ups" | "ats" | "accessory";
      /** @example 60.00 */
      powerKva?: string | null;
      /** @example 48.00 */
      powerKw?: string | null;
      /** @example 66.00 */
      standbyPowerKva?: string | null;
      /** @example 52.80 */
      standbyPowerKw?: string | null;
      /**
       * @example 3phase
       * @enum {string|null}
       */
      phase?: "1phase" | "3phase" | "multi_phase" | null;
      /** @example 230/400V */
      voltage?: string | null;
      /** @example 50 */
      frequency?: number | null;
      /**
       * @example diesel
       * @enum {string|null}
       */
      fuelType?: "diesel" | "gasoline" | "gas" | null;
      /**
       * @example silent
       * @enum {string|null}
       */
      canopyType?:
        | "silent"
        | "super_silent"
        | "open_frame"
        | "closed_case"
        | "tower"
        | "rackmount"
        | null;
      /**
       * @example electric
       * @enum {string|null}
       */
      startMethod?: "electric" | "recoil" | "remote" | "auto_ats" | null;
      /** @example Hyundai */
      engineBrand?: string | null;
      /** @example Hyundai */
      alternatorBrand?: string | null;
      /** @enum {string|null} */
      upsTopology?:
        "offline" | "line_interactive" | "online_double_conversion" | null;
      /** @enum {string|null} */
      upsBatteryType?: "internal" | "external" | null;
      /** @example [] */
      specSheet: Record<string, never>;
      /**
       * @example {
       *       "model": "DHY65KSE"
       *     }
       */
      specs: Record<string, never>;
      /** @example 5 */
      totalStockCache: number;
      /** @example 0 */
      totalSalesCache: number;
      /** @example true */
      isActive: boolean;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
      brand?: components["schemas"]["BrandResponseDto"] | null;
      category?: components["schemas"]["CategoryResponseDto"] | null;
    };
    BrandFacetItem: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Hyundai Power */
      name: string;
      /** @example 42 */
      count: number;
    };
    CategoryFacetItem: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      id: string;
      /** @example Máy phát điện */
      nameVi: string;
      /** @example Generators */
      nameEn: string | null;
      /** @example 35 */
      count: number;
    };
    RangeFacet: {
      /** @example 10 */
      min: number;
      /** @example 2500 */
      max: number;
    };
    ValueCountFacetItem: {
      /** @example diesel */
      value: string;
      /** @example 28 */
      count: number;
    };
    ProductMetadataResponseDto: {
      brands: components["schemas"]["BrandFacetItem"][];
      categories: components["schemas"]["CategoryFacetItem"][];
      powerRange: components["schemas"]["RangeFacet"];
      priceRange: components["schemas"]["RangeFacet"];
      fuelTypes: components["schemas"]["ValueCountFacetItem"][];
      phases: components["schemas"]["ValueCountFacetItem"][];
      canopyTypes: components["schemas"]["ValueCountFacetItem"][];
    };
    CreateProductDto: {
      /** @example Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha */
      nameVi: string;
      /** @example Hyundai DHY65KSE 60kVA 3-Phase Diesel Generator */
      nameEn?: string;
      /** @example may-phat-dien-diesel-hyundai-dhy65kse */
      slug: string;
      /** @example 245000000 */
      price: number;
      /**
       * @example {
       *       "type": "doc",
       *       "content": []
       *     }
       */
      descriptionVi?: Record<string, never>;
      /**
       * @example {
       *       "type": "doc",
       *       "content": []
       *     }
       */
      descriptionEn?: Record<string, never>;
      /** @example Máy phát điện 60kVA vỏ chống ồn đồng bộ */
      shortDescriptionVi?: string;
      /** @example 60kVA diesel generator with soundproof canopy */
      shortDescriptionEn?: string;
      /**
       * @default []
       * @example [
       *       "https://res.cloudinary.com/hyundai/image/upload/dhy65kse.jpg"
       *     ]
       */
      images: string[];
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      brandId?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      categoryId?: string;
      /**
       * @default generator
       * @enum {string}
       */
      productType: "generator" | "ups" | "ats" | "accessory";
      /** @example 60 */
      powerKva?: number;
      /** @example 48 */
      powerKw?: number;
      /** @example 66 */
      standbyPowerKva?: number;
      /** @example 52.8 */
      standbyPowerKw?: number;
      /**
       * @example 3phase
       * @enum {string}
       */
      phase?: "1phase" | "3phase" | "multi_phase";
      /** @example 230/400V */
      voltage?: string;
      /**
       * @default 50
       * @example 50
       */
      frequency: number;
      /**
       * @example diesel
       * @enum {string}
       */
      fuelType?: "diesel" | "gasoline" | "gas";
      /**
       * @example silent
       * @enum {string}
       */
      canopyType?:
        | "silent"
        | "super_silent"
        | "open_frame"
        | "closed_case"
        | "tower"
        | "rackmount";
      /**
       * @example electric
       * @enum {string}
       */
      startMethod?: "electric" | "recoil" | "remote" | "auto_ats";
      /** @example Hyundai */
      engineBrand?: string;
      /** @example Hyundai */
      alternatorBrand?: string;
      /** @enum {string} */
      upsTopology?: "offline" | "line_interactive" | "online_double_conversion";
      /** @enum {string} */
      upsBatteryType?: "internal" | "external";
      /**
       * @example [
       *       {
       *         "groupKey": "general",
       *         "titleVi": "Thông số chung",
       *         "order": 1,
       *         "items": [
       *           {
       *             "key": "model",
       *             "nameVi": "Model",
       *             "value": "DHY65KSE"
       *           }
       *         ]
       *       }
       *     ]
       */
      specSheet?: Record<string, never>;
      /**
       * @example {
       *       "model": "DHY65KSE",
       *       "origin": "Hàn Quốc",
       *       "dimensions": "2250 x 950 x 1300 mm",
       *       "weight": "1150 kg"
       *     }
       */
      specs?: Record<string, never>;
      /**
       * @default 0
       * @example 5
       */
      totalStockCache: number;
      /**
       * @default true
       * @example true
       */
      isActive: boolean;
    };
    UpdateProductDto: {
      /** @example Máy phát điện cập nhật */
      nameVi?: string;
      /** @example Updated Generator */
      nameEn?: string;
      /** @example may-phat-dien-cap-nhat */
      slug?: string;
      /** @example 250000000 */
      price?: number;
      /**
       * @example {
       *       "type": "doc",
       *       "content": []
       *     }
       */
      descriptionVi?: Record<string, never>;
      /**
       * @example {
       *       "type": "doc",
       *       "content": []
       *     }
       */
      descriptionEn?: Record<string, never>;
      /** @example Mô tả ngắn mới */
      shortDescriptionVi?: string;
      /** @example New short description */
      shortDescriptionEn?: string;
      /** @example [] */
      images?: string[];
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      brandId?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      categoryId?: string;
      /** @enum {string} */
      productType?: "generator" | "ups" | "ats" | "accessory";
      /** @example 65 */
      powerKva?: number;
      /** @example 52 */
      powerKw?: number;
      /** @example 70 */
      standbyPowerKva?: number;
      /** @example 56 */
      standbyPowerKw?: number;
      /** @enum {string} */
      phase?: "1phase" | "3phase" | "multi_phase";
      /** @example 230/400V */
      voltage?: string;
      /** @example 50 */
      frequency?: number;
      /** @enum {string} */
      fuelType?: "diesel" | "gasoline" | "gas";
      /** @enum {string} */
      canopyType?:
        | "silent"
        | "super_silent"
        | "open_frame"
        | "closed_case"
        | "tower"
        | "rackmount";
      /** @enum {string} */
      startMethod?: "electric" | "recoil" | "remote" | "auto_ats";
      /** @example Hyundai */
      engineBrand?: string;
      /** @example Hyundai */
      alternatorBrand?: string;
      /** @enum {string} */
      upsTopology?: "offline" | "line_interactive" | "online_double_conversion";
      /** @enum {string} */
      upsBatteryType?: "internal" | "external";
      /** @example [] */
      specSheet?: Record<string, never>;
      /**
       * @example {
       *       "model": "DHY65KSE"
       *     }
       */
      specs?: Record<string, never>;
      /** @example 10 */
      totalStockCache?: number;
      /** @example true */
      isActive?: boolean;
    };
    WarehouseResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Kho Tổng Hà Nội */
      nameVi: string;
      /** @example Hanoi Central Warehouse */
      nameEn?: string | null;
      /** @example Lô CN-01, Khu Công Nghiệp Đài Tư, 386 Nguyễn Văn Linh */
      streetAddress: string;
      /** @example Long Biên */
      district: string;
      /** @example Hà Nội */
      city: string;
      /** @example true */
      isActive: boolean;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
    };
    StockProductItemDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Máy phát điện Diesel Hyundai DHY65KSE */
      nameVi: string;
      /** @example may-phat-dien-diesel-hyundai-dhy65kse */
      slug: string;
      /** @example 15 */
      totalStockCache: number;
    };
    StockWarehouseItemDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Kho Tổng Hà Nội */
      nameVi: string;
      /** @example Hà Nội */
      city: string;
    };
    WarehouseStockResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      warehouseId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      productId: string;
      /** @example 10 */
      stock: number;
      /** @example 2 */
      minStockWarning: number;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
      product?: components["schemas"]["StockProductItemDto"];
      warehouse?: components["schemas"]["StockWarehouseItemDto"];
    };
    CreateWarehouseDto: {
      /**
       * @description Warehouse name in Vietnamese
       * @example Kho Tổng Hà Nội
       */
      nameVi: string;
      /**
       * @description Warehouse name in English
       * @example Hanoi Central Warehouse
       */
      nameEn?: string;
      /**
       * @description Street address
       * @example Lô CN-01, Khu Công Nghiệp Đài Tư, 386 Nguyễn Văn Linh
       */
      streetAddress: string;
      /**
       * @description District / County
       * @example Long Biên
       */
      district: string;
      /**
       * @description City / Province
       * @example Hà Nội
       */
      city: string;
      /**
       * @description Active status
       * @default true
       * @example true
       */
      isActive: boolean;
    };
    UpdateStockDto: {
      /**
       * @description Product UUID
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId: string;
      /**
       * @description Physical stock quantity available in this warehouse
       * @example 10
       */
      stock: number;
      /**
       * @description Threshold quantity to trigger low-stock warning
       * @default 2
       * @example 2
       */
      minStockWarning: number;
    };
    UpdateWarehouseDto: {
      /** @example Kho Tổng Hà Nội Cập Nhật */
      nameVi?: string;
      /** @example Hanoi Main Warehouse Updated */
      nameEn?: string;
      /** @example 386 Nguyễn Văn Linh */
      streetAddress?: string;
      /** @example Long Biên */
      district?: string;
      /** @example Hà Nội */
      city?: string;
      /** @example true */
      isActive?: boolean;
    };
    CartProductSummaryDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Máy phát điện Diesel Hyundai DHY65KSE 60kVA */
      nameVi: string;
      /** @example Hyundai DHY65KSE 60kVA Generator */
      nameEn?: string | null;
      /** @example may-phat-dien-diesel-hyundai-dhy65kse */
      slug: string;
      /** @example 245000000.00 */
      price: string;
      /**
       * @example [
       *       "https://res.cloudinary.com/hyundai/image/upload/dhy65kse.jpg"
       *     ]
       */
      images: string[];
      /** @example 10 */
      totalStockCache: number;
      /** @example true */
      isActive: boolean;
      /** @example false */
      isOutOfStock: boolean;
    };
    CartItemResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      productId: string;
      /** @example 2 */
      quantity: number;
      /** @example 490000000.00 */
      lineTotal: string;
      product: components["schemas"]["CartProductSummaryDto"];
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
    };
    CartSummaryDto: {
      /**
       * @description Total quantity of items in cart
       * @example 3
       */
      totalItems: number;
      /**
       * @description Total monetary amount of cart items
       * @example 735000000.00
       */
      totalAmount: string;
    };
    CartResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      userId: string;
      items: components["schemas"]["CartItemResponseDto"][];
      summary: components["schemas"]["CartSummaryDto"];
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
    };
    AddCartItemDto: {
      /**
       * @description Product UUID to add to cart
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId: string;
      /**
       * @description Quantity of items to add (min 1)
       * @default 1
       * @example 1
       */
      quantity: number;
    };
    UpdateCartItemDto: {
      /**
       * @description New desired item quantity (min 1, max 1000)
       * @example 3
       */
      quantity: number;
    };
    GuestCartItemDto: {
      /**
       * @description Product UUID from guest session
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId: string;
      /**
       * @description Item quantity accumulated in guest session
       * @example 2
       */
      quantity: number;
    };
    MergeCartDto: {
      /** @description List of guest cart items to merge into authenticated user cart */
      items: components["schemas"]["GuestCartItemDto"][];
    };
    QuoteCommercialTermsDto: {
      /**
       * @default 15
       * @example 15
       */
      validityDays: number;
      /** @example Tạm ứng 30%, 70% sau khi bàn giao */
      paymentSchedule?: string | null;
      /** @example 12 tháng hoặc 1000 giờ chạy */
      warrantyTerms?: string | null;
      /** @example 3-5 ngày làm việc */
      deliveryTime?: string | null;
      /** @example Tại chân công trình bên mua */
      deliveryLocation?: string | null;
    };
    QuoteItemProductSummaryDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Máy phát điện Hyundai 50kVA */
      nameVi: string;
      /** @example Hyundai 50kVA Generator */
      nameEn: string | null;
      /** @example may-phat-dien-hyundai-50kva */
      slug: string;
      /** @example 180000000.00 */
      price: string;
      /**
       * @example [
       *       "https://res.cloudinary.com/hyundai/image1.jpg"
       *     ]
       */
      images: string[];
      /** @example 5 */
      totalStockCache: number;
    };
    QuoteItemResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9a */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9b */
      quoteId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      productId: string | null;
      /** @example false */
      isCustomItem: boolean;
      /** @example Máy phát điện Hyundai 50kVA */
      itemName: string | null;
      /** @example DHY50KSE */
      itemModel: string | null;
      /** @example 50kVA 3 Pha Diesel */
      itemSpecs: string | null;
      /** @example 1 */
      quantity: number;
      /** @example 180000000.00 */
      unitPrice: string | null;
      /** @example 10.00 */
      discountPercent: string | null;
      /** @example 162000000.00 */
      finalUnitPrice: string | null;
      /** @example 162000000.00 */
      totalPrice: string | null;
      /** @example 175000000.00 */
      requestedPrice: string | null;
      /** @example 162000000.00 */
      agreedPrice: string | null;
      product: components["schemas"]["QuoteItemProductSummaryDto"] | null;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
    };
    QuoteMessageSenderDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9c */
      id: string;
      /** @example Nguyễn Văn Admin */
      fullName: string;
      /** @example admin@hyundai-nhatnang.vn */
      email: string;
      /** @example ADMIN */
      role: string;
    };
    QuoteMessageResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9d */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9b */
      quoteId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9c */
      senderId: string;
      /** @example Chào chị, chúng tôi có thể hỗ trợ mức giá 14.500.000 VNĐ. */
      message: string;
      sender: components["schemas"]["QuoteMessageSenderDto"] | null;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
    };
    QuoteUserSummaryDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9e */
      id: string;
      /** @example Trần Văn Đại Lý */
      fullName: string;
      /** @example dealer@gmail.com */
      email: string;
      /** @example 0911223344 */
      phoneNumber: string;
      /** @example SALES */
      role: string;
    };
    QuoteResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9b */
      id: string;
      /** @example QT-20260904-5892 */
      quoteNumber: string | null;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9e */
      userId: string | null;
      /** @example Trần Văn Doanh */
      customerName: string | null;
      /** @example 0987654321 */
      customerPhone: string | null;
      /** @example doanh.tv@gmail.com */
      customerEmail: string | null;
      /** @example Tập đoàn Xây Dựng Số 1 */
      companyName: string | null;
      /** @example 0312345678 */
      taxId: string | null;
      /** @example Chân công trình Nhà ga T3 */
      shippingAddress: string | null;
      /**
       * @example SUBMITTED
       * @enum {string}
       */
      status:
        | "DRAFT"
        | "SUBMITTED"
        | "NEGOTIATING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED";
      /** @example 180000000.00 */
      subtotalPrice: string | null;
      /** @example 10 */
      vatRate: number | null;
      /** @example 18000000.00 */
      vatAmount: string | null;
      /** @example 198000000.00 */
      totalQuotedPrice: string | null;
      commercialTerms: components["schemas"]["QuoteCommercialTermsDto"] | null;
      /**
       * Format: date-time
       * @example 2026-09-24T08:00:00.000Z
       */
      expirationDate: string | null;
      /** @example Ghi chú báo giá */
      note: string | null;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9f */
      orderId: string | null;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9c */
      createdByAdminId: string | null;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-09-04T08:00:00.000Z
       */
      updatedAt: string;
      items: components["schemas"]["QuoteItemResponseDto"][];
      messages?: components["schemas"]["QuoteMessageResponseDto"][];
      user: components["schemas"]["QuoteUserSummaryDto"] | null;
    };
    PaginatedQuoteResponseDto: {
      items: components["schemas"]["QuoteResponseDto"][];
      /** @example 10 */
      total: number;
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
    };
    ApproveToOrderResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9f */
      orderId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9b */
      quoteId: string;
      /**
       * @example APPROVED
       * @enum {string}
       */
      status:
        | "DRAFT"
        | "SUBMITTED"
        | "NEGOTIATING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED";
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
  DealerTiersController_getAll: {
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
            data?: components["schemas"]["DealerTierResponseDto"][];
          };
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
  DealerTiersController_getById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["DealerTierResponseDto"];
          };
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
  LeadsController_getAll: {
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
            data?: components["schemas"]["LeadResponseDto"][];
          };
        };
      };
    };
  };
  LeadsController_submitRfq: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateLeadDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["LeadResponseDto"];
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
  LeadsController_getById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["LeadResponseDto"];
          };
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
    };
  };
  LeadsController_updateStatus: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateLeadStatusDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["LeadResponseDto"];
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
    };
  };
  LeadsController_assignSales: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["LeadResponseDto"];
          };
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
    };
  };
  CategoriesController_getAll: {
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
            data?: components["schemas"]["CategoryResponseDto"][];
          };
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
  CategoriesController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCategoryDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CategoryResponseDto"];
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
    };
  };
  CategoriesController_getTree: {
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
            data?: components["schemas"]["CategoryResponseDto"][];
          };
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
  CategoriesController_getById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["CategoryResponseDto"];
          };
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
  CategoriesController_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateCategoryDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CategoryResponseDto"];
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
    };
  };
  CategoriesController_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["Object"];
          };
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
    };
  };
  BrandsController_getAll: {
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
            data?: components["schemas"]["BrandResponseDto"][];
          };
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
  BrandsController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateBrandDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["BrandResponseDto"];
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
    };
  };
  BrandsController_getById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["BrandResponseDto"];
          };
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
  BrandsController_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateBrandDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["BrandResponseDto"];
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
    };
  };
  BrandsController_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["Object"];
          };
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
    };
  };
  ProductsController_getProducts: {
    parameters: {
      query?: {
        /** @description Page number */
        page?: number;
        /** @description Items per page (max 100) */
        limit?: number;
        /** @description Search keyword */
        search?: string;
        /** @description Filter by brand UUID */
        brandId?: string;
        /** @description Filter by category UUID */
        categoryId?: string;
        /** @description Minimum price in VND */
        priceMin?: number;
        /** @description Maximum price in VND */
        priceMax?: number;
        /** @description Minimum power rating in kVA */
        powerKvaMin?: number;
        /** @description Maximum power rating in kVA */
        powerKvaMax?: number;
        /** @description Filter by voltage string */
        voltage?: string;
        phase?: "1phase" | "3phase" | "multi_phase";
        fuelType?: "diesel" | "gasoline" | "gas";
        canopyType?:
          | "silent"
          | "super_silent"
          | "open_frame"
          | "closed_case"
          | "tower"
          | "rackmount";
        sort?: "newest" | "priceAsc" | "priceDesc";
      };
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
            data?: components["schemas"]["ProductResponseDto"][];
          };
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
  ProductsController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateProductDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["ProductResponseDto"];
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
    };
  };
  ProductsController_getMetadata: {
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
            data?: components["schemas"]["ProductMetadataResponseDto"];
          };
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
  ProductsController_getById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["ProductResponseDto"];
          };
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
  ProductsController_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateProductDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["ProductResponseDto"];
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
    };
  };
  ProductsController_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
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
            data?: components["schemas"]["Object"];
          };
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
    };
  };
  WarehouseController_getAll: {
    parameters: {
      query?: {
        /** @description Whether to include deactivated warehouses */
        includeInactive?: boolean;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description List of warehouses retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseResponseDto"][];
        };
      };
    };
  };
  WarehouseController_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateWarehouseDto"];
      };
    };
    responses: {
      /** @description Warehouse created successfully */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseResponseDto"];
        };
      };
    };
  };
  WarehouseController_getProductStocks: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Product UUID */
        productId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Product warehouse stock distribution */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseStockResponseDto"][];
        };
      };
    };
  };
  WarehouseController_getWarehouseStocks: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Warehouse UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Warehouse stock inventory */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseStockResponseDto"][];
        };
      };
    };
  };
  WarehouseController_updateStock: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Warehouse UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateStockDto"];
      };
    };
    responses: {
      /** @description Warehouse stock updated and totalStockCache synchronized */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseStockResponseDto"];
        };
      };
    };
  };
  WarehouseController_getById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Warehouse UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Warehouse details */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseResponseDto"];
        };
      };
    };
  };
  WarehouseController_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Warehouse UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateWarehouseDto"];
      };
    };
    responses: {
      /** @description Warehouse updated successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WarehouseResponseDto"];
        };
      };
    };
  };
  WarehouseController_delete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Warehouse UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Warehouse deactivated successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  CartController_getCart: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description User cart retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CartResponseDto"];
        };
      };
    };
  };
  CartController_addItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AddCartItemDto"];
      };
    };
    responses: {
      /** @description Item added to cart successfully */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CartResponseDto"];
        };
      };
    };
  };
  CartController_updateItemQuantity: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Cart item UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateCartItemDto"];
      };
    };
    responses: {
      /** @description Cart item quantity updated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CartResponseDto"];
        };
      };
    };
  };
  CartController_removeItem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Cart item UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Cart item removed successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CartResponseDto"];
        };
      };
    };
  };
  CartController_mergeGuestCart: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["MergeCartDto"];
      };
    };
    responses: {
      /** @description Guest cart merged successfully with clamped quantities */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["CartResponseDto"];
        };
      };
    };
  };
  QuotesController_listQuotes: {
    parameters: {
      query?: {
        search?: string;
        status?: string;
        userId?: string;
        limit?: number;
        page?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Paginated list of quotes retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PaginatedQuoteResponseDto"];
        };
      };
    };
  };
  QuotesController_submitRfq: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Customer RFQ submitted successfully */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["QuoteResponseDto"];
        };
      };
    };
  };
  QuotesController_createAdminQuote: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B2B quote created successfully */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["QuoteResponseDto"];
        };
      };
    };
  };
  QuotesController_getQuoteById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Quote UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Quote details retrieved successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["QuoteResponseDto"];
        };
      };
    };
  };
  QuotesController_updateStatus: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Quote UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Quote status updated successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["QuoteResponseDto"];
        };
      };
    };
  };
  QuotesController_updateItemPrice: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Quote UUID */
        id: string;
        /** @description Quote item UUID */
        itemId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Quote item price adjusted successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["QuoteResponseDto"];
        };
      };
    };
  };
  QuotesController_sendMessage: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Quote UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Negotiation message recorded successfully */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["QuoteMessageResponseDto"];
        };
      };
    };
  };
  QuotesController_approveToOrder: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Quote UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Quote approved and converted to order successfully */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApproveToOrderResponseDto"];
        };
      };
    };
  };
  QuotesController_exportExcel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Quote UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Excel workbook stream */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
