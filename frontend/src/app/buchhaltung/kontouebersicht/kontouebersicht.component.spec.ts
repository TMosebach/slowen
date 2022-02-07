import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontouebersichtComponent } from './kontouebersicht.component';

describe('KontouebersichtComponent', () => {
  let component: KontouebersichtComponent;
  let fixture: ComponentFixture<KontouebersichtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontouebersichtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KontouebersichtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
