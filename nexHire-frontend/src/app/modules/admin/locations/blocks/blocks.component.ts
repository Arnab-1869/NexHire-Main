import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../../services/training.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Block, Branch, CreateBlockRequest } from '../../../../models/location.model';

@Component({
    selector: 'app-blocks',
    template: `
    <div class="locations-page">
      <app-page-header title="Blocks" subtitle="Manage training blocks and capacity."></app-page-header>

      <div class="locations-grid">
        <mat-card class="panel-card form-panel">
          <mat-card-header>
            <mat-card-title>Add New Block</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Block Name</mat-label>
              <input matInput [(ngModel)]="newBlock.blockName" placeholder="Block name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Branch</mat-label>
              <mat-select [(value)]="newBlock.branchId">
                <mat-option *ngFor="let branch of branches" [value]="branch.branchId">{{ branch.branchName }} ({{ branch.cityName }})</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Total Capacity</mat-label>
              <input matInput type="number" [(ngModel)]="newBlock.totalCapacity" placeholder="Total capacity" />
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addBlock()">Add Block</button>
          </mat-card-content>
        </mat-card>

        <mat-card class="panel-card table-panel">
          <mat-card-header>
            <mat-card-title>Existing Blocks</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-empty-state *ngIf="blocks.length === 0" icon="location_on" title="No blocks configured" subtitle="Add training blocks to support batch allocation."></app-empty-state>
            <div class="table-container" *ngIf="blocks.length > 0">
              <table mat-table [dataSource]="blocks">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Block</th>
                  <td mat-cell *matCellDef="let block">{{ block.blockName }}</td>
                </ng-container>
                <ng-container matColumnDef="branch">
                  <th mat-header-cell *matHeaderCellDef>Branch</th>
                  <td mat-cell *matCellDef="let block">{{ block.branchName }}</td>
                </ng-container>
                <ng-container matColumnDef="capacity">
                  <th mat-header-cell *matHeaderCellDef>Capacity</th>
                  <td mat-cell *matCellDef="let block">{{ block.totalCapacity }}</td>
                </ng-container>
                <ng-container matColumnDef="vacancy">
                  <th mat-header-cell *matHeaderCellDef>Vacancy</th>
                  <td mat-cell *matCellDef="let block">{{ block.availableVacancy }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .locations-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .locations-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
    }
    @media (max-width: 992px) {
      .locations-grid {
        grid-template-columns: 1fr;
      }
    }
    .panel-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
      padding: 16px;
    }
    .full-width {
      width: 100%;
    }
    .table-container {
      margin-top: 16px;
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
  `],
    standalone: false
})
export class BlocksComponent implements OnInit {
  blocks: Block[] = [];
  branches: Branch[] = [];
  displayedColumns = ['name', 'branch', 'capacity', 'vacancy'];
  newBlock: Partial<CreateBlockRequest> = {
    blockName: '',
    branchId: 0,
    totalCapacity: 0
  };

  constructor(
    private trainingService: TrainingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadBlocks();
  }

  loadBranches(): void {
    this.trainingService.getBranches().subscribe(list => this.branches = list || []);
  }

  loadBlocks(): void {
    this.trainingService.getBlocks().subscribe(list => this.blocks = list || []);
  }

  addBlock(): void {
    if (!this.newBlock.blockName?.trim() || !this.newBlock.branchId || !this.newBlock.totalCapacity) {
      this.toastService.error('Block name, branch, and capacity are required.');
      return;
    }
    this.trainingService.createBlock(this.newBlock as CreateBlockRequest).subscribe({
      next: block => {
        this.toastService.success('Block added successfully.');
        this.blocks = [block, ...this.blocks];
        this.newBlock = { blockName: '', branchId: 0, totalCapacity: 0 };
      },
      error: () => this.toastService.error('Failed to add block.')
    });
  }
}
