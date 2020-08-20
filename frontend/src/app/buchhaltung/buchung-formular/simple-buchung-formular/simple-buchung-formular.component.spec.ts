import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleBuchungFormularComponent } from './simple-buchung-formular.component';

describe('SimpleBuchungFormularComponent', () => {
  let component: SimpleBuchungFormularComponent;
  let fixture: ComponentFixture<SimpleBuchungFormularComponent>;

  beforeEach(async(() => {
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
