import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetNeuComponent } from './asset-neu.component';

describe('AssetNeuComponent', () => {
  let component: AssetNeuComponent;
  let fixture: ComponentFixture<AssetNeuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetNeuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetNeuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
