import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MainService} from "../services/main.service";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {actions} from "../actions";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public exchanges: any;
  public loading = false;
  public hidePssword = true;
  public hideApiSecret = true;
  public error: any;
  public name = environment.panelName;

  public actions = actions;

  constructor(private fb: FormBuilder, private service: MainService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      apiKey: ['', [Validators.required]],
      apiSecret: ['', [Validators.required]],
      main: [1, [Validators.required]],
      exchange: ['binance', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.service.action("exchanges", {}).subscribe(next => {
      this.exchanges = next;
    }, error => {
      console.log(error);
    }, () => {
      this.loading = false;
    })
  }


  onSubmit(): void {
    this.loading = true;
    this.error = '';
    if (this.registerForm.valid) {
      this.service.action('register', this.registerForm.value).subscribe(data => {
        if (data?.code == 200) {
          const dto = this.service.currentDTOValue;
          dto.user = data.user;
          dto.exchanges.push(data.exchange);
          localStorage.setItem('dto', JSON.stringify(dto));
          this.service.currentDTOSubject.next(dto);
          this.service.openSnackBar(`Success : Your registration has been successful`);
          this.router.navigate([actions.home.path]);
        } else {
          this.error = 'Your registration data are incorrect please try again';
        }
      }, e => {
        this.error = e;
      }, () => {
        this.loading = false;
      });
    } else {
      this.error = 'Your typing values are incorrect please try again';
      this.loading = false;
    }
  }

}
