import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoNeuComponent } from './konto-neu.component';

describe('KontoNeuComponent', () => {
  let component: KontoNeuComponent;
  let fixture: ComponentFixture<KontoNeuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontoNeuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoNeuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
