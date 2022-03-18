import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../environments/environment";
import {MainService} from "../../services/main.service";
import {Router} from "@angular/router";
import {User} from "../../models/User";
import {Exchange} from "../../models/Exchange";
import {actions} from "../../actions";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements AfterViewInit {
  public settingForm: FormGroup;
  public exchanges: any;
  public loading = false;
  public hidePassword = true;
  public hideApiSecret = true;
  public error: any;
  public name = environment.panelName;
  public add = false;


  constructor(private fb: FormBuilder, private service: MainService, private router: Router) {
    this.settingForm = this.fb.group({
      id: [this.user.id, [Validators.required]],
      username: [this.user.username, [Validators.required]],
      password: [this.user.password, [Validators.required]],
      selected: [''],
      apiKey: [''],
      apiSecret: [''],
      exchange: ['binance'],
      // exchanges: this.fb.array(this.initExchanges(this.userExchanges)),
    });
  }

  get userExchanges(): Exchange[] {
    return this.service.currentDTOValue.exchanges;
  }

  ngAfterViewInit(): void {
    this.loading = true;
    this.service.action("exchanges", {}).subscribe(next => {
      this.exchanges = next;
    }, error => {
      console.log(error);
    }, () => {
      this.loading = false;
    });
  }

  get user(): User {
    return this.service.currentDTOValue.user;
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    if (this.settingForm.valid) {
      const user: User = {
        id: this.settingForm.value.id,
        username: this.settingForm.value.username,
        password: this.settingForm.value.password,
        enabled: 1
      };
      const exchanges = this.userExchanges.map((exchange: Exchange) => {
        exchange.main = exchange.id == this.settingForm.value.selected ? 1 : 0;
        return exchange;
      });
      this.service.action('settings', {user: user, exchanges: exchanges}).subscribe(data => {
        console.log(data);
        if (data?.code == 200) {
          const dto = this.service.currentDTOValue;
          dto.user = user;
          dto.exchanges = exchanges;
          localStorage.setItem('dto', JSON.stringify(dto));
          this.service.currentDTOSubject.next(dto);
          this.service.openSnackBar(`Success : Your have registered your data successfully`);
        } else {
          this.error = 'Error : Your submitted settings data are incorrect please try again';
        }
      }, error => {
        this.error = error;
        this.loading = false;
      }, () => {
        this.loading = false;
      });
    } else {
      this.error = 'Your typing values are incorrect please try again';
      this.loading = false;
    }
  }


  delete(exchangeId: string, index: number) {
    this.loading = true;
    this.service.action("delete_exchange", {id: exchangeId}).subscribe(next => {
      if (next?.code == 200) {
        this.userExchanges.splice(index, 1);
        this.service.openSnackBar(`Success : Your have deleted the exchange successfully`);
        this.loading = false;
      } else {
        this.error = 'Error : Your have an error';
      }
    }, error => {
      this.error = `Error : Your have an error ${error}`;
      this.loading = false;
    }, () => this.loading = false);
  }

  saveExchange() {
    if (this.settingForm.value.apiKey && this.settingForm.value.apiSecret) {
      this.userExchanges.push({
        id: this.service.makeid(12),
        exchange: this.settingForm.value.exchange,
        apiKey: this.settingForm.value.apiKey,
        apiSecret: this.settingForm.value.apiSecret,
        main: 0
      });
      this.add = !this.add;
    }
  }
}
