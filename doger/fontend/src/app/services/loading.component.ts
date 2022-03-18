import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
      <div class="overlay">
          <div class="center">
              <mat-progress-spinner diameter=50 class="center"
                                    mode="indeterminate"
                                    color="accent">
              </mat-progress-spinner>
          </div>
      </div>`,
  styles: [`
      .overlay {
          height: 100%;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.286);
          z-index: 10;
          top: 0;
          left: 0;
          position: fixed;
      }

      body {
          margin: 0;
      }

      .center {
          margin: 0;
          position: absolute;
          top: 30%;
          left: 50%;
          -ms-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
      }
      `]
})
export class LoadingComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
