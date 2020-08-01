import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StammdatenComponent } from './stammdaten.component';

describe('StammdatenComponent', () => {
  let component: StammdatenComponent;
  let fixture: ComponentFixture<StammdatenComponent>;

  beforeEach(async(() => {
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
