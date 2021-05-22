import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetVerwaltungComponent } from './asset-verwaltung.component';

describe('AssetVerwaltungComponent', () => {
  let component: AssetVerwaltungComponent;
  let fixture: ComponentFixture<AssetVerwaltungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetVerwaltungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetVerwaltungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
