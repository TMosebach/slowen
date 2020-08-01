import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuchhaltungComponent } from './buchhaltung.component';

describe('BuchhaltungComponent', () => {
  let component: BuchhaltungComponent;
  let fixture: ComponentFixture<BuchhaltungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuchhaltungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuchhaltungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
