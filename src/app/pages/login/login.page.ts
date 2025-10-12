import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      await this.showToast('Please fill all fields ❗', 'warning');
      return;
    }

    this.loading = true;
    try {
      await this.authService.login(this.email, this.password);
      await this.showToast('✅ Login successful!');
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (error: any) {
      console.error('Login error:', error);
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
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  } catch (error: any) {
    await this.showToast('❌ ' + error.message, 'danger');
  }
}

async loginWithGithub() {
  try {
    await this.authService.loginWithGithub();
    await this.showToast('✅ GitHub login successful!');
    this.router.navigateByUrl('/dashboard', { replaceUrl: true });
  } catch (error: any) {
    await this.showToast('❌ ' + error.message, 'danger');
  }
}
}
