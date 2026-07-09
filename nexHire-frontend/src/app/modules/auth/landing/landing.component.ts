import { Component } from '@angular/core';

@Component({
    selector: 'app-landing',
    template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Accelerate Your Career with NexHire</h1>
          <p>NexHire maps candidates from application through assessment, verification, training, and final enterprise project allocation.</p>
          <div class="hero-buttons">
            <button mat-raised-button color="primary" routerLink="/auth/register" class="hero-btn">Get Started</button>
            <button mat-stroked-button color="primary" routerLink="/auth/login" class="hero-btn secondary">Login to Portal</button>
          </div>
        </div>
        <div class="hero-image-placeholder">
          <mat-icon class="hero-icon">work_history</mat-icon>
        </div>
      </section>

      <!-- Flow / Steps Section -->
      <section class="flow-section">
        <h2>Recruitment-to-Project Allocation Pipeline</h2>
        <div class="flow-steps">
          <div class="step-card">
            <div class="step-num">1</div>
            <h3>Apply & Profile</h3>
            <p>Register profile and apply for open positions aligned to your tech stack.</p>
          </div>
          <div class="step-card">
            <div class="step-num">2</div>
            <h3>Assessments & BGV</h3>
            <p>Undergo standard coding assessments and secure background verification checks.</p>
          </div>
          <div class="step-card">
            <div class="step-num">3</div>
            <h3>Intense Training</h3>
            <p>Get assigned to specialized batches in active city hubs with capacity/budget tracking.</p>
          </div>
          <div class="step-card">
            <div class="step-num">4</div>
            <h3>Project Tagging</h3>
            <p>Transition to a released state and allocate directly to live enterprise client projects.</p>
          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    .landing-page {
      width: 100%;
      overflow-x: hidden;
    }
    .hero-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
      flex-wrap: wrap;
    }
    .hero-content {
      flex: 1;
      min-width: 320px;
    }
    .hero-content h1 {
      font-size: 48px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .hero-content p {
      font-size: 18px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 36px;
      max-width: 540px;
    }
    .hero-buttons {
      display: flex;
      gap: 16px;
    }
    .hero-btn {
      height: 48px;
      padding: 0 28px !important;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
    }
    .hero-btn.secondary {
      border-color: #3f51b5;
      color: #3f51b5;
    }
    .hero-image-placeholder {
      flex: 1;
      min-width: 320px;
      height: 380px;
      background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #4f46e5;
    }
    .flow-section {
      background-color: white;
      padding: 80px 24px;
      border-top: 1px solid #e2e8f0;
    }
    .flow-section h2 {
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 48px;
    }
    .flow-steps {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    .step-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      position: relative;
      transition: transform 0.2s;
    }
    .step-card:hover {
      transform: translateY(-5px);
    }
    .step-num {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #e0e7ff;
      color: #3f51b5;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      margin-bottom: 16px;
    }
    .step-card h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .step-card p {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
  `],
    standalone: false
})
export class LandingComponent {}
