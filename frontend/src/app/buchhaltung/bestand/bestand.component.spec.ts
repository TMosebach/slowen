import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BestandComponent } from './bestand.component';

describe('BestandComponent', () => {
  let component: BestandComponent;
  let fixture: ComponentFixture<BestandComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BestandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
