import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PollenListComponent } from './pollen-list.component';

describe('PollenListComponent', () => {
  let component: PollenListComponent;
  let fixture: ComponentFixture<PollenListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PollenListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
