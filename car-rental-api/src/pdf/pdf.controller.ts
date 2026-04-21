import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('PDF')
@ApiBearerAuth()
@Controller('pdf')
export class PdfController {
  constructor(
    private pdfService: PdfService,
    private prisma: PrismaService,
  ) {}

  @Get('contract/:bookingId')
  @UseGuards(JwtAuthGuard)
  async generateContract(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      select: { clientId: true, bookingReference: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reservation non trouvee' });
    }

    if (booking.clientId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorise' });
    }

    const pdf = await this.pdfService.generateContract(parseInt(bookingId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrat-${booking.bookingReference}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Get('invoice/:bookingId')
  @UseGuards(JwtAuthGuard)
  async generateInvoice(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      select: { clientId: true, bookingReference: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reservation non trouvee' });
    }

    if (booking.clientId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorise' });
    }

    const pdf = await this.pdfService.generateInvoice(parseInt(bookingId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${booking.bookingReference}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Get('admin/contract/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async generateContractAdmin(
    @Param('bookingId') bookingId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.pdfService.generateContract(parseInt(bookingId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrat-${bookingId}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Get('admin/invoice/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async generateInvoiceAdmin(
    @Param('bookingId') bookingId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.pdfService.generateInvoice(parseInt(bookingId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${bookingId}.pdf"`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }
}