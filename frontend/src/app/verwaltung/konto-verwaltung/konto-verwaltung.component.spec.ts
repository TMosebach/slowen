import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoVerwaltungComponent } from './konto-verwaltung.component';

describe('KontoVerwaltungComponent', () => {
  let component: KontoVerwaltungComponent;
  let fixture: ComponentFixture<KontoVerwaltungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontoVerwaltungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoVerwaltungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
