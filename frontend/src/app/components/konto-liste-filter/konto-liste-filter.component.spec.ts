import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoListeFilterComponent } from './konto-liste-filter.component';

describe('KontoListeFilterComponent', () => {
  let component: KontoListeFilterComponent;
  let fixture: ComponentFixture<KontoListeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontoListeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoListeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
