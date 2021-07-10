import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotBuchungenComponent } from './depot-buchungen.component';

describe('DepotBuchungenComponent', () => {
  let component: DepotBuchungenComponent;
  let fixture: ComponentFixture<DepotBuchungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepotBuchungenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepotBuchungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
