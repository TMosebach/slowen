import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetFormularComponent } from './asset-formular.component';

describe('AssetFormularComponent', () => {
  let component: AssetFormularComponent;
  let fixture: ComponentFixture<AssetFormularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetFormularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetFormularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
