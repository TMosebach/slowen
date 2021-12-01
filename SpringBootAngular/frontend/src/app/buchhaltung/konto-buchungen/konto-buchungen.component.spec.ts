import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoBuchungenComponent } from './konto-buchungen.component';

describe('KontoBuchungenComponent', () => {
  let component: KontoBuchungenComponent;
  let fixture: ComponentFixture<KontoBuchungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontoBuchungenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoBuchungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
