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
  // The task model bound to your form fields
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

  // ✅ Create a task and associate it with the current user
  async createTask() {
    const user = this.auth.currentUser; // get currently logged-in user
    if (!user) return; // safety check — no user = do nothing

    // 1️⃣ Validate required fields
    if (!this.task.title || !this.task.date || !this.task.startTime) {
      this.showToast('Please fill all required fields ⚠️', 'warning');
      return;
    }

    // 2️⃣ Show loading spinner while task is being created
    const loading = await this.loadingCtrl.create({
      message: 'Creating your task...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // 3️⃣ Combine date + time into one JS Date object
      const datePart = new Date(this.task.date);
      const [startHour, startMinute] = this.task.startTime.split(':').map(Number);
      datePart.setHours(startHour, startMinute, 0);

      // 4️⃣ Save the task in Firestore under the `tasks` collection
      // 🚀 Important: link the task to the logged-in user using user.uid
      const taskRef = collection(this.firestore, 'tasks');
      await addDoc(taskRef, {
        ...this.task,
        userId: user.uid, // ✅ this ensures tasks are user-specific
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || 'unknown',
        status: 'todo',
        archived: false,
        createdAt: new Date(),
      });

      // 5️⃣ Schedule local notification 2 minutes before start time
      const notifyAt = new Date(datePart.getTime() - 2 * 60 * 1000);
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

      // 💻 Fallback for browsers (not mobile)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🕓 Task Reminder', {
          body: `Upcoming task: ${this.task.title}`,
          icon: 'assets/icon/favicon.png',
        });
      }

      // 6️⃣ Stop loading + show success message
      await loading.dismiss();
      this.showToast('Task created successfully ✅');

      // 7️⃣ Redirect automatically to user dashboard
      this.router.navigateByUrl('/user-dashboard', { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      console.error('Error creating task:', error);
      this.showToast('Error creating task ❌', 'danger');
    }
  }

  // 🔙 Back button action
  goBack() {
    this.router.navigateByUrl('/user-dashboard');
  }

  // 🔔 Toast helper method
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
