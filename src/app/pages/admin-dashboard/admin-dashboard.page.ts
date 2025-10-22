import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage {
  totalUsers = 0;
  totalTasks = 0;

  constructor(private router: Router, private firestore: Firestore) {}

  async ngOnInit() {
    const usersSnap = await getDocs(collection(this.firestore, 'users'));
    this.totalUsers = usersSnap.size;

    const tasksSnap = await getDocs(collection(this.firestore, 'tasks'));
    this.totalTasks = tasksSnap.size;
  }

  goToUsers() {
    this.router.navigate(['/admin-users']);
  }

  goToTasks() {
    this.router.navigate(['/admin-tasks']);
  }
}
