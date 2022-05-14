import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetragLabelComponent } from './betrag-label.component';

describe('BetragLabelComponent', () => {
  let component: BetragLabelComponent;
  let fixture: ComponentFixture<BetragLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetragLabelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetragLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
