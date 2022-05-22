import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerkaufFormularComponent } from './verkauf-formular.component';

describe('VerkaufFormularComponent', () => {
  let component: VerkaufFormularComponent;
  let fixture: ComponentFixture<VerkaufFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerkaufFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerkaufFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
