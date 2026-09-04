import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { apiSuccess } from "@/common/utils/api-response.util";
import { QUOTE_ROUTES } from "./quote.routes";
import { QuotesService } from "./quotes.service";
import { QuoteExcelService } from "./services/quote-excel.service";
import {
  ApproveToOrderResponseDto,
  PaginatedQuoteResponseDto,
  QuoteMessageResponseDto,
  QuoteResponseDto,
  CreateAdminQuoteDto,
  CreateQuoteDto,
  QuoteQueryDto,
  SendQuoteMessageDto,
  UpdateQuoteItemPriceDto,
  UpdateQuoteStatusDto,
} from "./dto";

@ApiTags(QUOTE_ROUTES.TAG)
@Controller(QUOTE_ROUTES.ROOT)
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly quoteExcelService: QuoteExcelService,
  ) {}

  /**
   * Submits a customer Request For Quotation (RFQ).
   *
   * @param dto - Customer contact information and requested items.
   * @returns Created quote response with SUBMITTED status.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Submit customer Request For Quotation (RFQ)" })
  @ApiResponse({
    status: 201,
    description: "Customer RFQ submitted successfully",
    type: QuoteResponseDto,
  })
  async submitRfq(@Body() dto: CreateQuoteDto) {
    const quote = await this.quotesService.createRfq(dto);
    return apiSuccess(quote);
  }

  /**
   * Creates an official B2B quotation with custom lines, discounts, and terms (Admin only).
   *
   * @param dto - Quote specification with line items and commercial terms.
   * @param adminUserId - Authenticated admin user ID.
   * @returns Created official quote response.
   */
  @Post(QUOTE_ROUTES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create official B2B quotation (Admin only)" })
  @ApiResponse({
    status: 201,
    description: "B2B quote created successfully",
    type: QuoteResponseDto,
  })
  async createAdminQuote(
    @Body() dto: CreateAdminQuoteDto,
    @CurrentUser("sub") adminUserId: string,
  ) {
    const quote = await this.quotesService.createAdminQuote(dto, adminUserId);
    return apiSuccess(quote);
  }

  /**
   * Retrieves paginated and filtered list of quotations.
   *
   * @param query - Filtering parameters and pagination options.
   * @returns Paginated list of quotes.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List quotes with filtering and pagination" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Paginated list of quotes retrieved successfully",
    type: PaginatedQuoteResponseDto,
  })
  async listQuotes(@Query() query: QuoteQueryDto) {
    const result = await this.quotesService.findAll(query);
    return apiSuccess(result);
  }

  /**
   * Retrieves detailed quotation including items, messages, and linked account context.
   *
   * @param id - Quote UUID identifier.
   * @returns Full quote details.
   */
  @Get(QUOTE_ROUTES.BY_ID)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get detailed quote by ID" })
  @ApiParam({ name: "id", description: "Quote UUID" })
  @ApiResponse({
    status: 200,
    description: "Quote details retrieved successfully",
    type: QuoteResponseDto,
  })
  async getQuoteById(@Param("id") id: string) {
    const quote = await this.quotesService.findById(id);
    return apiSuccess(quote);
  }

  /**
   * Updates quote status along the allowed lifecycle state machine transitions (Admin only).
   *
   * @param id - Quote UUID identifier.
   * @param dto - Desired next quote status.
   * @returns Updated quote details.
   */
  @Patch(QUOTE_ROUTES.STATUS)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update quote status along the state machine (Admin only)",
  })
  @ApiParam({ name: "id", description: "Quote UUID" })
  @ApiResponse({
    status: 200,
    description: "Quote status updated successfully",
    type: QuoteResponseDto,
  })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    const quote = await this.quotesService.updateStatus(id, dto.status);
    return apiSuccess(quote);
  }

  /**
   * Adjusts the negotiated agreed price for a specific quote line item (Admin only).
   *
   * @param quoteId - Parent quote UUID.
   * @param itemId - Quote line item UUID.
   * @param dto - New agreed unit price.
   * @returns Updated quote with recalculated subtotals and VAT.
   */
  @Put(QUOTE_ROUTES.ITEM_PRICE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update negotiated price for a quote line item (Admin only)",
  })
  @ApiParam({ name: "id", description: "Quote UUID" })
  @ApiParam({ name: "itemId", description: "Quote item UUID" })
  @ApiResponse({
    status: 200,
    description: "Quote item price adjusted successfully",
    type: QuoteResponseDto,
  })
  async updateItemPrice(
    @Param("id") quoteId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateQuoteItemPriceDto,
  ) {
    const quote = await this.quotesService.updateItemPrice(
      quoteId,
      itemId,
      dto.agreedPrice,
    );
    return apiSuccess(quote);
  }

  /**
   * Posts a negotiation timeline message, automatically advancing SUBMITTED quotes to NEGOTIATING.
   *
   * @param quoteId - Parent quote UUID.
   * @param senderId - Authenticated sender UUID.
   * @param dto - Negotiation message body.
   * @returns Recorded timeline message.
   */
  @Post(QUOTE_ROUTES.MESSAGES)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Post a message to quote negotiation timeline" })
  @ApiParam({ name: "id", description: "Quote UUID" })
  @ApiResponse({
    status: 201,
    description: "Negotiation message recorded successfully",
    type: QuoteMessageResponseDto,
  })
  async sendMessage(
    @Param("id") quoteId: string,
    @CurrentUser("sub") senderId: string,
    @Body() dto: SendQuoteMessageDto,
  ) {
    const message = await this.quotesService.sendMessage(
      quoteId,
      senderId,
      dto.message,
    );
    return apiSuccess(message);
  }

  /**
   * Approves a quotation and atomically converts it into a pending order (Admin only).
   *
   * @param quoteId - Parent quote UUID to approve.
   * @param adminUserId - Authenticated admin user ID.
   * @returns Created order confirmation and updated quote status.
   */
  @Post(QUOTE_ROUTES.APPROVE_TO_ORDER)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Approve quote and convert to order (Admin only)",
  })
  @ApiParam({ name: "id", description: "Quote UUID" })
  @ApiResponse({
    status: 200,
    description: "Quote approved and converted to order successfully",
    type: ApproveToOrderResponseDto,
  })
  async approveToOrder(
    @Param("id") quoteId: string,
    @CurrentUser("sub") adminUserId: string,
  ) {
    const result = await this.quotesService.approveAndConvertToOrder(
      quoteId,
      adminUserId,
    );
    return apiSuccess(result);
  }

  /**
   * Streams a formatted B2B Excel (.xlsx) quotation spreadsheet matching corporate templates.
   *
   * @param id - Quote UUID identifier.
   * @param res - Express response object for streaming headers.
   * @returns Binary spreadsheet streamable file.
   */
  @Get(QUOTE_ROUTES.EXPORT_EXCEL)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Download B2B quote Excel (.xlsx) spreadsheet" })
  @ApiParam({ name: "id", description: "Quote UUID" })
  @ApiResponse({
    status: 200,
    description: "Excel workbook stream",
  })
  async exportExcel(
    @Param("id") id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const quote = await this.quotesService.findById(id);
    const buffer =
      await this.quoteExcelService.generateQuoteExcelWorkbook(quote);
    const filename = `${quote.quoteNumber ?? "Bao_Gia"}.xlsx`;

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }
}
