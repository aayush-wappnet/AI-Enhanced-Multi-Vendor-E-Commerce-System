// src/app/core/core.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { ApiService } from './services/api.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [AuthService, ApiService]
})
export class CoreModule {}