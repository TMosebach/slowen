import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErtragFormularComponent } from './ertrag-formular.component';

describe('ErtragFormularComponent', () => {
  let component: ErtragFormularComponent;
  let fixture: ComponentFixture<ErtragFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErtragFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErtragFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
