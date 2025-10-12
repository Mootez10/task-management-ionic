import { Component } from '@angular/core';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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

  categories = [
    'Marketing',
    'Meeting',
    'Production',
    'Dev',
    'Dashboard Design',
    'UI Design',
  ];

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router,
    ) {}

  goBack() {
    this.router.navigateByUrl('/dashboard');
  }

  async createTask() {
    const user = this.auth.currentUser;
    if (!user) return;

    if (!this.task.title || !this.task.date) {
      this.showToast('Please fill all required fields ⚠️', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creating task...' });
    await loading.present();

    const taskRef = collection(this.firestore, 'tasks');
    await addDoc(taskRef, {
      ...this.task,
      userId: user.uid,
      status: 'todo',
      archived: false,
      createdAt: new Date(),
    });

    await loading.dismiss();
    this.showToast('Task created successfully ✅');
    this.router.navigateByUrl('/dashboard');
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  


}



