import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { apiSuccess } from "@/common/utils/api-response.util";
import { CART_ROUTES } from "./cart.routes";
import { CartService } from "./cart.service";
import {
  AddCartItemDto,
  CartResponseDto,
  MergeCartDto,
  UpdateCartItemDto,
} from "./dto";

@ApiTags(CART_ROUTES.TAG)
@Controller(CART_ROUTES.ROOT)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get current authenticated user shopping cart" })
  @ApiResponse({
    status: 200,
    description: "User cart retrieved successfully",
    type: CartResponseDto,
  })
  async getCart(@CurrentUser("sub") userId: string) {
    const data = await this.cartService.getOrCreateCart(userId);
    return apiSuccess(data);
  }

  @Post(CART_ROUTES.ITEMS)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: "Add item to cart or increment quantity" })
  @ApiResponse({
    status: 201,
    description: "Item added to cart successfully",
    type: CartResponseDto,
  })
  async addItem(
    @CurrentUser("sub") userId: string,
    @Body() dto: AddCartItemDto,
  ) {
    const data = await this.cartService.addItem(userId, dto);
    return apiSuccess(data);
  }

  @Put(CART_ROUTES.ITEM_BY_ID)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: "Update quantity of a cart item" })
  @ApiParam({ name: "id", description: "Cart item UUID" })
  @ApiResponse({
    status: 200,
    description: "Cart item quantity updated",
    type: CartResponseDto,
  })
  async updateItemQuantity(
    @CurrentUser("sub") userId: string,
    @Param("id") itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateItemQuantity(userId, itemId, dto);
    return apiSuccess(data);
  }

  @Delete(CART_ROUTES.ITEM_BY_ID)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove item from cart" })
  @ApiParam({ name: "id", description: "Cart item UUID" })
  @ApiResponse({
    status: 200,
    description: "Cart item removed successfully",
    type: CartResponseDto,
  })
  async removeItem(
    @CurrentUser("sub") userId: string,
    @Param("id") itemId: string,
  ) {
    const data = await this.cartService.removeItem(userId, itemId);
    return apiSuccess(data);
  }

  @Post(CART_ROUTES.MERGE)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary:
      "Merge guest cart items into authenticated user cart with inventory stock clamping",
  })
  @ApiResponse({
    status: 200,
    description: "Guest cart merged successfully with clamped quantities",
    type: CartResponseDto,
  })
  async mergeGuestCart(
    @CurrentUser("sub") userId: string,
    @Body() dto: MergeCartDto,
  ) {
    const data = await this.cartService.mergeGuestCart(userId, dto);
    return apiSuccess(data);
  }
}
