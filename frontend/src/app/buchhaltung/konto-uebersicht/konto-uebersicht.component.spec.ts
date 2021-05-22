import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoUebersichtComponent } from './konto-uebersicht.component';

describe('KontoUebersichtComponent', () => {
  let component: KontoUebersichtComponent;
  let fixture: ComponentFixture<KontoUebersichtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontoUebersichtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoUebersichtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
