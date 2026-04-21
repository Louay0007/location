import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymeeService } from './paymee/paymee.service';
import { StripeService } from './stripe/stripe.service';
import { WebhooksService } from './webhooks/webhooks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymeeService, StripeService, WebhooksService],
  exports: [PaymentsService],
})
export class PaymentsModule {}