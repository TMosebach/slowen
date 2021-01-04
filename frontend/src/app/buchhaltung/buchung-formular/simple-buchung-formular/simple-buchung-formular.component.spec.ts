import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SimpleBuchungFormularComponent } from './simple-buchung-formular.component';

describe('SimpleBuchungFormularComponent', () => {
  let component: SimpleBuchungFormularComponent;
  let fixture: ComponentFixture<SimpleBuchungFormularComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleBuchungFormularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleBuchungFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
