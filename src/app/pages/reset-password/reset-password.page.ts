import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink  } from '@angular/router';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink ],
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss']
})
export class ResetPasswordPage {
  email = '';
  message = '';
  loading = false;

  constructor(private authService: AuthService) {}

  async resetPassword() {
    this.loading = true;
    this.message = '';
    try {
      await this.authService.resetPassword(this.email);
      this.message = '✅ Reset email sent! Check your inbox.';
    } catch (err: any) {
      this.message = '❌ ' + err.message;
    } finally {
      this.loading = false;
    }
  }
}
