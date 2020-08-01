import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KontolisteComponent } from './kontoliste.component';

describe('KontolisteComponent', () => {
  let component: KontolisteComponent;
  let fixture: ComponentFixture<KontolisteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KontolisteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KontolisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
