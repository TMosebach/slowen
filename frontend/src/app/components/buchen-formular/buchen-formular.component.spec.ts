import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuchenFormularComponent } from './buchen-formular.component';

describe('BuchenFormularComponent', () => {
  let component: BuchenFormularComponent;
  let fixture: ComponentFixture<BuchenFormularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuchenFormularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuchenFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
