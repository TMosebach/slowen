import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestandskontenComponent } from './bestandskonten.component';

describe('BestandskontenComponent', () => {
  let component: BestandskontenComponent;
  let fixture: ComponentFixture<BestandskontenComponent>;

  beforeEach(async(() => {
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
