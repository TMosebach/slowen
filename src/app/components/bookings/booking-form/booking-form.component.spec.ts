import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookingFormComponent } from './booking-form.component';
import { BookingService } from '../../../services/booking.service';
import { AccountService } from '../../../services/account.service';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let mockBookingService: any;
  let mockAccountService: any;

  beforeEach(async () => {
    mockBookingService = {
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    };

    mockAccountService = {
      getAll: vi.fn().mockResolvedValue([]),
    };

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        provideRouter([]),
        { provide: BookingService, useValue: mockBookingService },
        { provide: AccountService, useValue: mockAccountService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.booking.vorgang).toBe('Buchung');
    expect(component.booking.positions.length).toBe(1);
  });

  it('should add position', () => {
    component.addPosition();
    expect(component.booking.positions.length).toBe(2);
  });

  it('should remove position', () => {
    component.addPosition();
    component.removePosition(0);
    expect(component.booking.positions.length).toBe(1);
  });

  it('should not remove last position', () => {
    component.removePosition(0);
    expect(component.booking.positions.length).toBe(1);
  });
});
