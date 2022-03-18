import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {MainService} from "../services/main.service";
import {actions} from "../actions";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public error: any;
  public name = environment.panelName;
  public loading = false;
  public actions = actions;

  constructor(private fb: FormBuilder, private service: MainService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.service.currentDTOValue?.user?.username) {
      this.router.navigate([actions.home.path]);
    }

  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    if (this.form.valid) {
      this.service.action('login', this.form.value).subscribe(data => {
        if (data?.user?.id) {
          localStorage.setItem('dto', JSON.stringify(data));
          this.service.currentDTOSubject.next(data);
          this.service.openSnackBar(`Success : login successfully`);
          this.router.navigate([actions.home.path]);
        } else {
          this.error = 'Your credentials are incorrect please try again';
        }
      }, e => {
        this.error = e;
      }, () => {
        this.loading = false;
      });
    } else {
      this.error = 'Your typing value is incorrect please try again';
      this.loading = false;
    }
  }
}
