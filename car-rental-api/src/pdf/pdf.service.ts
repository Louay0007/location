import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateContract(bookingId: number): Promise<Buffer> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        vehicle: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Reservation non trouvee');
    }

    return this.createContractPdf(booking);
  }

  async generateInvoice(bookingId: number): Promise<Buffer> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        vehicle: true,
        payments: {
          where: { status: 'PAID' },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Reservation non trouvee');
    }

    return this.createInvoicePdf(booking);
  }

  private async createContractPdf(booking: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('CONTRAT DE LOCATION', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Reference: ${booking.bookingReference}`, { align: 'right' });
      doc.moveDown();

      doc.fontSize(14).text('INFORMATIONS CLIENT:', { underline: true });
      doc.fontSize(11);
      doc.text(`Nom: ${booking.client.firstName} ${booking.client.lastName}`);
      doc.text(`Email: ${booking.client.email}`);
      doc.text(`Telephone: ${booking.client.phone || 'Non renseigne'}`);
      doc.text(`CIN: ${booking.client.cin || 'Non renseigne'}`);
      doc.text(`Permis de conduire: ${booking.client.drivingLicense || 'Non renseigne'}`);
      doc.moveDown();

      doc.fontSize(14).text('INFORMATIONS VEHICULE:', { underline: true });
      doc.fontSize(11);
      doc.text(`${booking.vehicle.brand} ${booking.vehicle.model}`);
      doc.text(`Immatriculation: ${booking.vehicle.registration}`);
      doc.text(`Categorie: ${booking.vehicle.category}`);
      doc.moveDown();

      doc.fontSize(14).text('DETAILS DE LA LOCATION:', { underline: true });
      doc.fontSize(11);
      doc.text(`Date de debut: ${new Date(booking.startDate).toLocaleDateString('fr-FR')} a ${booking.pickupTime}`);
      doc.text(`Date de fin: ${new Date(booking.endDate).toLocaleDateString('fr-FR')} a ${booking.returnTime}`);
      doc.text(`Duree: ${booking.durationDays} jour(s)`);
      doc.text(`Prix journalier: ${Number(booking.dailyRate).toFixed(3)} TND`);
      doc.moveDown();

      doc.fontSize(14).text('CONDITIONS FINANCIERES:', { underline: true });
      doc.fontSize(11);
      doc.text(`Sous-total: ${Number(booking.subtotal).toFixed(3)} TND`);
      doc.text(`Remise: ${Number(booking.discountAmount).toFixed(3)} TND`);
      doc.text(`Montant total: ${Number(booking.totalAmount).toFixed(3)} TND`);
      doc.text(`Caution: ${Number(booking.depositAmount).toFixed(3)} TND`);
      doc.moveDown();

      doc.fontSize(14).text('CONDITIONS GENERALES:', { underline: true });
      doc.fontSize(10);
      doc.text('1. Le locataire doit rendre le vehicule a la date et heure prevues.');
      doc.text('2. La caution sera restituee apres verification du vehicule.');
      doc.text('3. Tout dommage engage la responsabilite du locataire.');
      doc.text('4. Annulation selon les conditions definies par l\'agence.');
      doc.moveDown(2);

      doc.fontSize(12).text('Signatures:', { align: 'center' });
      doc.moveDown();
      doc.text('Client: ______________________    Agence: ______________________', { align: 'center' });

      doc.end();
    });
  }

  private async createInvoicePdf(booking: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('FACTURE', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Facture N: ${booking.bookingReference}`, { align: 'right' });
      doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.moveDown();

      doc.fontSize(14).text('Informations Client:', { underline: true });
      doc.fontSize(11);
      doc.text(`${booking.client.firstName} ${booking.client.lastName}`);
      doc.text(booking.client.email);
      doc.moveDown();

      doc.fontSize(14).text('Location:', { underline: true });
      doc.fontSize(11);
      doc.text(`Vehicule: ${booking.vehicle.brand} ${booking.vehicle.model}`);
      doc.text(`Immatriculation: ${booking.vehicle.registration}`);
      doc.text(`Periode: ${new Date(booking.startDate).toLocaleDateString('fr-FR')} - ${new Date(booking.endDate).toLocaleDateString('fr-FR')}`);
      doc.text(`Duree: ${booking.durationDays} jour(s)`);
      doc.moveDown();

      doc.fontSize(14).text('Details:', { underline: true });
      
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Description', 50, tableTop);
      doc.text('Prix Unitaire', 250, tableTop);
      doc.text('Quantite', 350, tableTop);
      doc.text('Total', 450, tableTop, { width: 80, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();

      let y = tableTop + 25;
      doc.text(`Location vehicule (${booking.durationDays} jours)`, 50, y);
      doc.text(`${Number(booking.dailyRate).toFixed(3)} TND`, 250, y);
      doc.text(`${booking.durationDays}`, 350, y);
      doc.text(`${Number(booking.subtotal).toFixed(3)} TND`, 450, y, { width: 80, align: 'right' });

      y += 20;
      if (Number(booking.discountAmount) > 0) {
        doc.text('Remise', 50, y);
        doc.text(`-${Number(booking.discountAmount).toFixed(3)} TND`, 450, y, { width: 80, align: 'right' });
        y += 20;
      }

      doc.moveTo(50, y).lineTo(530, y).stroke();
      y += 10;

      doc.fontSize(12);
      doc.text('Total:', 350, y);
      doc.text(`${Number(booking.totalAmount).toFixed(3)} TND`, 450, y, { width: 80, align: 'right' });

      const paidAmount = booking.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      if (paidAmount > 0) {
        y += 25;
        doc.text('Deja paye:', 350, y);
        doc.text(`${paidAmount.toFixed(3)} TND`, 450, y, { width: 80, align: 'right' });
        
        y += 20;
        doc.fontSize(14);
        doc.text('Reste a payer:', 350, y);
        doc.text(`${(Number(booking.totalAmount) - paidAmount).toFixed(3)} TND`, 450, y, { width: 80, align: 'right' });
      }

      doc.end();
    });
  }
}