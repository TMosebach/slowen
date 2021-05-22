import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssethandelComponent } from './assethandel.component';

describe('AssethandelComponent', () => {
  let component: AssethandelComponent;
  let fixture: ComponentFixture<AssethandelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssethandelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssethandelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
