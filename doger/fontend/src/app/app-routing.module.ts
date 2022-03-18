import {NgModule} from '@angular/core';
import {LoginComponent} from "./login/login.component";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./dashboard/home/home.component";
import {AuthGuard} from "./services/auth-guard.service";
import {RegisterComponent} from "./register/register.component";
import {OpenComponent} from "./dashboard/home/trades/open.component";
import {PositionComponent} from "./dashboard/home/trades/position.component";
import {TvComponent} from "./dashboard/home/tv.component";
import {CommandComponent} from "./dashboard/home/command/command.component";
import {LoadingComponent} from "./services/loading.component";
import {HistoryComponent} from "./dashboard/home/trades/history.component";
import {SettingsComponent} from "./dashboard/settings/settings.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {actions} from "./actions"

const routes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: actions.login.route, component: LoginComponent},
  {path: actions.register.route, component: RegisterComponent},
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], children: [
      {path: actions.home.route, component: HomeComponent},
      {path: actions.settings.route, component: SettingsComponent},
      {path: '**', component: HomeComponent},
    ]
  },

  {path: '**', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

export const routingComponents: any[] = [
  LoginComponent,
  HomeComponent,
  RegisterComponent,
  OpenComponent,
  PositionComponent,
  RegisterComponent,
  TvComponent,
  RegisterComponent,
  CommandComponent,
  LoadingComponent,
  HistoryComponent,
  SettingsComponent,
  DashboardComponent
];
