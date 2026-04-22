import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesService } from '../../../core/services/vehicles.service';

@Component({
  selector: 'app-vehicle-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-calendar.component.html',
  styleUrls: ['./vehicle-calendar.component.scss']
})
export class VehicleCalendarComponent {
  @Input() vehicleId!: number;
  @Output() datesSelected = new EventEmitter<{ startDate: string; endDate: string }>();

  private readonly vehiclesService = inject(VehiclesService);

  private readonly _currentMonth = signal<Date>(new Date());
  readonly currentMonth = this._currentMonth.asReadonly();

  private readonly _bookedPeriods = signal<Array<{ startDate: string; endDate: string }>>([]);
  readonly bookedPeriods = this._bookedPeriods.asReadonly();

  private readonly _maintenancePeriods = signal<Array<{ startDate: string; endDate: string }>>([]);
  readonly maintenancePeriods = this._maintenancePeriods.asReadonly();

  private readonly _selectedStartDate = signal<Date | null>(null);
  readonly selectedStartDate = this._selectedStartDate.asReadonly();

  private readonly _selectedEndDate = signal<Date | null>(null);
  readonly selectedEndDate = this._selectedEndDate.asReadonly();

  private readonly _isSelectingRange = signal<boolean>(false);
  readonly isSelectingRange = this._isSelectingRange.asReadonly();

  ngOnInit(): void {
    this.loadAvailability();
  }

  loadAvailability(): void {
    const year = this._currentMonth().getFullYear();
    const month = this._currentMonth().getMonth() + 1;
    
    this.vehiclesService.getAvailability(this.vehicleId, year, month).subscribe({
      next: (data) => {
        this._bookedPeriods.set(data.bookedPeriods || []);
        this._maintenancePeriods.set(data.maintenancePeriods || []);
      }
    });
  }

  previousMonth(): void {
    const newDate = new Date(this._currentMonth());
    newDate.setMonth(newDate.getMonth() - 1);
    this._currentMonth.set(newDate);
    this.loadAvailability();
  }

  nextMonth(): void {
    const newDate = new Date(this._currentMonth());
    newDate.setMonth(newDate.getMonth() + 1);
    this._currentMonth.set(newDate);
    this.loadAvailability();
  }

  getMonthName(): string {
    return this._currentMonth().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  getDaysInMonth(): Date[] {
    const year = this._currentMonth().getFullYear();
    const month = this._currentMonth().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add empty days for alignment
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(new Date(year, month, 1 - startDayOfWeek + i));
    }
    
    // Add actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }

  isBooked(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this._bookedPeriods().some(period => {
      return dateStr >= period.startDate && dateStr <= period.endDate;
    });
  }

  isMaintenance(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this._maintenancePeriods().some(period => {
      return dateStr >= period.startDate && dateStr <= period.endDate;
    });
  }

  isSelected(date: Date): boolean {
    if (!this._selectedStartDate() && !this._selectedEndDate()) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    const startStr = this._selectedStartDate()?.toISOString().split('T')[0];
    const endStr = this._selectedEndDate()?.toISOString().split('T')[0];
    
    if (startStr === dateStr || endStr === dateStr) return true;
    
    if (startStr && endStr && dateStr > startStr && dateStr < endStr) return true;
    
    return false;
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this._currentMonth().getMonth();
  }

  onDateClick(date: Date): void {
    if (this.isPast(date) || this.isBooked(date) || this.isMaintenance(date)) return;

    if (!this._selectedStartDate()) {
      this._selectedStartDate.set(date);
      this._isSelectingRange.set(true);
    } else if (!this._selectedEndDate()) {
      if (date < this._selectedStartDate()!) {
        this._selectedStartDate.set(date);
      } else {
        this._selectedEndDate.set(date);
        this._isSelectingRange.set(false);
        this.emitDates();
      }
    } else {
      this._selectedStartDate.set(date);
      this._selectedEndDate.set(null);
      this._isSelectingRange.set(true);
    }
  }

  private emitDates(): void {
    if (this._selectedStartDate() && this._selectedEndDate()) {
      this.datesSelected.emit({
        startDate: this._selectedStartDate()!.toISOString().split('T')[0],
        endDate: this._selectedEndDate()!.toISOString().split('T')[0]
      });
    }
  }

  clearSelection(): void {
    this._selectedStartDate.set(null);
    this._selectedEndDate.set(null);
    this._isSelectingRange.set(false);
  }

  readonly getStatusClass = (date: Date) => {
    if (this.isPast(date)) return 'past';
    if (this.isBooked(date)) return 'booked';
    if (this.isMaintenance(date)) return 'maintenance';
    if (this.isSelected(date)) return 'selected';
    return 'available';
  };
}
