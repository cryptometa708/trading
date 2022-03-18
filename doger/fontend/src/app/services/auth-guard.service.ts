import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {MainService} from "./main.service";


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authenticationService: MainService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const loggedIn = this.authenticationService.currentDTOValue?.user?.username;
    if (loggedIn) {
      return true;
    }
    this.router.navigate(['error'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
