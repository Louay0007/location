import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vehicle, DateRange } from '../../../core/models';
import { BookingsService } from '../../../core/services/bookings.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent {
  @Input() vehicle!: Vehicle;
  @Input() dates!: DateRange;
  @Output() bookingSuccess = new EventEmitter<number>();

  private readonly fb = inject(FormBuilder);
  private readonly bookingsService = inject(BookingsService);

  readonly bookingForm: FormGroup = this.fb.group({
    pickupLocation: ['', Validators.required],
    returnLocation: ['', Validators.required],
    pickupTime: ['10:00', Validators.required],
    returnTime: ['10:00', Validators.required],
    notes: ['']
  });

  private readonly _isSubmitting = signal<boolean>(false);
  readonly isSubmitting = this._isSubmitting.asReadonly();

  private readonly _priceCalculation = signal<{
    dailyRate: number;
    subtotal: number;
    discountAmount: number;
    depositAmount: number;
    totalAmount: number;
    durationDays: number;
  } | null>(null);
  readonly priceCalculation = this._priceCalculation.asReadonly();

  ngOnInit(): void {
    this.calculatePrice();
  }

  calculatePrice(): void {
    this.bookingsService.calculatePrice(this.vehicle.id, this.dates).subscribe({
      next: (result) => {
        this._priceCalculation.set(result);
      },
      error: (error) => {
        console.error('Price calculation error:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this._isSubmitting.set(true);

    const bookingData = {
      vehicleId: this.vehicle.id,
      startDate: this.dates.startDate,
      endDate: this.dates.endDate,
      pickupTime: this.bookingForm.value.pickupTime,
      returnTime: this.bookingForm.value.returnTime,
      pickupLocation: this.bookingForm.value.pickupLocation,
      returnLocation: this.bookingForm.value.returnLocation,
      notes: this.bookingForm.value.notes
    };

    this.bookingsService.createBooking(bookingData).subscribe({
      next: (booking) => {
        this._isSubmitting.set(false);
        this.bookingSuccess.emit(booking.id);
      },
      error: (error) => {
        this._isSubmitting.set(false);
        console.error('Booking error:', error);
      }
    });
  }

  formatPrice(price: number | string): string {
    return `${Number(price).toFixed(2)} TND`;
  }

  getDuration(): number {
    const start = new Date(this.dates.startDate);
    const end = new Date(this.dates.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
