import {AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit, Renderer2} from '@angular/core';
import {MainService} from "../../services/main.service";
import {Trade} from "../../models/Trade";
import {DOCUMENT} from "@angular/common";

declare const TradingView: any;

@Component({
  selector: 'app-tv',
  template: `
      <div id="technical-analysis" [ngClass]="{'hidden':loading}"></div>`,
  styles: [`#technical-analysis {
      height: 100%;
      width: 100%;
  }

  .hidden {
      display: none;
  }`]
})
export class TvComponent implements AfterViewInit {

  loading: boolean;

  constructor(private service: MainService, private cdr: ChangeDetectorRef) {
    this.loading = true;
  }

  ngAfterViewInit(): void {
    this.service.symbol.subscribe((symbol) => {
      new TradingView.widget({
        'container_id': 'technical-analysis',
        'autosize': true,
        'symbol': `${this.service.defaultExchange.exchange}:${symbol.replace("/", "")}`.toUpperCase(),
        'interval': '1440',
        'timezone': 'exchange',
        'theme': 'Light',
        'style': '1',
        'toolbar_bg': '#f1f3f6',
        'withdateranges': true,
        'hide_side_toolbar': false,
        'allow_symbol_change': true,
        'save_image': true,
        'hideideas': true,
        'show_popup_button': true,
        'popup_width': '1000',
        'popup_height': '650'
      });
      this.loading = false;
    }, error => {
      this.service.openSnackBar("Error :" + error);
      this.loading = false;
    }, () => {
    });
    this.cdr.detectChanges();
  }
}
