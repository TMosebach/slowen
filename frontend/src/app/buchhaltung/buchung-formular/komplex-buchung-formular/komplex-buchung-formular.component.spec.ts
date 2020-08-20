import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KomplexBuchungFormularComponent } from './komplex-buchung-formular.component';

describe('KomplexBuchungFormularComponent', () => {
  let component: KomplexBuchungFormularComponent;
  let fixture: ComponentFixture<KomplexBuchungFormularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KomplexBuchungFormularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KomplexBuchungFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
