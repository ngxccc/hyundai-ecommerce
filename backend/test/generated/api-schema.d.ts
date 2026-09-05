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
  "/orders/checkout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Guest checkout for storefront retail customers */
    post: operations["OrdersController_checkout"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/orders/admin": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create official B2B order (Admin/Sales) */
    post: operations["OrdersController_createB2bOrder"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/orders": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List orders with filtering and pagination */
    get: operations["OrdersController_listOrders"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/orders/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get detailed order by ID */
    get: operations["OrdersController_getOrderById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/orders/{id}/status": {
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
    /** Update order status along state machine */
    patch: operations["OrdersController_updateStatus"];
    trace?: never;
  };
  "/orders/{id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cancel order and release reserved stock */
    post: operations["OrdersController_cancelOrder"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/orders/cron/expire": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Auto-expire pending unpaid orders and restock inventory (Cron) */
    post: operations["OrdersController_expireOrders"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/payments/checkout-link": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create PayOS checkout link and VietQR code */
    post: operations["PaymentsController_createCheckoutLink"];
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
    /** Receive and cryptographically verify PayOS payment webhook */
    post: operations["PaymentsController_handleWebhook"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/payments/{id}/verify-cash": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Verify offline cash payment (Admin/Accountant) */
    post: operations["PaymentsController_verifyCashPayment"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/payments/repay-debt": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Repay B2B dealer debt via PayOS gateway or cash */
    post: operations["PaymentsController_repayDebt"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/payments/order/{orderId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get order payment status and transactions */
    get: operations["PaymentsController_getOrderPaymentSummary"];
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
    PaginationMetaDto: {
      /**
       * @description Current page index (1-based)
       * @example 1
       */
      page: number;
      /**
       * @description Number of records per page
       * @example 20
       */
      limit: number;
      /**
       * @description Total number of matching records
       * @example 100
       */
      total: number;
      /**
       * @description Total number of calculated pages
       * @example 5
       */
      totalPages: number;
      /**
       * @description Indicates if there is a next page available
       * @example true
       */
      hasNextPage: boolean;
      /**
       * @description Indicates if there is a previous page available
       * @example false
       */
      hasPrevPage: boolean;
    };
    PaginatedApiResponseDto: {
      /** @example true */
      success: boolean;
      meta: components["schemas"]["PaginationMetaDto"];
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
      /**
       * @description Whether the product requires quotation request (price <= 0)
       * @example false
       */
      isQuoteOnly: boolean;
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
      /**
       * @default false
       * @example false
       */
      isQuoteOnly: boolean;
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
      /** @example false */
      isQuoteOnly?: boolean;
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
    CreateQuoteItemDto: {
      /**
       * @description Catalog product UUID, or null for bespoke custom item
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId?: string;
      /**
       * @description Whether this is a bespoke line item not in catalog
       * @default false
       * @example false
       */
      isCustomItem: Record<string, never>;
      /**
       * @description Item name or description
       * @example Máy phát điện Hyundai DHY6000SE
       */
      itemName: string;
      /**
       * @description Manufacturer model code
       * @example DHY6000SE
       */
      itemModel?: string;
      /**
       * @description Technical specifications summary
       * @example 5.0kVA - 230V / 50Hz - Chống ồn
       */
      itemSpecs?: string;
      /**
       * @description Requested quantity
       * @example 2
       */
      quantity: number;
      /**
       * @description Customer target/requested unit price
       * @example 25000000.00
       */
      requestedPrice?: string;
    };
    CreateQuoteDto: {
      /**
       * @description Customer or company contact name
       * @example Công ty Cổ phần Xây dựng Nam Á
       */
      customerName: string;
      /**
       * @description Customer contact phone number
       * @example 0901234567
       */
      customerPhone: string;
      /**
       * @description Customer contact email
       * @example contact@nama.vn
       */
      customerEmail?: string;
      /**
       * @description Full registered company name
       * @example Công ty Cổ phần Xây dựng Nam Á
       */
      companyName?: string;
      /**
       * @description Corporate enterprise tax ID
       * @example 0312345678
       */
      taxId?: string;
      /**
       * @description Project or delivery site destination
       * @example Số 45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh
       */
      shippingAddress?: string;
      /**
       * @description Customer special requirements or notes
       * @example Yêu cầu giao hàng trước ngày 15/10
       */
      note?: string;
      /** @description List of requested quote items */
      items: components["schemas"]["CreateQuoteItemDto"][];
    };
    CommercialTermsDto: {
      /**
       * @description Quote validity duration in days
       * @default 15
       * @example 15
       */
      validityDays: Record<string, never>;
      /**
       * @description Commercial payment schedule and terms
       * @example Tạm ứng 30%, thanh toán 70% trước khi giao hàng
       */
      paymentSchedule?: string;
      /**
       * @description Commercial warranty terms
       * @example Bảo hành chính hãng Hyundai 24 tháng hoặc 2000 giờ chạy
       */
      warrantyTerms?: string;
      /**
       * @description Estimated lead time and delivery schedule
       * @example Trong vòng 03 ngày làm việc kể từ ngày nhận tạm ứng
       */
      deliveryTime?: string;
      /**
       * @description Delivery destination or handover site
       * @example Giao tại chân công trình bên mua
       */
      deliveryLocation?: string;
    };
    AdminQuoteItemInputDto: {
      /**
       * @description Catalog product UUID, or null for bespoke custom item
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId?: string;
      /**
       * @description Whether this is a bespoke line item not in catalog
       * @default false
       * @example false
       */
      isCustomItem: Record<string, never>;
      /**
       * @description Item name or description
       * @example Máy phát điện Hyundai DHY6000SE
       */
      itemName: string;
      /**
       * @description Manufacturer model code
       * @example DHY6000SE
       */
      itemModel?: string;
      /**
       * @description Technical specifications summary
       * @example 5.0kVA - 230V / 50Hz - Chống ồn
       */
      itemSpecs?: string;
      /**
       * @description Item quantity
       * @example 1
       */
      quantity: number;
      /**
       * @description Unit price quoted to customer (VND)
       * @example 28000000
       */
      unitPrice: Record<string, never>;
      /**
       * @description Line item discount percentage (0 - 100)
       * @default 0
       * @example 5
       */
      discountPercent: Record<string, never>;
    };
    CreateAdminQuoteDto: {
      /**
       * @description Dealer or customer UUID if registered account
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb90
       */
      userId?: string;
      /**
       * @description Customer or enterprise primary contact
       * @example Công ty TNHH Kỹ Thuật Điện Quang
       */
      customerName: string;
      /**
       * @description Customer contact phone number
       * @example 0918123456
       */
      customerPhone: string;
      /**
       * @description Customer contact email
       * @example sales@dienquang.com.vn
       */
      customerEmail?: string;
      /**
       * @description Enterprise registered corporate entity
       * @example Công ty TNHH Kỹ Thuật Điện Quang
       */
      companyName?: string;
      /**
       * @description Corporate enterprise tax ID
       * @example 0309988776
       */
      taxId?: string;
      /**
       * @description Project handover destination
       * @example Khu Công Nghiệp Sóng Thần 2, Dĩ An, Bình Dương
       */
      shippingAddress?: string;
      /**
       * @description VAT percentage rate (e.g. 10 or 8)
       * @default 10
       * @example 10
       */
      vatRate: Record<string, never>;
      /** @description Structured commercial, warranty, and delivery terms */
      commercialTerms?: components["schemas"]["CommercialTermsDto"];
      /**
       * @description Internal sales or admin remarks
       * @example Báo giá áp dụng theo chính sách đại lý cấp 1
       */
      note?: string;
      /**
       * Format: date-time
       * @description Explicit quote expiration timestamp
       * @example 2026-09-30T00:00:00.000Z
       */
      expirationDate?: string;
      /** @description Quotation line items with pricing and discounts */
      items: components["schemas"]["AdminQuoteItemInputDto"][];
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
    UpdateQuoteStatusDto: {
      /**
       * @description Target quotation workflow status
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
    UpdateQuoteItemPriceDto: {
      /**
       * @description Agreed renegotiated unit price for quote line item (VND)
       * @example 26500000.00
       */
      agreedPrice: string;
    };
    SendQuoteMessageDto: {
      /**
       * @description Negotiation message content
       * @example Chúng tôi đề xuất chiết khấu thêm 2% nếu quý khách lấy số lượng từ 5 máy trở lên.
       */
      message: string;
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
    OrderItemProductSummaryDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      id: string;
      /** @example Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha */
      nameVi: string;
      /** @example Hyundai DHY65KSE 60kVA 3 Phase Diesel Generator */
      nameEn?: string;
      /** @example may-phat-dien-diesel-hyundai-dhy65kse-60kva-3-pha */
      slug: string;
      /** @example 245000000.00 */
      price: string;
      /**
       * @example [
       *       "https://res.cloudinary.com/hyundai/image.jpg"
       *     ]
       */
      images: string[];
      /** @example 5 */
      totalStockCache: number;
    };
    OrderItemResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb91 */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb92 */
      orderId: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f */
      productId: string;
      /** @example Máy phát điện Diesel Hyundai DHY65KSE 60kVA 3 Pha */
      productName: string;
      /** @example DHY65KSE */
      productSku: string;
      /** @example 1 */
      quantity: number;
      /** @example 245000000.00 */
      unitPrice: string;
      product?: components["schemas"]["OrderItemProductSummaryDto"];
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
    OrderUserSummaryDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      id: string;
      /** @example Nguyễn Văn Đại Lý */
      fullName: string;
      /** @example dealer@example.com */
      email: string;
      /** @example 0911223344 */
      phoneNumber: string;
      /** @example SALES */
      role: string;
    };
    OrderResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb92 */
      id: string;
      /** @example ORD-20260904-4821 */
      orderNumber?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      userId?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb91 */
      leadId?: string;
      /** @example Nguyễn Văn A */
      customerName?: string;
      /** @example 0901234567 */
      customerPhone?: string;
      /** @example nguyenvana@example.com */
      customerEmail?: string;
      /** @example Công ty Cổ phần Xây Dựng Số 1 */
      companyName?: string;
      /**
       * @example PENDING
       * @enum {string}
       */
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      /** @example 500000.00 */
      shippingFee: string;
      /** @example Kho số 4, Cảng Tiên Sa, TP. Đà Nẵng */
      shippingAddress: string;
      /** @example 245500000.00 */
      totalAmount: string;
      /** @example 50000000.00 */
      depositAmount?: string;
      /** @example 195500000.00 */
      remainingAmount?: string;
      /**
       * @example PAYOS
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /**
       * @example PENDING
       * @enum {string}
       */
      paymentStatus:
        "PENDING" | "DEPOSIT_PAID" | "FULLY_PAID" | "REFUNDED" | "FAILED";
      /**
       * @example APPROVED
       * @enum {string}
       */
      approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb9c */
      approvedBy?: string;
      /** @example Giao trong giờ hành chính */
      note?: string;
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
      items: components["schemas"]["OrderItemResponseDto"][];
      user?: components["schemas"]["OrderUserSummaryDto"];
    };
    GuestOrderItemInputDto: {
      /**
       * @description Product UUID to purchase
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId: string;
      /**
       * @description Item quantity
       * @example 1
       */
      quantity: number;
    };
    CreateGuestOrderDto: {
      /**
       * @description Customer full name
       * @example Nguyễn Văn A
       */
      customerName: string;
      /**
       * @description Customer Vietnamese contact phone number
       * @example 0901234567
       */
      customerPhone: string;
      /**
       * @description Customer email address for notifications
       * @example nguyenvana@example.com
       */
      customerEmail?: string;
      /**
       * @description Delivery destination street address
       * @example Số 123 Đường Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh
       */
      shippingAddress: string;
      /**
       * @description Checkout payment method
       * @default PAYOS
       * @example PAYOS
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /**
       * @description Customer delivery notes
       * @example Giao hàng trong giờ hành chính
       */
      note?: string;
      /** @description Order line items */
      items: components["schemas"]["GuestOrderItemInputDto"][];
    };
    B2bOrderItemInputDto: {
      /**
       * @description Product UUID to purchase
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb8f
       */
      productId: string;
      /**
       * @description Item quantity
       * @example 2
       */
      quantity: number;
      /**
       * @description Custom agreed unit price overriding catalog price
       * @example 120000000.00
       */
      unitPrice?: Record<string, never>;
    };
    CreateB2bOrderDto: {
      /**
       * @description Linked customer/dealer user UUID if registered
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb90
       */
      userId?: string;
      /**
       * @description Linked CRM Lead UUID for sales attribution & tracking
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb91
       */
      leadId?: string;
      /**
       * @description Customer or representative name
       * @example Nguyễn Văn Đại Lý
       */
      customerName: string;
      /**
       * @description Contact phone number
       * @example 0911223344
       */
      customerPhone: string;
      /**
       * @description Contact email
       * @example dealer@example.com
       */
      customerEmail?: string;
      /**
       * @description Corporate company name
       * @example Công ty Cổ phần Năng Lượng Miền Trung
       */
      companyName?: string;
      /**
       * @description Shipping destination address
       * @example Kho số 4, Cảng Tiên Sa, TP. Đà Nẵng
       */
      shippingAddress: string;
      /**
       * @description B2B Payment method (TRADE_CREDIT, BANK_TRANSFER, CASH)
       * @default BANK_TRANSFER
       * @example TRADE_CREDIT
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /**
       * @description Freight / shipping fee
       * @default 0
       * @example 500000.00
       */
      shippingFee: Record<string, never>;
      /**
       * @description Initial deposit amount paid
       * @default 0
       * @example 50000000.00
       */
      depositAmount: Record<string, never>;
      /**
       * @description Internal order notes
       * @example Giao tại công trình kèm biên bản nghiệm thu
       */
      note?: string;
      /** @description Order line items */
      items: components["schemas"]["B2bOrderItemInputDto"][];
    };
    PaginatedOrderResponseDto: {
      items: components["schemas"]["OrderResponseDto"][];
      /** @example 10 */
      total: number;
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
    };
    UpdateOrderStatusDto: {
      /**
       * @description New order status along the state machine
       * @example CONFIRMED
       * @enum {string}
       */
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      /**
       * @description Reason or operational note for status change
       * @example Đã xác nhận thanh toán chuyển khoản và sẵn sàng đóng gói
       */
      note?: string;
    };
    CheckoutLinkResponseDto: {
      /**
       * @description PayOS checkout redirect web URL
       * @example https://pay.payos.vn/web/6c9b3a6e7a2e7b56b74c419b4eb14b9a
       */
      checkoutUrl: string;
      /**
       * @description VietQR EMV payload or QR code data string
       * @example 00020101021238540010A00000072701260006970422...
       */
      qrCode: string;
      /**
       * @description Unique PayOS order code identifier
       * @example 1725451234567
       */
      orderCode: number;
      /**
       * @description Payable amount in VND
       * @example 490000000
       */
      amount: number;
      /**
       * @description PayOS payment link ID
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb91
       */
      paymentLinkId: string;
    };
    CreateCheckoutLinkDto: {
      /**
       * @description Order UUID identifier to create payment link for
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb91
       */
      orderId: string;
      /**
       * @description Transaction type (FULL_PAYMENT or DEPOSIT percentage)
       * @example FULL_PAYMENT
       * @enum {string}
       */
      transactionType?:
        "FULL_PAYMENT" | "DEPOSIT" | "REMAINING" | "DEBT_REPAYMENT";
      /**
       * @description URL redirect after customer successfully completes payment
       * @example https://hyundai-nhatnang.vn/checkout/success
       */
      returnUrl?: string;
      /**
       * @description URL redirect if customer cancels payment on gateway
       * @example https://hyundai-nhatnang.vn/checkout/cancel
       */
      cancelUrl?: string;
    };
    PayOSWebhookDataClass: {
      /** @example 1725451234567 */
      orderCode: number;
      /** @example 490000000 */
      amount: number;
      /** @example ORD-20260904-4821 */
      description: string;
      /** @example 123456789 */
      accountNumber?: string;
      /** @example FT24248123456789 */
      reference?: string;
      /** @example 2026-09-04 15:30:00 */
      transactionDateTime?: string;
      /** @example VND */
      currency?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb91 */
      paymentLinkId?: string;
      /** @example 00 */
      code?: string;
      /** @example Success */
      desc?: string;
    };
    PayOSWebhookDto: {
      /**
       * @description Response status code
       * @example 00
       */
      code: string;
      /**
       * @description Response description
       * @example Success
       */
      desc: string;
      /**
       * @description Success status flag
       * @example true
       */
      success: boolean;
      /** @description Transaction data payload */
      data: components["schemas"]["PayOSWebhookDataClass"];
      /**
       * @description HMAC-SHA256 signature calculated with PayOS Checksum Key
       * @example 6c9b3a6e7a2e7b56b74c419b4eb14b9a...
       */
      signature: string;
    };
    PaymentTransactionResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb91 */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb92 */
      orderId: string;
      /** @example 490000000.00 */
      amount: string;
      /**
       * @example PAYOS
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /**
       * @example FULL_PAYMENT
       * @enum {string}
       */
      transactionType:
        "FULL_PAYMENT" | "DEPOSIT" | "REMAINING" | "DEBT_REPAYMENT";
      /**
       * @example PENDING
       * @enum {string}
       */
      status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
      /** @example 1725451234567 */
      orderCode?: number;
      /** @example REF-123456 */
      referenceCode?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb93 */
      verifiedBy?: string;
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
    OrderPaymentSummaryDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb92 */
      orderId: string;
      /** @example ORD-20260904-4821 */
      orderNumber?: string;
      /** @example 490000000.00 */
      totalAmount: string;
      /** @example 0.00 */
      depositAmount?: string;
      /** @example 0.00 */
      remainingAmount?: string;
      /** @example PAYOS */
      paymentMethod: string;
      /** @example FULLY_PAID */
      paymentStatus: string;
      /** @description List of related payment transactions */
      transactions: components["schemas"]["PaymentTransactionResponseDto"][];
    };
    VerifyCashPaymentDto: {
      /**
       * @description Actual cash amount collected by accountant/cashier
       * @example 490000000
       */
      amount: Record<string, never>;
      /**
       * @description Optional verification notes or internal receipt code
       * @example Đã thu đủ tiền mặt tại văn phòng Hà Nội ngày 04/09
       */
      note?: string;
    };
    DebtRepaymentResponseDto: {
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb91 */
      id: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb90 */
      userId: string;
      /** @example 50000000.00 */
      amount: string;
      /**
       * @example PAYOS
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /**
       * @example PENDING
       * @enum {string}
       */
      status: "PENDING" | "COMPLETED" | "FAILED";
      /** @example 1725451234568 */
      orderCode?: number;
      /** @example REPAY-REF-789 */
      referenceCode?: string;
      /** @example 019fa8bc-8f4d-7000-b366-e691f45cfb93 */
      verifiedBy?: string;
      /** @example https://pay.payos.vn/web/6c9b3a6e7a2e7b56b74c419b4eb14b9a */
      checkoutUrl?: string;
      /** @example 00020101021238540010A00000072701260006970422... */
      qrCode?: string;
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
    RepayDebtDto: {
      /**
       * @description Target dealer user UUID if processed by Admin/Sales
       * @example 019fa8bc-8f4d-7000-b366-e691f45cfb90
       */
      userId?: string;
      /**
       * @description Debt repayment amount in VND
       * @example 50000000
       */
      amount: Record<string, never>;
      /**
       * @description Payment method used for repayment (PAYOS, CASH, BANK_TRANSFER)
       * @example PAYOS
       * @enum {string}
       */
      paymentMethod?: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /**
       * @description Repayment note or reference
       * @example Thanh toán công nợ lô máy phát điện tháng 08
       */
      note?: string;
      /**
       * @description Return URL after online payment completes
       * @example https://hyundai-nhatnang.vn/portal/debt?repaymentSuccess=true
       */
      returnUrl?: string;
      /**
       * @description Cancel URL if customer cancels payment
       * @example https://hyundai-nhatnang.vn/portal/debt?repaymentCancel=true
       */
      cancelUrl?: string;
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
        /** @description Minimum power in kVA (alias for powerKvaMin) */
        minPower?: number;
        /** @description Maximum power in kVA (alias for powerKvaMax) */
        maxPower?: number;
        /** @description Filter by engine brand */
        engineBrand?: string;
        /** @description Filter by alternator brand */
        alternatorBrand?: string;
        /** @description Stock/lifecycle status */
        status?: "active" | "outOfStock" | "all";
        /** @description Filter products marked for quote only */
        isQuoteOnly?: boolean;
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
          "application/json": components["schemas"]["PaginatedApiResponseDto"] & {
            data?: components["schemas"]["ProductResponseDto"][];
            meta?: components["schemas"]["PaginationMetaDto"];
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseResponseDto"][];
          };
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
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseStockResponseDto"][];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseStockResponseDto"][];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseStockResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["WarehouseResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CartResponseDto"];
          };
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
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CartResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CartResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CartResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CartResponseDto"];
          };
        };
      };
    };
  };
  QuotesController_listQuotes: {
    parameters: {
      query?: {
        /** @description Pagination page number (1-based) */
        page?: number;
        /** @description Number of records per page (max 100) */
        limit?: number;
        /** @description Filter quotes by customer/dealer user UUID */
        userId?: string;
        /** @description Filter quotes by status */
        status?:
          | "DRAFT"
          | "SUBMITTED"
          | "NEGOTIATING"
          | "APPROVED"
          | "REJECTED"
          | "EXPIRED";
        /** @description Search keyword matching quoteNumber, customer, or company */
        search?: string;
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
            data?: components["schemas"]["PaginatedQuoteResponseDto"];
          };
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
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateQuoteDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["QuoteResponseDto"];
          };
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
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateAdminQuoteDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["QuoteResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["QuoteResponseDto"];
          };
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
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateQuoteStatusDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["QuoteResponseDto"];
          };
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
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateQuoteItemPriceDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["QuoteResponseDto"];
          };
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
    requestBody: {
      content: {
        "application/json": components["schemas"]["SendQuoteMessageDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["QuoteMessageResponseDto"];
          };
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
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["ApproveToOrderResponseDto"];
          };
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
  OrdersController_checkout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateGuestOrderDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["OrderResponseDto"];
          };
        };
      };
    };
  };
  OrdersController_createB2bOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateB2bOrderDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["OrderResponseDto"];
          };
        };
      };
    };
  };
  OrdersController_listOrders: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
        status?:
          "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
        paymentStatus?:
          "PENDING" | "DEPOSIT_PAID" | "FULLY_PAID" | "REFUNDED" | "FAILED";
        paymentMethod?: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
        userId?: string;
        customerPhone?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
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
            data?: components["schemas"]["PaginatedOrderResponseDto"];
          };
        };
      };
    };
  };
  OrdersController_getOrderById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Order UUID */
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
            data?: components["schemas"]["OrderResponseDto"];
          };
        };
      };
    };
  };
  OrdersController_updateStatus: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Order UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateOrderStatusDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["OrderResponseDto"];
          };
        };
      };
    };
  };
  OrdersController_cancelOrder: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Order UUID */
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
            data?: components["schemas"]["OrderResponseDto"];
          };
        };
      };
    };
  };
  OrdersController_expireOrders: {
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
    };
  };
  PaymentsController_createCheckoutLink: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateCheckoutLinkDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["CheckoutLinkResponseDto"];
          };
        };
      };
    };
  };
  PaymentsController_handleWebhook: {
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
          "application/json": components["schemas"]["ApiResponseDto"] & {
            /** @default null */
            data: Record<string, never> | null;
          };
        };
      };
    };
  };
  PaymentsController_verifyCashPayment: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Order UUID */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["VerifyCashPaymentDto"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["OrderPaymentSummaryDto"];
          };
        };
      };
    };
  };
  PaymentsController_repayDebt: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RepayDebtDto"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ApiResponseDto"] & {
            data?: components["schemas"]["DebtRepaymentResponseDto"];
          };
        };
      };
    };
  };
  PaymentsController_getOrderPaymentSummary: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Order UUID */
        orderId: string;
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
            data?: components["schemas"]["OrderPaymentSummaryDto"];
          };
        };
      };
    };
  };
}
