import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoUmsatzComponent } from './konto-umsatz.component';

describe('KontoUmsatzComponent', () => {
  let component: KontoUmsatzComponent;
  let fixture: ComponentFixture<KontoUmsatzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontoUmsatzComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoUmsatzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
