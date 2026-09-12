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
  "/api/v1/auth/register": {
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
    post: operations["AuthController_register_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/verify-email": {
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
    post: operations["AuthController_verifyEmail_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/resend-verification": {
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
    post: operations["AuthController_resendVerification_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/login": {
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
    post: operations["AuthController_login_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/refresh": {
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
    post: operations["AuthController_refresh_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/logout": {
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
    post: operations["AuthController_logout_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/logout-all": {
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
    post: operations["AuthController_logoutAll_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/forgot-password": {
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
    post: operations["AuthController_forgotPassword_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/reset-password": {
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
    post: operations["AuthController_resetPassword_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/change-password": {
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
    post: operations["AuthController_changePassword_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/me": {
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
    get: operations["UsersController_getMe_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/dealer-tiers": {
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
    get: operations["DealerTiersController_getAll_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/dealer-tiers/{id}": {
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
    get: operations["DealerTiersController_getById_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/leads": {
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
    get: operations["LeadsController_getAll_v1"];
    put?: never;
    /**
     * Submit Request for Quote (Storefront RFQ)
     * @description Public endpoint allowing customers and B2B buyers to request quotes for products without signing up.
     */
    post: operations["LeadsController_submitRfq_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/leads/{id}": {
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
    get: operations["LeadsController_getById_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/leads/{id}/status": {
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
    patch: operations["LeadsController_updateStatus_v1"];
    trace?: never;
  };
  "/api/v1/leads/{id}/assign": {
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
    patch: operations["LeadsController_assignSales_v1"];
    trace?: never;
  };
  "/api/v1/categories": {
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
    get: operations["CategoriesController_getAll_v1"];
    put?: never;
    /**
     * Create category (Admin only)
     * @description Creates a new category in the catalog.
     */
    post: operations["CategoriesController_create_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/categories/tree": {
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
    get: operations["CategoriesController_getTree_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/categories/{id}": {
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
    get: operations["CategoriesController_getById_v1"];
    /**
     * Update category (Admin only)
     * @description Updates an existing category by UUID.
     */
    put: operations["CategoriesController_update_v1"];
    post?: never;
    /**
     * Delete category (Admin only)
     * @description Deletes an existing category by UUID.
     */
    delete: operations["CategoriesController_delete_v1"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/brands": {
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
    get: operations["BrandsController_getAll_v1"];
    put?: never;
    /**
     * Create brand (Admin only)
     * @description Creates a new brand in the catalog.
     */
    post: operations["BrandsController_create_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/brands/{id}": {
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
    get: operations["BrandsController_getById_v1"];
    /**
     * Update brand (Admin only)
     * @description Updates an existing brand by UUID.
     */
    put: operations["BrandsController_update_v1"];
    post?: never;
    /**
     * Delete brand (Admin only)
     * @description Deletes an existing brand by UUID.
     */
    delete: operations["BrandsController_delete_v1"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/products": {
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
    get: operations["ProductsController_getProducts_v1"];
    put?: never;
    /**
     * Create product (Admin only)
     * @description Creates a new product with technical specifications and images.
     */
    post: operations["ProductsController_create_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/products/metadata": {
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
    get: operations["ProductsController_getMetadata_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/products/{id}": {
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
    get: operations["ProductsController_getById_v1"];
    /**
     * Update product (Admin only)
     * @description Updates an existing product by UUID.
     */
    put: operations["ProductsController_update_v1"];
    post?: never;
    /**
     * Delete product (Admin only)
     * @description Soft deletes an existing product by UUID.
     */
    delete: operations["ProductsController_delete_v1"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/warehouses": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List all physical warehouses */
    get: operations["WarehouseController_getAll_v1"];
    put?: never;
    /** Create a new physical warehouse (Admin Only) */
    post: operations["WarehouseController_create_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/warehouses/stock/product/{productId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get stock distribution across all warehouses for a product */
    get: operations["WarehouseController_getProductStocks_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/warehouses/{id}/stock": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all product inventory stocks located in a warehouse */
    get: operations["WarehouseController_getWarehouseStocks_v1"];
    /** Update product stock in a warehouse and atomically sync totalStockCache (Admin Only) */
    put: operations["WarehouseController_updateStock_v1"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/warehouses/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get warehouse details by UUID */
    get: operations["WarehouseController_getById_v1"];
    /** Update warehouse details (Admin Only) */
    put: operations["WarehouseController_update_v1"];
    post?: never;
    /** Deactivate warehouse (Admin Only) */
    delete: operations["WarehouseController_delete_v1"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/cart": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get current authenticated user shopping cart
     * @deprecated
     * @description Legacy B2C cart endpoint. Retained dormant for potential future retail flows.
     */
    get: operations["CartController_getCart_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/cart/items": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Add item to cart or increment quantity
     * @deprecated
     */
    post: operations["CartController_addItem_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/cart/items/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * Update quantity of a cart item
     * @deprecated
     */
    put: operations["CartController_updateItemQuantity_v1"];
    post?: never;
    /**
     * Remove item from cart
     * @deprecated
     */
    delete: operations["CartController_removeItem_v1"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/cart/merge": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Merge guest cart items into authenticated user cart with inventory stock clamping
     * @deprecated
     */
    post: operations["CartController_mergeGuestCart_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List quotes with filtering and pagination */
    get: operations["QuotesController_listQuotes_v1"];
    put?: never;
    /** Submit customer Request For Quotation (RFQ) */
    post: operations["QuotesController_submitRfq_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes/admin": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create official B2B quotation (Admin only) */
    post: operations["QuotesController_createAdminQuote_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get detailed quote by ID */
    get: operations["QuotesController_getQuoteById_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes/{id}/status": {
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
    patch: operations["QuotesController_updateStatus_v1"];
    trace?: never;
  };
  "/api/v1/quotes/{id}/items/{itemId}/price": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Update negotiated price for a quote line item (Admin only) */
    put: operations["QuotesController_updateItemPrice_v1"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes/{id}/messages": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Post a message to quote negotiation timeline */
    post: operations["QuotesController_sendMessage_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes/{id}/approve-to-order": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Approve quote and convert to order (Admin only) */
    post: operations["QuotesController_approveToOrder_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/quotes/{id}/export-excel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Download B2B quote Excel (.xlsx) spreadsheet */
    get: operations["QuotesController_exportExcel_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/orders/checkout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Guest checkout for storefront retail customers */
    post: operations["OrdersController_checkout_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/orders/admin": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create official B2B order (Admin/Sales) */
    post: operations["OrdersController_createB2bOrder_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/orders": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List orders with filtering and pagination */
    get: operations["OrdersController_listOrders_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/orders/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get detailed order by ID */
    get: operations["OrdersController_getOrderById_v1"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/orders/{id}/status": {
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
    patch: operations["OrdersController_updateStatus_v1"];
    trace?: never;
  };
  "/api/v1/orders/{id}/cancel": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cancel order and release reserved stock */
    post: operations["OrdersController_cancelOrder_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/orders/cron/expire": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Auto-expire pending unpaid orders and restock inventory (Cron) */
    post: operations["OrdersController_expireOrders_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/payments/checkout-link": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create PayOS checkout link and VietQR code */
    post: operations["PaymentsController_createCheckoutLink_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/payments/payos-webhook": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Receive and cryptographically verify PayOS payment webhook */
    post: operations["PaymentsController_handleWebhook_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/payments/{id}/verify-cash": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Verify offline cash payment (Admin/Accountant) */
    post: operations["PaymentsController_verifyCashPayment_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/payments/repay-debt": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Repay B2B dealer debt via PayOS gateway or cash */
    post: operations["PaymentsController_repayDebt_v1"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/payments/order/{orderId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get order payment status and transactions */
    get: operations["PaymentsController_getOrderPaymentSummary_v1"];
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
    HealthResponseDto: {
      status: string;
    };
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
      /**
       * @description Machine-readable error code
       * @example CART_OUT_OF_STOCK
       */
      code?: string;
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
      email: string;
      fullName: string;
      phoneNumber: string;
      /** Format: password */
      password: unknown & unknown;
      confirmPassword: string;
      /** @constant */
      agreeTerms: true;
    };
    VerifyEmailDto: {
      token: string;
    };
    ResendVerificationDto: {
      email: string;
    };
    LoginResponseDto: {
      accessToken: string;
      refreshToken: string;
      user: {
        /** Format: uuid */
        id: string;
        email: string;
        fullName: string;
        /** @enum {string} */
        role: "ADMIN" | "SALES";
        /** @enum {string} */
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
      };
    };
    LoginDto: {
      email: string;
      password: string;
    };
    RefreshResponseDto: {
      accessToken: string;
      refreshToken: string;
    };
    RefreshTokenDto: {
      refreshToken: string;
    };
    ForgotPasswordDto: {
      email: string;
    };
    ResetPasswordDto: {
      token: string;
      /** Format: password */
      password: unknown & unknown;
      confirmPassword: string;
    };
    ChangePasswordDto: {
      currentPassword: string;
      /** Format: password */
      newPassword: unknown & unknown;
    };
    UserResponseDto: {
      /** Format: uuid */
      id: string;
      email: string;
      fullName: string;
      phoneNumber: string;
      avatarUrl: string | null;
      /** @enum {string} */
      role: "ADMIN" | "SALES";
      /** @enum {string} */
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
      isVerified: boolean;
      dealerCompany: {
        companyName: string | null;
        taxId: string | null;
        businessType:
          | ("CONTRACTOR" | "COMMERCIAL" | "GOVERNMENT" | "END_USER" | "DEALER")
          | null;
        province: string | null;
        creditLimit: string;
        currentDebt: string;
        availableCredit: string;
        parentId: string | null;
        tier: {
          /** Format: uuid */
          id: string;
          nameVi: string;
          nameEn: string | null;
          discountPercentage: string;
        } | null;
      } | null;
    };
    DealerTierResponseDto: {
      /** Format: uuid */
      id: string;
      nameVi: string;
      nameEn: string | null;
      discountPercentage: string;
      minimumSpend: string;
    };
    LeadResponseDto: {
      /** Format: uuid */
      id: string;
      leadCode: string;
      fullName: string;
      phoneNumber: string;
      email: string | null;
      companyName: string | null;
      city: string;
      ward: string;
      streetAddress: string | null;
      notes: string | null;
      /** @enum {string} */
      status:
        | "NEW"
        | "CONTACTING"
        | "SURVEY_SCHEDULED"
        | "QUOTED"
        | "CONVERTED"
        | "REJECTED"
        | "LOST";
      assignedSalesId: string | null;
      lostReason: string | null;
      /** Format: date-time */
      createdAt: string;
      items?: {
        /** Format: uuid */
        id: string;
        /** Format: uuid */
        productId: string;
        quantity: number;
        productNameVi: string;
        productNameEn: string | null;
        productModel: string | null;
        productSku: string | null;
      }[];
    };
    CreateLeadDto: {
      fullName: string;
      phoneNumber: string;
      email?: string;
      companyName?: string;
      city: string;
      ward: string;
      streetAddress?: string;
      notes?: string;
      items: {
        /** Format: uuid */
        productId: string;
        /** @default 1 */
        quantity: number;
      }[];
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
    UpdateLeadStatusDto: {
      /** @enum {string} */
      status:
        | "NEW"
        | "CONTACTING"
        | "SURVEY_SCHEDULED"
        | "QUOTED"
        | "CONVERTED"
        | "REJECTED"
        | "LOST";
      lostReason?: string;
    };
    AssignSalesDto: {
      /** Format: uuid */
      salesId: string;
    };
    CategoryResponseDto: {
      /** Format: uuid */
      id: string;
      slug: string;
      parentId: string | null;
      image: string | null;
      isActive: boolean;
      name: string;
      description: string | null;
      translations?: {
        locale: string;
        name: string;
        description: string | null;
      }[];
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      children?: components["schemas"]["CategoryResponseDto"][];
    };
    CreateCategoryDto: {
      slug: string;
      parentId?: string | null;
      image?: string | null;
      /** @default true */
      isActive: boolean;
      translations: {
        locale: string;
        name: string;
        description?: string | null;
      }[];
    };
    UpdateCategoryDto: {
      slug?: string;
      parentId?: string | null;
      image?: string | null;
      isActive?: boolean;
      translations?: {
        locale: string;
        name: string;
        description?: string | null;
      }[];
    };
    BrandResponseDto: {
      /** Format: uuid */
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      description: string | null;
      translations?: {
        locale: string;
        description: string | null;
      }[];
      isActive: boolean;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
    };
    CreateBrandDto: {
      name: string;
      slug: string;
      logo?: string | null;
      translations?: {
        locale: string;
        description?: string | null;
      }[];
      /** @default true */
      isActive: boolean;
    };
    UpdateBrandDto: {
      name?: string;
      slug?: string;
      logo?: string | null;
      translations?: {
        locale: string;
        description?: string | null;
      }[];
      isActive?: boolean;
    };
    ProductResponseDto__schema0: {
      type?: string;
      attrs?: {
        [key: string]: unknown;
      };
      content?: components["schemas"]["ProductResponseDto__schema0"][];
      marks?: ({
        type: string;
        attrs?: {
          [key: string]: unknown;
        };
      } & {
        [key: string]: unknown;
      })[];
      text?: string;
    } & {
      [key: string]: unknown;
    };
    ProductResponseDto__schema1: {
      /** Format: uuid */
      id: string;
      slug: string;
      parentId: string | null;
      image: string | null;
      isActive: boolean;
      name: string;
      description: string | null;
      translations?: {
        locale: string;
        name: string;
        description: string | null;
      }[];
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      children?: components["schemas"]["ProductResponseDto__schema1"][];
    };
    ProductResponseDto: {
      /** Format: uuid */
      id: string;
      slug: string;
      price: string;
      isQuoteOnly: boolean;
      name: string;
      shortDescription: string | null;
      description?: components["schemas"]["ProductResponseDto__schema0"] | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
      translations?: {
        locale: string;
        name: string;
        shortDescription: string | null;
        description?:
          components["schemas"]["ProductResponseDto__schema0"] | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
      }[];
      images: string[];
      brandId: string | null;
      categoryId: string | null;
      /** @enum {string} */
      productType: "generator" | "ups" | "ats" | "accessory";
      powerKva: string | null;
      powerKw: string | null;
      standbyPowerKva: string | null;
      standbyPowerKw: string | null;
      phase: ("1phase" | "3phase" | "multi_phase") | null;
      voltage: string | null;
      frequency: number | null;
      fuelType: ("diesel" | "gasoline" | "gas") | null;
      canopyType:
        | (
            | "silent"
            | "super_silent"
            | "open_frame"
            | "closed_case"
            | "tower"
            | "rackmount"
          )
        | null;
      startMethod: ("electric" | "recoil" | "remote" | "auto_ats") | null;
      engineBrand: string | null;
      alternatorBrand: string | null;
      upsTopology:
        ("offline" | "line_interactive" | "online_double_conversion") | null;
      upsBatteryType: ("internal" | "external") | null;
      specSheet: {
        groupKey: string;
        titleVi: string;
        titleEn?: string;
        /** @default 0 */
        order: number;
        items: {
          key: string;
          nameVi: string;
          nameEn?: string;
          value: string;
          unit?: string | null;
        }[];
      }[];
      /** @default {} */
      specs: {
        model?: string;
        origin?: string;
        engineModel?: string;
        alternatorModel?: string;
        controller?: string;
        dimensions?: string;
        weight?: string;
        noiseLevel?: string;
        fuelConsumption?: string;
        warranty?: string;
      } & {
        [key: string]: unknown;
      };
      totalStockCache: number;
      totalSalesCache: number;
      isActive: boolean;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      brand?: {
        /** Format: uuid */
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        description: string | null;
        translations?: {
          locale: string;
          description: string | null;
        }[];
        isActive: boolean;
        /** Format: date-time */
        createdAt: string;
        /** Format: date-time */
        updatedAt: string;
      } | null;
      category?: components["schemas"]["ProductResponseDto__schema1"] | null;
    };
    ProductMetadataResponseDto: {
      brands: {
        /** Format: uuid */
        id: string;
        name: string;
        count: number;
      }[];
      categories: {
        /** Format: uuid */
        id: string;
        name: string;
        count: number;
      }[];
      powerRange: {
        min: number;
        max: number;
      };
      priceRange: {
        min: number;
        max: number;
      };
      fuelTypes: {
        value: string;
        count: number;
      }[];
      phases: {
        value: string;
        count: number;
      }[];
      canopyTypes: {
        value: string;
        count: number;
      }[];
    };
    CreateProductDto__schema0: {
      type?: string;
      attrs?: {
        [key: string]: unknown;
      };
      content?: components["schemas"]["CreateProductDto__schema0"][];
      marks?: ({
        type: string;
        attrs?: {
          [key: string]: unknown;
        };
      } & {
        [key: string]: unknown;
      })[];
      text?: string;
    } & {
      [key: string]: unknown;
    };
    CreateProductDto: {
      slug: string;
      /** @default 0 */
      price: number;
      translations: {
        locale: string;
        name: string;
        shortDescription?: string | null;
        description?: components["schemas"]["CreateProductDto__schema0"] | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
      }[];
      images?: string[];
      brandId?: string | null;
      categoryId?: string | null;
      /**
       * @default generator
       * @enum {string}
       */
      productType: "generator" | "ups" | "ats" | "accessory";
      powerKva?: number | null;
      powerKw?: number | null;
      standbyPowerKva?: number | null;
      standbyPowerKw?: number | null;
      phase?: ("1phase" | "3phase" | "multi_phase") | null;
      voltage?: string | null;
      /** @default 50 */
      frequency: number;
      fuelType?: ("diesel" | "gasoline" | "gas") | null;
      canopyType?:
        | (
            | "silent"
            | "super_silent"
            | "open_frame"
            | "closed_case"
            | "tower"
            | "rackmount"
          )
        | null;
      startMethod?: ("electric" | "recoil" | "remote" | "auto_ats") | null;
      engineBrand?: string | null;
      alternatorBrand?: string | null;
      upsTopology?:
        ("offline" | "line_interactive" | "online_double_conversion") | null;
      upsBatteryType?: ("internal" | "external") | null;
      /** @default [] */
      specSheet: {
        groupKey: string;
        titleVi: string;
        titleEn?: string;
        /** @default 0 */
        order: number;
        items: {
          key: string;
          nameVi: string;
          nameEn?: string;
          value: string;
          unit?: string | null;
        }[];
      }[];
      /** @default {} */
      specs: {
        model?: string;
        origin?: string;
        engineModel?: string;
        alternatorModel?: string;
        controller?: string;
        dimensions?: string;
        weight?: string;
        noiseLevel?: string;
        fuelConsumption?: string;
        warranty?: string;
      } & {
        [key: string]: unknown;
      };
      /** @default 0 */
      totalStockCache: number;
      /** @default false */
      isQuoteOnly: boolean;
      /** @default true */
      isActive: boolean;
    };
    UpdateProductDto__schema0: {
      type?: string;
      attrs?: {
        [key: string]: unknown;
      };
      content?: components["schemas"]["UpdateProductDto__schema0"][];
      marks?: ({
        type: string;
        attrs?: {
          [key: string]: unknown;
        };
      } & {
        [key: string]: unknown;
      })[];
      text?: string;
    } & {
      [key: string]: unknown;
    };
    UpdateProductDto: {
      slug?: string;
      price?: number;
      translations?: {
        locale: string;
        name: string;
        shortDescription?: string | null;
        description?: components["schemas"]["UpdateProductDto__schema0"] | null;
        seoTitle?: string | null;
        seoDescription?: string | null;
      }[];
      images?: string[];
      brandId?: string | null;
      categoryId?: string | null;
      /** @enum {string} */
      productType?: "generator" | "ups" | "ats" | "accessory";
      powerKva?: number | null;
      powerKw?: number | null;
      standbyPowerKva?: number | null;
      standbyPowerKw?: number | null;
      phase?: ("1phase" | "3phase" | "multi_phase") | null;
      voltage?: string | null;
      frequency?: number;
      fuelType?: ("diesel" | "gasoline" | "gas") | null;
      canopyType?:
        | (
            | "silent"
            | "super_silent"
            | "open_frame"
            | "closed_case"
            | "tower"
            | "rackmount"
          )
        | null;
      startMethod?: ("electric" | "recoil" | "remote" | "auto_ats") | null;
      engineBrand?: string | null;
      alternatorBrand?: string | null;
      upsTopology?:
        ("offline" | "line_interactive" | "online_double_conversion") | null;
      upsBatteryType?: ("internal" | "external") | null;
      specSheet?: {
        groupKey: string;
        titleVi: string;
        titleEn?: string;
        /** @default 0 */
        order: number;
        items: {
          key: string;
          nameVi: string;
          nameEn?: string;
          value: string;
          unit?: string | null;
        }[];
      }[];
      specs?: {
        model?: string;
        origin?: string;
        engineModel?: string;
        alternatorModel?: string;
        controller?: string;
        dimensions?: string;
        weight?: string;
        noiseLevel?: string;
        fuelConsumption?: string;
        warranty?: string;
      } & {
        [key: string]: unknown;
      };
      totalStockCache?: number;
      isQuoteOnly?: boolean;
      isActive?: boolean;
    };
    WarehouseResponseDto: {
      /** Format: uuid */
      id: string;
      nameVi: string;
      nameEn: string | null;
      streetAddress: string;
      district: string;
      city: string;
      isActive: boolean;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
    };
    WarehouseStockResponseDto: {
      /** Format: uuid */
      warehouseId: string;
      /** Format: uuid */
      productId: string;
      stock: number;
      minStockWarning: number;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      product?: {
        /** Format: uuid */
        id: string;
        name: string;
        nameVi?: string;
        slug: string;
        totalStockCache: number;
      } | null;
      warehouse?: {
        /** Format: uuid */
        id: string;
        nameVi: string;
        city: string;
      } | null;
    };
    CreateWarehouseDto: {
      nameVi: string;
      nameEn?: string | null;
      streetAddress: string;
      district: string;
      city: string;
      /** @default true */
      isActive: boolean;
    };
    UpdateStockDto: {
      /** Format: uuid */
      productId: string;
      stock: number;
      /** @default 2 */
      minStockWarning: number;
    };
    UpdateWarehouseDto: {
      nameVi?: string;
      nameEn?: string | null;
      streetAddress?: string;
      district?: string;
      city?: string;
      isActive?: boolean;
    };
    Object: Record<string, never>;
    CartResponseDto: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      userId: string;
      items: {
        /** Format: uuid */
        id: string;
        /** Format: uuid */
        productId: string;
        quantity: number;
        lineTotal: string;
        product: {
          /** Format: uuid */
          id: string;
          name: string;
          slug: string;
          price: string;
          images: string[];
          totalStockCache: number;
          isActive: boolean;
          isOutOfStock: boolean;
        };
        /** Format: date-time */
        createdAt: string;
        /** Format: date-time */
        updatedAt: string;
      }[];
      summary: {
        totalItems: number;
        totalAmount: string;
      };
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
    };
    AddCartItemDto: {
      /** Format: uuid */
      productId: string;
      /** @default 1 */
      quantity: number;
    };
    UpdateCartItemDto: {
      quantity: number;
    };
    MergeCartDto: {
      items: {
        /** Format: uuid */
        productId: string;
        quantity: number;
      }[];
    };
    QuoteResponseDto: {
      /** Format: uuid */
      id: string;
      quoteNumber: string | null;
      userId: string | null;
      customerName: string | null;
      customerPhone: string | null;
      customerEmail: string | null;
      companyName: string | null;
      taxId: string | null;
      shippingAddress: string | null;
      /** @enum {string} */
      status:
        | "DRAFT"
        | "SUBMITTED"
        | "NEGOTIATING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED";
      subtotalPrice: string | null;
      vatRate: number | null;
      vatAmount: string | null;
      totalQuotedPrice: string | null;
      commercialTerms?: {
        /** @default 15 */
        validityDays: number;
        paymentSchedule?: string | null;
        warrantyTerms?: string | null;
        deliveryTime?: string | null;
        deliveryLocation?: string | null;
      } | null;
      expirationDate: string | null;
      note: string | null;
      orderId: string | null;
      createdByAdminId: string | null;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      items: {
        /** Format: uuid */
        id: string;
        /** Format: uuid */
        quoteId: string;
        productId: string | null;
        isCustomItem: boolean;
        itemName: string | null;
        itemModel: string | null;
        itemSpecs: string | null;
        quantity: number;
        unitPrice: string | null;
        discountPercent: string | null;
        finalUnitPrice: string | null;
        totalPrice: string | null;
        requestedPrice: string | null;
        agreedPrice: string | null;
        product?: {
          /** Format: uuid */
          id: string;
          name: string;
          nameVi?: string;
          nameEn?: string | null;
          slug: string;
          price: string;
          images: string[];
          totalStockCache: number;
        } | null;
        /** Format: date-time */
        createdAt: string;
        /** Format: date-time */
        updatedAt: string;
      }[];
      messages?: {
        /** Format: uuid */
        id: string;
        /** Format: uuid */
        quoteId: string;
        /** Format: uuid */
        senderId: string;
        message: string;
        sender?: {
          /** Format: uuid */
          id: string;
          fullName: string;
          email: string;
          role: string;
        } | null;
        /** Format: date-time */
        createdAt: string;
        /** Format: date-time */
        updatedAt: string;
      }[];
      user?: {
        /** Format: uuid */
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        role: string;
      } | null;
    };
    CreateQuoteDto: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string | null;
      companyName?: string | null;
      taxId?: string | null;
      shippingAddress?: string | null;
      note?: string | null;
      items: {
        productId?: string | null;
        /** @default false */
        isCustomItem: boolean;
        itemName: string;
        itemModel?: string | null;
        itemSpecs?: string | null;
        quantity: number;
        requestedPrice?: string | null;
      }[];
    };
    CreateAdminQuoteDto: {
      userId?: string | null;
      customerName: string;
      customerPhone: string;
      customerEmail?: string | null;
      companyName?: string | null;
      taxId?: string | null;
      shippingAddress?: string | null;
      /** @default 10 */
      vatRate: number;
      commercialTerms?: {
        /** @default 15 */
        validityDays: number;
        paymentSchedule?: string | null;
        warrantyTerms?: string | null;
        deliveryTime?: string | null;
        deliveryLocation?: string | null;
      } | null;
      note?: string | null;
      expirationDate?: string | null;
      items: {
        productId?: string | null;
        /** @default false */
        isCustomItem: boolean;
        itemName: string;
        itemModel?: string | null;
        itemSpecs?: string | null;
        quantity: number;
        unitPrice: number | string;
        /** @default 0 */
        discountPercent: number | string;
      }[];
    };
    UpdateQuoteStatusDto: {
      /** @enum {string} */
      status:
        | "DRAFT"
        | "SUBMITTED"
        | "NEGOTIATING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED";
    };
    UpdateQuoteItemPriceDto: {
      agreedPrice: string;
    };
    QuoteMessageResponseDto: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      quoteId: string;
      /** Format: uuid */
      senderId: string;
      message: string;
      sender?: {
        /** Format: uuid */
        id: string;
        fullName: string;
        email: string;
        role: string;
      } | null;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
    };
    SendQuoteMessageDto: {
      message: string;
    };
    ApproveToOrderResponseDto: {
      /** Format: uuid */
      orderId: string;
      /** Format: uuid */
      quoteId: string;
      /** @enum {string} */
      status:
        | "DRAFT"
        | "SUBMITTED"
        | "NEGOTIATING"
        | "APPROVED"
        | "REJECTED"
        | "EXPIRED";
    };
    OrderResponseDto: {
      /** Format: uuid */
      id: string;
      orderNumber?: string | null;
      userId?: string | null;
      leadId?: string | null;
      customerName?: string | null;
      customerPhone?: string | null;
      customerEmail?: string | null;
      companyName?: string | null;
      /** @enum {string} */
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      shippingFee: string;
      shippingAddress: string;
      totalAmount: string;
      depositAmount?: string | null;
      remainingAmount?: string | null;
      /** @enum {string} */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /** @enum {string} */
      paymentStatus:
        "PENDING" | "DEPOSIT_PAID" | "FULLY_PAID" | "REFUNDED" | "FAILED";
      /** @enum {string} */
      approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
      approvedBy?: string | null;
      note?: string | null;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
      items: {
        /** Format: uuid */
        id: string;
        /** Format: uuid */
        orderId: string;
        /** Format: uuid */
        productId: string;
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: string;
        product?: {
          /** Format: uuid */
          id: string;
          name: string;
          nameVi?: string;
          nameEn?: string | null;
          slug: string;
          price: string;
          images: string[];
          totalStockCache: number;
        } | null;
        /** Format: date-time */
        createdAt: string;
        /** Format: date-time */
        updatedAt: string;
      }[];
      user?: {
        /** Format: uuid */
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        role: string;
      } | null;
    };
    CreateGuestOrderDto: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string | null;
      shippingAddress: string;
      /**
       * @default PAYOS
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      note?: string | null;
      items: {
        /** Format: uuid */
        productId: string;
        quantity: number;
      }[];
    };
    CreateB2bOrderDto: {
      userId?: string | null;
      leadId?: string | null;
      customerName: string;
      customerPhone: string;
      customerEmail?: string | null;
      companyName?: string | null;
      shippingAddress: string;
      /**
       * @default BANK_TRANSFER
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /** @default 0 */
      shippingFee: number | string;
      /** @default 0 */
      depositAmount: number | string;
      note?: string | null;
      items: {
        /** Format: uuid */
        productId: string;
        quantity: number;
        unitPrice?: (number | string) | null;
      }[];
    };
    UpdateOrderStatusDto: {
      /** @enum {string} */
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      note?: string | null;
    };
    ExpireOrdersResponseDto: {
      expiredCount: number;
    };
    CheckoutLinkResponseDto: {
      checkoutUrl: string;
      qrCode: string;
      orderCode: number;
      amount: number;
      paymentLinkId: string;
    };
    CreateCheckoutLinkDto: {
      /** Format: uuid */
      orderId: string;
      /**
       * @default FULL_PAYMENT
       * @enum {string}
       */
      transactionType:
        "FULL_PAYMENT" | "DEPOSIT" | "REMAINING" | "DEBT_REPAYMENT";
      returnUrl?: string;
      cancelUrl?: string;
    };
    PayOSWebhookResponseDto: {
      processed: boolean;
      reason?: string;
    };
    PayOSWebhookDto: {
      code: string;
      desc: string;
      success: boolean;
      data: {
        orderCode: number;
        amount: number;
        description: string;
        accountNumber?: string;
        reference?: string;
        transactionDateTime?: string;
        currency?: string;
        paymentLinkId?: string;
        code?: string;
        desc?: string;
        counterAccountBankId?: string | null;
        counterAccountBankName?: string | null;
        counterAccountName?: string | null;
        counterAccountNumber?: string | null;
        virtualAccountName?: string | null;
        virtualAccountNumber?: string | null;
      };
      signature: string;
    };
    OrderPaymentSummaryDto: {
      /** Format: uuid */
      orderId: string;
      orderNumber?: string | null;
      totalAmount: string;
      depositAmount?: string | null;
      remainingAmount?: string | null;
      /** @enum {string} */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /** @enum {string} */
      paymentStatus:
        "PENDING" | "DEPOSIT_PAID" | "FULLY_PAID" | "REFUNDED" | "FAILED";
      transactions: {
        /** Format: uuid */
        id: string;
        /** Format: uuid */
        orderId: string;
        amount: string;
        /** @enum {string} */
        paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
        /** @enum {string} */
        transactionType:
          "FULL_PAYMENT" | "DEPOSIT" | "REMAINING" | "DEBT_REPAYMENT";
        /** @enum {string} */
        status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
        orderCode?: number | null;
        referenceCode?: string | null;
        verifiedBy?: string | null;
        /** Format: date-time */
        createdAt: string;
        /** Format: date-time */
        updatedAt: string;
      }[];
    };
    VerifyCashPaymentDto: {
      amount: number | string;
      note?: string | null;
    };
    DebtRepaymentResponseDto: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      userId: string;
      amount: string;
      /** @enum {string} */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      /** @enum {string} */
      status: "PENDING" | "COMPLETED" | "FAILED";
      orderCode?: number | null;
      referenceCode?: string | null;
      verifiedBy?: string | null;
      checkoutUrl?: string | null;
      qrCode?: string | null;
      /** Format: date-time */
      createdAt: string;
      /** Format: date-time */
      updatedAt: string;
    };
    RepayDebtDto: {
      userId?: string | null;
      amount: number | string;
      /**
       * @default PAYOS
       * @enum {string}
       */
      paymentMethod: "CASH" | "TRADE_CREDIT" | "PAYOS" | "BANK_TRANSFER";
      note?: string | null;
      returnUrl?: string;
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
          "application/json": components["schemas"]["HealthResponseDto"];
        };
      };
    };
  };
  AuthController_register_v1: {
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
  AuthController_verifyEmail_v1: {
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
  AuthController_resendVerification_v1: {
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
  AuthController_login_v1: {
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
  AuthController_refresh_v1: {
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
  AuthController_logout_v1: {
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
  AuthController_logoutAll_v1: {
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
  AuthController_forgotPassword_v1: {
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
  AuthController_resetPassword_v1: {
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
  AuthController_changePassword_v1: {
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
  UsersController_getMe_v1: {
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
           *       "detail": "Requested resource not found",
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
  DealerTiersController_getAll_v1: {
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
  DealerTiersController_getById_v1: {
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
           *       "detail": "Dealer tier not found",
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
  LeadsController_getAll_v1: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
        status?:
          | "NEW"
          | "CONTACTING"
          | "SURVEY_SCHEDULED"
          | "QUOTED"
          | "CONVERTED"
          | "REJECTED"
          | "LOST";
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
          "application/json": components["schemas"]["PaginatedApiResponseDto"] & {
            data?: components["schemas"]["LeadResponseDto"][];
            meta?: components["schemas"]["PaginationMetaDto"];
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
    };
  };
  LeadsController_submitRfq_v1: {
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
  LeadsController_getById_v1: {
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
           *       "detail": "Requested resource not found",
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
  LeadsController_updateStatus_v1: {
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
           *       "detail": "Requested resource not found",
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
  LeadsController_assignSales_v1: {
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
        "application/json": components["schemas"]["AssignSalesDto"];
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
           *       "detail": "Requested resource not found",
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
  CategoriesController_getAll_v1: {
    parameters: {
      query?: {
        locale?: string;
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
  CategoriesController_create_v1: {
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
  CategoriesController_getTree_v1: {
    parameters: {
      query?: {
        locale?: string;
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
  CategoriesController_getById_v1: {
    parameters: {
      query?: {
        locale?: string;
      };
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
           *       "detail": "Requested resource not found",
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
  CategoriesController_update_v1: {
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
           *       "detail": "Requested resource not found",
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
  CategoriesController_delete_v1: {
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
           *       "detail": "Requested resource not found",
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
  BrandsController_getAll_v1: {
    parameters: {
      query?: {
        locale?: string;
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
  BrandsController_create_v1: {
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
  BrandsController_getById_v1: {
    parameters: {
      query?: {
        locale?: string;
      };
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
           *       "detail": "Requested resource not found",
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
  BrandsController_update_v1: {
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
           *       "detail": "Requested resource not found",
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
  BrandsController_delete_v1: {
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
           *       "detail": "Requested resource not found",
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
  ProductsController_getProducts_v1: {
    parameters: {
      query?: {
        page?: unknown;
        limit?: unknown;
        locale?: string;
        search?: unknown;
        brandId?: string | null;
        categoryId?: string | null;
        priceMin?: unknown;
        priceMax?: unknown;
        powerKvaMin?: unknown;
        powerKvaMax?: unknown;
        minPower?: unknown;
        maxPower?: unknown;
        voltage?: unknown;
        phase?: ("1phase" | "3phase" | "multi_phase") | null;
        fuelType?: ("diesel" | "gasoline" | "gas") | null;
        canopyType?:
          | (
              | "silent"
              | "super_silent"
              | "open_frame"
              | "closed_case"
              | "tower"
              | "rackmount"
            )
          | null;
        engineBrand?: unknown;
        alternatorBrand?: unknown;
        status?:
          ("active" | "outOfStock" | "all" | "ACTIVE" | "INACTIVE") | null;
        isQuoteOnly?: unknown;
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
  ProductsController_create_v1: {
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
  ProductsController_getMetadata_v1: {
    parameters: {
      query?: {
        locale?: string;
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
  ProductsController_getById_v1: {
    parameters: {
      query?: {
        locale?: string;
      };
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
           *       "detail": "Requested resource not found",
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
  ProductsController_update_v1: {
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
           *       "detail": "Requested resource not found",
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
  ProductsController_delete_v1: {
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
           *       "detail": "Requested resource not found",
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
  WarehouseController_getAll_v1: {
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
  WarehouseController_create_v1: {
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
  WarehouseController_getProductStocks_v1: {
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
           *       "detail": "Requested resource not found",
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
  WarehouseController_getWarehouseStocks_v1: {
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
           *       "detail": "Requested resource not found",
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
  WarehouseController_updateStock_v1: {
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
           *       "detail": "Requested resource not found",
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
  WarehouseController_getById_v1: {
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
           *       "detail": "Requested resource not found",
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
  WarehouseController_update_v1: {
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
           *       "detail": "Requested resource not found",
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
  WarehouseController_delete_v1: {
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
            data?: components["schemas"]["Object"];
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
           *       "detail": "Requested resource not found",
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
  CartController_getCart_v1: {
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
    };
  };
  CartController_addItem_v1: {
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
           *       "detail": "Requested resource not found",
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
  CartController_updateItemQuantity_v1: {
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
           *       "detail": "Requested resource not found",
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
  CartController_removeItem_v1: {
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
           *       "detail": "Requested resource not found",
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
  CartController_mergeGuestCart_v1: {
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
    };
  };
  QuotesController_listQuotes_v1: {
    parameters: {
      query?: {
        page?: number;
        limit?: number;
        userId?: string;
        status?:
          | "DRAFT"
          | "SUBMITTED"
          | "NEGOTIATING"
          | "APPROVED"
          | "REJECTED"
          | "EXPIRED";
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
          "application/json": components["schemas"]["PaginatedApiResponseDto"] & {
            data?: components["schemas"]["QuoteResponseDto"][];
            meta?: components["schemas"]["PaginationMetaDto"];
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
    };
  };
  QuotesController_submitRfq_v1: {
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
  QuotesController_createAdminQuote_v1: {
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
    };
  };
  QuotesController_getQuoteById_v1: {
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
           *       "detail": "Requested resource not found",
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
  QuotesController_updateStatus_v1: {
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
           *       "detail": "Requested resource not found",
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
  QuotesController_updateItemPrice_v1: {
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
           *       "detail": "Requested resource not found",
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
  QuotesController_sendMessage_v1: {
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
           *       "detail": "Requested resource not found",
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
  QuotesController_approveToOrder_v1: {
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
           *       "detail": "Requested resource not found",
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
  QuotesController_exportExcel_v1: {
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
      /** @description Excel workbook stream (.xlsx) */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": string;
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
           *       "detail": "Requested resource not found",
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
  OrdersController_checkout_v1: {
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
           *       "detail": "Requested resource not found",
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
  OrdersController_createB2bOrder_v1: {
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
           *       "detail": "Requested resource not found",
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
  OrdersController_listOrders_v1: {
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
          "application/json": components["schemas"]["PaginatedApiResponseDto"] & {
            data?: components["schemas"]["OrderResponseDto"][];
            meta?: components["schemas"]["PaginationMetaDto"];
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
    };
  };
  OrdersController_getOrderById_v1: {
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
           *       "detail": "Requested resource not found",
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
  OrdersController_updateStatus_v1: {
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
           *       "detail": "Requested resource not found",
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
  OrdersController_cancelOrder_v1: {
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
           *       "detail": "Requested resource not found",
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
  OrdersController_expireOrders_v1: {
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
            data?: components["schemas"]["ExpireOrdersResponseDto"];
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
    };
  };
  PaymentsController_createCheckoutLink_v1: {
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
           *       "detail": "Requested resource not found",
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
  PaymentsController_handleWebhook_v1: {
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
            data?: components["schemas"]["PayOSWebhookResponseDto"];
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
    };
  };
  PaymentsController_verifyCashPayment_v1: {
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
           *       "detail": "Requested resource not found",
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
  PaymentsController_repayDebt_v1: {
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
           *       "detail": "Requested resource not found",
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
  PaymentsController_getOrderPaymentSummary_v1: {
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
           *       "detail": "Requested resource not found",
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
