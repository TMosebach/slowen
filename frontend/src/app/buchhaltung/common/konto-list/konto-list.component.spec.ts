import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoListComponent } from './konto-list.component';

describe('KontoListComponent', () => {
  let component: KontoListComponent;
  let fixture: ComponentFixture<KontoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontoListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
