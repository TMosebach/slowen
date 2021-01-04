import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BuchungFormularComponent } from './buchung-formular.component';

describe('BuchungFormularComponent', () => {
  let component: BuchungFormularComponent;
  let fixture: ComponentFixture<BuchungFormularComponent>;

  beforeEach(waitForAsync(() => {
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
