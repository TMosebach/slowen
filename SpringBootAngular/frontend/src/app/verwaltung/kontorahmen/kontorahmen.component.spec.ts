import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontorahmenComponent } from './kontorahmen.component';

describe('KontorahmenComponent', () => {
  let component: KontorahmenComponent;
  let fixture: ComponentFixture<KontorahmenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontorahmenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontorahmenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
