import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTasksPage } from './admin-tasks.page';

describe('AdminTasksPage', () => {
  let component: AdminTasksPage;
  let fixture: ComponentFixture<AdminTasksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
