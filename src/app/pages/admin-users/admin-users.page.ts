import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, getDocs, deleteDoc,updateDoc, doc } from '@angular/fire/firestore';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage {
  users: any[] = [];

  constructor(
    private router: Router,
    private firestore: Firestore,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    const snapshot = await getDocs(collection(this.firestore, 'users'));
    this.users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }

  async deleteUser(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            await deleteDoc(doc(this.firestore, `users/${id}`));
            this.loadUsers();
            this.showToast('User deleted 🗑️', 'danger');
          },
        },
      ],
    });
    await alert.present();
  }

  async editUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit User',
      inputs: [
        { name: 'name', type: 'text', value: user.name },
        { name: 'email', type: 'email', value: user.email },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            const userRef = doc(this.firestore, `users/${user.id}`);
            await updateDoc(userRef, data);
            this.loadUsers();
            this.showToast('User updated ✏️');
          },
        },
      ],
    });
    await alert.present();
  }

  async showToast(msg: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      color,
    });
    await toast.present();
  }
}
