import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErtragComponent } from './ertrag.component';

describe('ErtragComponent', () => {
  let component: ErtragComponent;
  let fixture: ComponentFixture<ErtragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErtragComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErtragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
