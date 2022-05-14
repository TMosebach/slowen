import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoFormularComponent } from './konto-formular.component';

describe('KontoFormularComponent', () => {
  let component: KontoFormularComponent;
  let fixture: ComponentFixture<KontoFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontoFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
