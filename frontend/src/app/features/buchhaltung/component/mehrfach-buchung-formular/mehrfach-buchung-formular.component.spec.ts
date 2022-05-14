import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MehrfachBuchungFormularComponent } from './mehrfach-buchung-formular.component';

describe('MehrfachBuchungFormularComponent', () => {
  let component: MehrfachBuchungFormularComponent;
  let fixture: ComponentFixture<MehrfachBuchungFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MehrfachBuchungFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MehrfachBuchungFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
