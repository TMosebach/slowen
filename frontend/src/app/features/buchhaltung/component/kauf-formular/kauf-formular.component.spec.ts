import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KaufFormularComponent } from './kauf-formular.component';

describe('KaufFormularComponent', () => {
  let component: KaufFormularComponent;
  let fixture: ComponentFixture<KaufFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KaufFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KaufFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});