import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KontodetailsComponent } from './kontodetails.component';

describe('KontodetailsComponent', () => {
  let component: KontodetailsComponent;
  let fixture: ComponentFixture<KontodetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KontodetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontodetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
