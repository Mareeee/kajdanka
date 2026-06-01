import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistDetail } from './setlist-detail';

describe('SetlistDetail', () => {
  let component: SetlistDetail;
  let fixture: ComponentFixture<SetlistDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetlistDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
