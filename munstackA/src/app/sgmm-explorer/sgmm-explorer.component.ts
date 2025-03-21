// sgmm-explorer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SharedStateService, Dimensions } from '../shared-state.service';

// Child components
import { ExplorerInsightsComponent } from '../explorer-insights/explorer-insights.component';
import { ExplorerHeaderComponent } from '../explorer-header/explorer-header.component';
import { ExplorerSidebarComponent } from '../explorer-sidebar/explorer-sidebar.component';
import { SgmmLevelViewsComponent } from '../sgmm-level-view/sgmm-level-view.component';

@Component({
  selector: 'app-sgmm-explorer',
  templateUrl: './sgmm-explorer.component.html',
  styleUrls: ['./sgmm-explorer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ExplorerInsightsComponent,
    SgmmLevelViewsComponent,
    ExplorerHeaderComponent,
    ExplorerSidebarComponent
  ],
})
export class SgmmExplorerComponent implements OnInit, OnDestroy {
  // Local copies for template binding
  selectedDimensions!: Dimensions;
  currentLevel = 0;

  // Step-based wizard: step=1..3 for partial UI, step=4 to show full explorer
  step = 1;

  // Level names from the service
  levels: string[] = [];

  private subs: Subscription[] = [];

  constructor(private sharedState: SharedStateService) {}

  ngOnInit(): void {
    // Pull level names from the service
    this.levels = this.sharedState.getLevels();

    // Subscribe to dimension changes
    const dimsSub = this.sharedState.dimensions$.subscribe(dims => {
      this.selectedDimensions = dims;
    });
    this.subs.push(dimsSub);

    // Subscribe to currentLevel from SharedStateService
    const levelSub = this.sharedState.currentLevel$.subscribe(level => {
      this.currentLevel = level;
    });
    this.subs.push(levelSub);

    // Initialize local copies
    this.selectedDimensions = this.sharedState.getDimensions();
    this.currentLevel = this.sharedState.getCurrentLevel();
  }

  ngOnDestroy(): void {
    // Cleanup
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // Delegate level updates to SharedStateService
  setLevel(index: number): void {
    this.sharedState.setLevel(index);
  }

  zoomIn(): void {
    this.sharedState.zoomIn(this.levels);
  }

  zoomOut() {
    this.sharedState.zoomOut();
  }

  /*
  // Update selected dimension
  updateDimension(key: string, value: string) {
    if (Object.prototype.hasOwnProperty.call(this.selectedDimensions, key)) {
      this.selectedDimensions[key as keyof Dimensions] = value;
    }
  }
    */

  nextStep() {
    if (this.step < 3) {
      this.step += 1;
    }
  }

  // Final step reached -> Show full explorer
  completeSetup() {
    // Once step=4, we show the main explorer UI
    this.step = 4;
  }

  // Delegate dimension changes to the service
  updateDimension(key: string, value: string) {
    this.sharedState.updateDimension(key as keyof Dimensions, value);
  }

}

