import { Component, OnInit } from '@angular/core';
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
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
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
  user: any = { name: '', photoURL: '' };
  tasks: any[] = [];
  newTask = '';
  userId = '';
  currentDate = new Date();

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      await this.loadUserInfo();
      await this.loadTasks();
    }
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

  async loadTasks() {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(tasksRef, where('userId', '==', this.userId));
    const snapshot = await getDocs(q);
    this.tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async addTask() {
    if (!this.newTask.trim()) return;
    const tasksRef = collection(this.firestore, 'tasks');
    await addDoc(tasksRef, {
      title: this.newTask,
      userId: this.userId,
      status: 'todo',
      archived: false,
      createdAt: new Date(),
    });
    this.newTask = '';
    await this.loadTasks();
    this.showToast('Task added ✅');
  }

  async editTask(task: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Task',
      inputs: [
        { name: 'title', type: 'text', value: task.title, placeholder: 'Task title' },
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

  async markAsCompleted(task: any) {
    const taskRef = doc(this.firestore, `tasks/${task.id}`);
    await updateDoc(taskRef, { status: 'done' });
    this.showToast('Task completed ✅');
    this.loadTasks();
  }

  async archiveTask(task: any) {
    const taskRef = doc(this.firestore, `tasks/${task.id}`);
    await updateDoc(taskRef, { archived: true });
    this.showToast('Task archived 🗄️');
    this.loadTasks();
  }

  // 🗑 Confirm before deleting a task
async deleteTask(taskId: string) {
  const alert = await this.alertCtrl.create({
    header: 'Delete Task',
    message: 'Are you sure you want to permanently delete this task?',
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
          this.loadTasks();
        },
      },
    ],
  });

  await alert.present();
}


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
