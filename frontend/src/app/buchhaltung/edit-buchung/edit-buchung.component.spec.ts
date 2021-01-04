import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditBuchungComponent } from './edit-buchung.component';

describe('EditBuchungComponent', () => {
  let component: EditBuchungComponent;
  let fixture: ComponentFixture<EditBuchungComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBuchungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBuchungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
