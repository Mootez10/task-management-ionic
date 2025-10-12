import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  AlertController,
} from '@ionic/angular';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
})
export class UserDashboardPage implements OnInit {
  tasks: any[] = [];
  newTask = '';
  userId = '';

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      await this.loadTasks();
    }
  }

  // 🔄 Load all tasks for current user
  async loadTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    this.tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ➕ Add new task
  async addTask() {
    if (!this.newTask.trim()) return;
    const tasksRef = collection(this.firestore, 'tasks');
    await addDoc(tasksRef, {
      title: this.newTask,
      userId: this.userId,
      status: 'todo',
      createdAt: new Date(),
    });
    this.newTask = '';
    await this.loadTasks();
    this.showToast('Task added ✅');
  }

  // 📝 Edit task
  async editTask(task: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Task',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: task.title,
          placeholder: 'Task title',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            const taskRef = doc(this.firestore, `tasks/${task.id}`);
            await updateDoc(taskRef, { title: data.title });
            this.showToast('Task updated ✏️');
            this.loadTasks();
          },
        },
      ],
    });
    await alert.present();
  }

  // 🗑 Delete task
  async deleteTask(taskId: string) {
    await deleteDoc(doc(this.firestore, `tasks/${taskId}`));
    this.showToast('Task deleted 🗑️');
    this.loadTasks();
  }

  // 🚪 Logout
  async logout() {
    await this.auth.signOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }
}
