import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KaufComponent } from './kauf.component';

describe('KaufComponent', () => {
  let component: KaufComponent;
  let fixture: ComponentFixture<KaufComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KaufComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KaufComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
