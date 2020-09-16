import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UmsatzTabelleComponent } from './umsatz-tabelle.component';

describe('UmsatzTabelleComponent', () => {
  let component: UmsatzTabelleComponent;
  let fixture: ComponentFixture<UmsatzTabelleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UmsatzTabelleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UmsatzTabelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
