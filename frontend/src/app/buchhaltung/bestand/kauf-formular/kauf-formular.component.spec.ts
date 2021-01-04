import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KaufFormularComponent } from './kauf-formular.component';

describe('KaufFormularComponent', () => {
  let component: KaufFormularComponent;
  let fixture: ComponentFixture<KaufFormularComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KaufFormularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KaufFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
