import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetlistCreate } from './setlist-create';

describe('SetlistCreate', () => {
  let component: SetlistCreate;
  let fixture: ComponentFixture<SetlistCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetlistCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetlistCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
