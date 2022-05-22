import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerkaufComponent } from './verkauf.component';

describe('VerkaufComponent', () => {
  let component: VerkaufComponent;
  let fixture: ComponentFixture<VerkaufComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerkaufComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerkaufComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
