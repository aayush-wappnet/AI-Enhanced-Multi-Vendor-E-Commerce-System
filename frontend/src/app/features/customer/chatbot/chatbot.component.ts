import { Component, EventEmitter, Output, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
  @Output() closeChat = new EventEmitter<void>();
  message = '';
  messages: { role: string; content: string }[] = [];
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Do not call addMessage here; move to ngOnInit
  }

  ngOnInit() {
    // Initialize with welcome message in ngOnInit
    this.addMessage('bot', 'Hello! How can I assist you today?');
  }

  sendMessage() {
    if (!this.message.trim()) return;

    this.addMessage('user', this.message);
    this.isLoading = true;

    this.apiService.getChatbotResponse(this.message).subscribe({
      next: (response) => {
        if (response && response.response) {
          this.addMessage('bot', response.response);
        } else {
          this.addMessage('bot', 'No response from server.');
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (error) => {
        this.addMessage('bot', 'Sorry, I couldn’t process your request right now.');
        this.isLoading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });

    this.message = '';
  }

  private addMessage(role: 'user' | 'bot', content: string) {
    this.messages.push({ role, content });
  }

  onClose() {
    this.closeChat.emit();
  }
}