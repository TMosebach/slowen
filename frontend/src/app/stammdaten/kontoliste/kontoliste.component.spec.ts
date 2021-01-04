import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KontolisteComponent } from './kontoliste.component';

describe('KontolisteComponent', () => {
  let component: KontolisteComponent;
  let fixture: ComponentFixture<KontolisteComponent>;

  beforeEach(waitForAsync(() => {
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
