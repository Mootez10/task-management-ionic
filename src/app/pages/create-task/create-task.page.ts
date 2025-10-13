import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  addDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './create-task.page.html',
  styleUrls: ['./create-task.page.scss'],
})
export class CreateTaskPage {
  task: any = {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    category: '',
  };

  categories = ['Work', 'Study', 'Health', 'Personal', 'Shopping', 'Other'];

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  // ⏰ Create task and schedule notification
  async createTask() {
    const user = this.auth.currentUser;
    if (!user) return;

    if (!this.task.title || !this.task.date || !this.task.startTime) {
      this.showToast('Please fill all required fields ⚠️', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creating your task...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // 🕒 Merge date and time into a single Date object
      const datePart = new Date(this.task.date);
      const [startHour, startMinute] = this.task.startTime.split(':').map(Number);
      datePart.setHours(startHour, startMinute, 0);

      // ✅ Save to Firestore
      const taskRef = collection(this.firestore, 'tasks');
      await addDoc(taskRef, {
        ...this.task,
        userId: user.uid,
        status: 'todo',
        archived: false,
        createdAt: new Date(),
      });

      // ✅ Schedule notification with Capacitor
      const notifyAt = new Date(datePart.getTime() - 2 * 60 * 1000); // 2 min before task
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: '🕓 Task Reminder',
            body: `Upcoming task: ${this.task.title}`,
            schedule: { at: notifyAt },
          },
        ],
      });

      // 💻 Fallback for browser demo
      if (!('Notification' in window)) {
        console.log('Browser notifications not supported');
      } else {
        new Notification('🕓 Task Reminder', {
          body: `Upcoming task: ${this.task.title}`,
          icon: 'assets/icon/favicon.png',
        });
      }

      await loading.dismiss();
      this.showToast('Task created successfully ✅');
      this.router.navigateByUrl('/dashboard');
    } catch (error) {
      await loading.dismiss();
      console.error('Error creating task:', error);
      this.showToast('Error creating task ❌', 'danger');
    }
  }

  // 🔙 Go back to dashboard
  goBack() {
    this.router.navigateByUrl('/dashboard');
  }

  // ✅ Toast helper
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
