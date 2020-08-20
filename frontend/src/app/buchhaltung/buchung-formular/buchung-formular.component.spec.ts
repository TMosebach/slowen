import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuchungFormularComponent } from './buchung-formular.component';

describe('BuchungFormularComponent', () => {
  let component: BuchungFormularComponent;
  let fixture: ComponentFixture<BuchungFormularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuchungFormularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuchungFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
