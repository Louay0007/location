import {
  Controller, Post, Get, Body, Param, UseGuards,
  HttpCode, HttpStatus, Req, Headers, RawBodyRequest,
  BadRequestException, Logger,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { PaymeeService } from './paymee/paymee.service';
import { StripeService } from './stripe/stripe.service';
import { WebhooksService } from './webhooks/webhooks.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private paymentsService: PaymentsService,
    private paymeeService: PaymeeService,
    private stripeService: StripeService,
    private webhooksService: WebhooksService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('webhooks/paymee')
  @HttpCode(200)
  async handlePaymeeWebhook(
    @Body() body: any,
    @Headers('x-paymee-signature') signature: string,
  ) {
    return this.webhooksService.handlePaymeeWebhook(body, signature || '');
  }

  @Public()
  @Post('webhooks/stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.webhooksService.handleStripeWebhook(
      req.rawBody as Buffer,
      signature || '',
    );
  }

  @Post('paymee/initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePaymee(
    @CurrentUser() user: any,
    @Body() body: { bookingId: number },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: {
        client: { select: { firstName: true, lastName: true, email: true, phone: true } },
        vehicle: { select: { brand: true, model: true } },
      },
    });

    if (!booking) throw new BadRequestException('Reservation non trouvee');
    if (booking.clientId !== user.id) throw new BadRequestException('Non autorise');

    return this.paymeeService.initiatePayment({
      amount: Number(booking.totalAmount),
      bookingRef: booking.bookingReference,
      bookingId: booking.id,
      client: booking.client,
    });
  }

  @Post('stripe/create-intent')
  @UseGuards(JwtAuthGuard)
  async createStripeIntent(
    @CurrentUser() user: any,
    @Body() body: { bookingId: number },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { client: { select: { email: true } } },
    });

    if (!booking) throw new BadRequestException('Reservation non trouvee');
    if (booking.clientId !== user.id) throw new BadRequestException('Non autorise');

    return this.stripeService.createPaymentIntent({
      amountTND: Number(booking.totalAmount),
      bookingRef: booking.bookingReference,
      bookingId: booking.id,
      clientEmail: booking.client.email,
    });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(parseInt(id));
  }

  @Post('admin/:id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  refundPayment(@Param('id') id: string, @Body() body: { amount?: number }) {
    return this.paymentsService.refundPayment(parseInt(id), body.amount);
  }
}