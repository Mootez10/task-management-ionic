import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { deleteDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
})
export class UserDashboardPage implements OnInit, OnDestroy {
  user: any = { name: '', photoURL: '' };
  tasks: any[] = [];
  filteredTasks: any[] = [];
  userId = '';
  currentDate = new Date();
  days: any[] = [];
  selectedDate: string | null = null;
  unsubscribeTasks: any; // for real-time listener cleanup

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.generateDays();
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      await this.loadUserInfo();
      this.listenToTasks(); // ✅ Real-time listener instead of getDocs
    }
  }

  ngOnDestroy() {
    // Clean up listener when component is destroyed
    if (this.unsubscribeTasks) {
      this.unsubscribeTasks();
    }
  }

  generateDays() {
    const today = new Date();
    const daysArray = [];
    for (let i = -2; i <= 4; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      daysArray.push({
        fullDate: date,
        date: date.getDate(),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        active: i === 0,
      });
    }
    this.days = daysArray;
    this.selectedDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async selectDay(day: any) {
    this.days.forEach((d) => (d.active = false));
    day.active = true;
    this.selectedDate = this.formatDate(day.fullDate);
    this.filterTasks();
  }

  async loadUserInfo() {
    const userRef = doc(this.firestore, `users/${this.userId}`);
    const snapshot = await getDoc(userRef);
    this.user = snapshot.exists()
      ? snapshot.data()
      : {
          name: this.auth.currentUser?.displayName || 'User',
          photoURL:
            this.auth.currentUser?.photoURL ||
            'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        };
  }

  // ✅ Real-time Firestore listener
  listenToTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', this.userId));

    this.unsubscribeTasks = onSnapshot(q, (snapshot) => {
      this.tasks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        dateOnly: this.formatDate(
          d.data()['date']
            ? new Date(d.data()['date'])
            : new Date(d.data()['createdAt'])
        ),
      }));

      this.filterTasks();
    });
  }

  filterTasks() {
    if (!this.selectedDate) return;
    this.filteredTasks = this.tasks.filter(
      (t) => t.dateOnly === this.selectedDate
    );
  }

  goToCreateTask() {
    this.router.navigateByUrl('/create-task');
  }

  // ✏️ Edit task
async editTask(task: any) {
  const alert = await this.alertCtrl.create({
    header: 'Edit Task',
    inputs: [
      {
        name: 'title',
        type: 'text',
        value: task.title,
        placeholder: 'Enter new task title',
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Save',
        handler: async (data) => {
          if (!data.title.trim()) return;

          const taskRef = doc(this.firestore, `tasks/${task.id}`);
          await updateDoc(taskRef, { title: data.title });

          this.showToast('Task updated ✏️');
        },
      },
    ],
  });

  await alert.present();
}

// 🗑 Delete task with confirmation
async deleteTask(taskId: string) {
  const alert = await this.alertCtrl.create({
    header: 'Delete Task',
    message: 'Are you sure you want to delete this task?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'alert-button-cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        cssClass: 'alert-button-delete',
        handler: async () => {
          await deleteDoc(doc(this.firestore, `tasks/${taskId}`));
          this.showToast('Task deleted 🗑️', 'danger');
        },
      },
    ],
  });

  await alert.present();
}

// 🔔 Toast helper
async showToast(message: string, color: string = 'success') {
  const toast = await this.toastCtrl.create({
    message,
    duration: 2000,
    color,
  });
  await toast.present();
}

async logout() {
  try {
    await this.auth.signOut(); // ✅ Firebase logout
    await this.showToast('Logged out successfully 👋', 'medium');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  } catch (error) {
    console.error('Logout error:', error);
    this.showToast('Logout failed ❌', 'danger');
  }
}
}

