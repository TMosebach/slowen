import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoDetailsComponent } from './konto-details.component';

describe('KontoDetailsComponent', () => {
  let component: KontoDetailsComponent;
  let fixture: ComponentFixture<KontoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
