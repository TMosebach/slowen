import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoListeComponent } from './konto-liste.component';

describe('KontoListeComponent', () => {
  let component: KontoListeComponent;
  let fixture: ComponentFixture<KontoListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontoListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
