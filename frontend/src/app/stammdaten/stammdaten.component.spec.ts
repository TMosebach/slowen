import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StammdatenComponent } from './stammdaten.component';

describe('StammdatenComponent', () => {
  let component: StammdatenComponent;
  let fixture: ComponentFixture<StammdatenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StammdatenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StammdatenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
