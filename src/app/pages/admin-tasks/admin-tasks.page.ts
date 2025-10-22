import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import {
  Firestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './admin-tasks.page.html',
  styleUrls: ['./admin-tasks.page.scss'],
})
export class AdminTasksPage implements OnInit {
  tasks: any[] = [];
  filteredTasks: any[] = [];
  searchTerm: string = '';

  constructor(
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private router: Router,
    private auth: Auth // 👈 needed to check current user
  ) {}

  async ngOnInit() {
    await this.loadTasks();
  }

  // ✅ Load tasks depending on user role
  async loadTasks() {
    const user = this.auth.currentUser;
    if (!user) return;

    let q;

    // 👑 If admin, show all tasks
    if (user.email === 'admin@gmail.com') {
      q = query(collection(this.firestore, 'tasks'), orderBy('createdAt', 'desc'));
    } else {
      // 👤 Normal user → show only their own tasks
      q = query(
        collection(this.firestore, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    this.tasks = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    this.filteredTasks = [...this.tasks];
  }

  // 🔍 Filter tasks by search input
  filterTasks() {
    const term = this.searchTerm.toLowerCase();
    this.filteredTasks = this.tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(term) ||
        task.category?.toLowerCase().includes(term)
    );
  }

  // 👁️ View details in a simple alert
  async viewTask(task: any) {
    const formattedDate = task?.createdAt?.toDate
      ? task.createdAt.toDate().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'No date available';

    const message =
      `📋 Title: ${task?.title || 'Untitled Task'}\n` +
      `🏷️ Category: ${task?.category || 'Not specified'}\n` +
      `📅 Date: ${formattedDate}`;

    const alert = await this.alertCtrl.create({
      header: 'Task Details',
      message,
      cssClass: 'task-details-alert',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          cssClass: 'alert-button-close',
        },
      ],
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}
