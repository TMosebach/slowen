import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BuchenComponent } from './buchen.component';

describe('BuchenComponent', () => {
  let component: BuchenComponent;
  let fixture: ComponentFixture<BuchenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BuchenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuchenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
