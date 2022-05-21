import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestandListeComponent } from './bestand-liste.component';

describe('BestandListeComponent', () => {
  let component: BestandListeComponent;
  let fixture: ComponentFixture<BestandListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BestandListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BestandListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
