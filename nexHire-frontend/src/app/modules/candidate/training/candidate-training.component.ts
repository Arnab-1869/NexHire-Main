import { Component, OnInit } from '@angular/core';
import {
  TraineeProgressService,
  TraineeRecord,
} from '../../../services/trainee-progress.service';

@Component({
  selector: 'app-candidate-training',
  template: `
    <div class="candidate-training">
      <app-page-header
        title="My Training"
        subtitle="Track your onboarding training progress"
      ></app-page-header>

      <app-empty-state
        *ngIf="!record && loaded"
        icon="school"
        title="No training record yet"
        subtitle="Accept your joining letter to begin training."
      ></app-empty-state>

      <mat-card class="training-card" *ngIf="record">
        <mat-card-header>
          <mat-icon mat-card-avatar class="t-icon">school</mat-icon>
          <mat-card-title>{{ record.jobTitle }}</mat-card-title>
          <mat-card-subtitle
            >Status: {{ record.applicationStatus }}</mat-card-subtitle
          >
        </mat-card-header>
        <mat-card-content>
          <div class="progress-block">
            <div class="progress-head">
              <span>Progress</span>
              <span class="pct">{{ record.progress }}%</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="record.progress"
            ></mat-progress-bar>
          </div>
          <p class="topic" *ngIf="record.topic">
            Current topic: <strong>{{ record.topic }}</strong>
          </p>
          <p class="done" *ngIf="record.completed">
            Training completed — awaiting project assignment.
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .candidate-training {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .training-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
        padding: 16px;
        max-width: 600px;
      }
      .t-icon {
        color: #4f46e5;
      }
      .progress-block {
        margin: 16px 0;
      }
      .progress-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 14px;
        color: #475569;
      }
      .pct {
        font-weight: 700;
        color: #1e293b;
      }
      .topic {
        color: #475569;
        margin-top: 12px;
      }
      .done {
        color: #16a34a;
        font-weight: 600;
        margin-top: 8px;
      }
    `,
  ],
  standalone: false,
})
export class CandidateTrainingComponent implements OnInit {
  record: TraineeRecord | null = null;
  loaded = false;

  constructor(private training: TraineeProgressService) {}

  ngOnInit(): void {
    this.training.getMyTraining().subscribe({
      next: (r) => {
        this.record = r;
        this.loaded = true;
      },
      error: () => {
        this.record = null;
        this.loaded = true;
      },
    });
  }
}
