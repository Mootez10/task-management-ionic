import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  name = '';
  email = '';
  mobile = '';
  password = '';
  confirmPassword = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async register() {
    if (!this.name || !this.email || !this.password) {
      await this.showToast('Please fill all fields ❗', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('Passwords do not match ❌', 'danger');
      return;
    }

    this.loading = true;
    try {
      // ✅ Register user in Auth + Firestore
      const credential = await this.authService.register(
        this.email,
        this.password,
        this.name
      );

      // Optional: also store mobile in Firestore user doc
      // (Add this field manually if you want to extend AuthService)

      await this.showToast('🎉 Registration successful!');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error: any) {
      console.error('Register error:', error);
      await this.showToast('❌ ' + error.message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  async loginWithGoogle() {
  try {
    await this.authService.loginWithGoogle();
    await this.showToast('✅ Google login successful!');
    this.router.navigateByUrl('/user-dashboard', { replaceUrl: true });
  } catch (error: any) {
    await this.showToast('❌ ' + error.message, 'danger');
  }
}

async loginWithGithub() {
  try {
    await this.authService.loginWithGithub();
    await this.showToast('✅ GitHub login successful!');
    this.router.navigateByUrl('/user-dashboard', { replaceUrl: true });
  } catch (error: any) {
    await this.showToast('❌ ' + error.message, 'danger');
  }
}
}
