import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BestandskontenComponent } from './bestandskonten.component';

describe('BestandskontenComponent', () => {
  let component: BestandskontenComponent;
  let fixture: ComponentFixture<BestandskontenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BestandskontenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestandskontenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
