import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuchungListeComponent } from './buchung-liste.component';

describe('BuchungListeComponent', () => {
  let component: BuchungListeComponent;
  let fixture: ComponentFixture<BuchungListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuchungListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuchungListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
