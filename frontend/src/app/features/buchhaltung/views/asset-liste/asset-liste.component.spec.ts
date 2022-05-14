import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetListeComponent } from './asset-liste.component';

describe('AssetListeComponent', () => {
  let component: AssetListeComponent;
  let fixture: ComponentFixture<AssetListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetListeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
