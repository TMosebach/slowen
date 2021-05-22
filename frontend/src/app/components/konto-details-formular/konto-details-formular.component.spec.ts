import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoDetailsFormularComponent } from './konto-details-formular.component';

describe('KontoDetailsFormularComponent', () => {
  let component: KontoDetailsFormularComponent;
  let fixture: ComponentFixture<KontoDetailsFormularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontoDetailsFormularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoDetailsFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
