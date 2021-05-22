import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsseteinnahmenComponent } from './asseteinnahmen.component';

describe('AsseteinnahmenComponent', () => {
  let component: AsseteinnahmenComponent;
  let fixture: ComponentFixture<AsseteinnahmenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsseteinnahmenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsseteinnahmenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
