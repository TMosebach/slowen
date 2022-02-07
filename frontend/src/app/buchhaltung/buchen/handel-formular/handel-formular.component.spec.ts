import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandelFormularComponent } from './handel-formular.component';

describe('HandelFormularComponent', () => {
  let component: HandelFormularComponent;
  let fixture: ComponentFixture<HandelFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandelFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandelFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
