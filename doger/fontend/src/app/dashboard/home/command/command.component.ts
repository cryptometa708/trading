import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MainService} from "../../../services/main.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Trade} from "../../../models/Trade";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class CommandComponent implements AfterViewInit {
  public commandForm: FormGroup;
  public symbols: any;
  public filteredOptions: any;
  public loading: boolean;
  public balances: any;
  public targetCurrency: string;
  public sourceCurrency: string;
  public targetCurrencyBalance: number;
  public sourceCurrencyBalance: number;
  @Input("orders") orders: any;
  @Output() refresh: EventEmitter<boolean>;

  constructor(private service: MainService, private fb: FormBuilder, private datePipe: DatePipe) {
    this.targetCurrency = 'USDT';
    this.sourceCurrency = 'BTC';
    this.targetCurrencyBalance = 0;
    this.sourceCurrencyBalance = 0;
    this.refresh = new EventEmitter<boolean>();
    this.commandForm = this.fb.group({
      pair: ['BTC/USDT', [Validators.required]],
      command: ['market', [Validators.required]],
      type: ['buy', [Validators.required]],
      total: [0, [Validators.required, Validators.pattern(/([0-9]*[.])?[0-9]+/)]],
      amount: [0, [Validators.required, Validators.pattern(/([0-9]*[.])?[0-9]+/)]],
      price: [0, [Validators.required, Validators.pattern(/([0-9]*[.])?[0-9]+/)]],
    });
    this.loading = true;
  }

  ngAfterViewInit(): void {
    this.ticker(this.pair.value);
    this.service.action("balance", {}).subscribe(balance => {
      this.balances = balance;
      this.service.action("symbols", {}).subscribe(symbols => {
        this.symbols = symbols;
        this.filteredOptions = this.pair.valueChanges.pipe(startWith(''), map((value: any) => this._filter(value)));
      }, error => {
        this.service.openSnackBar("Error :" + error);
      }, () => {
        this.refreshSourceBalance(this.pair.value);
        this.loading = false;
      });
    }, error => {
      this.service.openSnackBar("Error :" + error);
      this.loading = false;
    }, () => {
    });
  }

  get pair(): any {
    return this.commandForm.controls.pair;
  }

  set pair(data: string) {
    this.commandForm.controls.pair.setValue(data);
  }

  get amount(): any {
    return this.commandForm.controls.amount;
  }

  set amount(data: number) {
    this.commandForm.controls.amount.setValue(data);
  }

  get price(): any {
    return this.commandForm.controls.price;
  }

  set price(data: number) {
    this.commandForm.controls.price.setValue(data);
  }


  ticker(symbol: string) {
    this.loading = true;
    this.service.action("ticker", {


      "symbol": symbol
    }).subscribe(ticker => {
      this.price = ticker['close'];
    }, error => {
    }, () => {
      this.loading = false;
    })
  }

  select(symbol: string): void {
    this.sourceCurrency = symbol.split("/")[0];
    this.targetCurrency = symbol.split("/")[1];
    this.ticker(symbol);
    this.refreshSourceBalance(symbol);
    console.log(this.sourceCurrencyBalance);
    this.service.symbol.next(symbol);
  }

  refreshSourceBalance(symbol: string): void {
    const orders = this.orders.filter((x: Trade) => x.ticker.trim() == symbol);
    if (orders.length == 1)
      this.sourceCurrencyBalance = orders[0].amount;
    else if (orders.length == 0) {
      this.sourceCurrencyBalance = 0;
    } else
      this.sourceCurrencyBalance = orders.filter((x: Trade) => x.state == 0 || x.state == 1).reduce((a: number, b: Trade) => a + parseFloat(b.amount), 0);
  }


  percentage(percentage: any, type: any, total: any) {
    let balance = 0;
    if (type == 'buy') {
      balance = this.balances ? this.balances[this.pair?.value.split('/')[1]] : 0;
      this.amount = percentage * balance;
      total.value = this.amount.value;
      this.amount = this.amount.value / this.price.value;
    } else {
      this.amount = this.sourceCurrencyBalance * percentage;
      total.value = this.amount.value * this.price.value;
    }
  }


  change(event: any, total: any): void {
    total.value = this.amount.value * this.price.value;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.symbols.filter((option: string) => option.toLowerCase().includes(filterValue));
  }

  onSubmit(): void {
    this.loading = true;


    if (this.amount.value * this.price.value > 0) {
      const trade = new Trade();
      trade.amount = this.commandForm.value.amount;
      trade.command = this.commandForm.value.type + "_" + this.commandForm.value.command;
      trade.creationDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy h:mm:ss');
      trade.price = this.commandForm.value.price;
      trade.ticker = this.commandForm.value.pair;
      this.service.action("create_order", trade).subscribe(response => {
        if (response.code == 200) {
          this.refresh.emit(true);
        } else {
          this.service.openSnackBar("Error :" + response.message);
        }
      }, error => {
        this.service.openSnackBar("Error :" + error);
        this.loading = false;
      }, () => {
        this.loading = false;
      })
    } else {
      this.loading = false;
      this.service.openSnackBar("Error : amount must be superior to 0 " + this.targetCurrency);
    }

  }
}
