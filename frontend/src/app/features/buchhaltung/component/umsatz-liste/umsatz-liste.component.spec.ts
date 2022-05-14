import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmsatzListeComponent } from './umsatz-liste.component';

describe('UmsatzListeComponent', () => {
  let component: UmsatzListeComponent;
  let fixture: ComponentFixture<UmsatzListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UmsatzListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UmsatzListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
