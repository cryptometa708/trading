import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MainService} from "../services/main.service";
import {environment} from "../../environments/environment";
import {actions} from "../actions";


@Component({
  selector: 'app-dashboard',
  template: `
      <mat-toolbar color="primary">
          <mat-toolbar-row>
              <img [routerLink]="actions.home.path" [src]="logo" width="40" alt="DOGE coin">
              <div [routerLink]="actions.home.path">{{name}}</div>
              <span class="example-spacer"></span>
              <span></span>
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Example icon-button with a menu">
                  <mat-icon>menu</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                  <button mat-menu-item class="update-icon icon" aria-label="update your panel data"
                          [routerLink]="actions.settings.path">
                      <mat-icon>settings</mat-icon>
                      <span>Settings</span>
                  </button>

                  <button mat-menu-item class="update-icon icon" aria-label="update your panel data" (click)="1==1">
                      <mat-icon>update</mat-icon>
                      <span>Update</span>
                  </button>
                  <button mat-menu-item class="logout-icon icon" aria-label="logout from your panel" (click)="logout()">
                      <mat-icon>logout</mat-icon>
                      <span>Logout</span>
                  </button>
              </mat-menu>
          </mat-toolbar-row>
      </mat-toolbar>
      <router-outlet></router-outlet>`,
  styles: [`.example-spacer {
      flex: 1 1 auto;
  }

  mat-toolbar-row > div {
      margin-left: 10px;
  }

  .mat-menu-item .mat-icon {
      margin-right: 7px;
  }`]
})
export class DashboardComponent implements OnInit {

  public name = environment.panelName;
  public logo = environment.panelLogo;
  public loading = true;
  public actions = actions;

  constructor(private service: MainService, private router: Router) {

  }

  ngOnInit(): void {
  }

  logout() {
    this.service.logout();
    this.router.navigate(['/login']);
  }


}
