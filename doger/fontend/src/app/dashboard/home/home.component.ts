import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {MainService} from "../../services/main.service";
import {environment} from "../../../environments/environment";
import {Router} from "@angular/router";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {concatMap, switchMap, takeUntil} from "rxjs/operators";
import {BehaviorSubject, Subject, timer} from "rxjs";
import {Trade} from "../../models/Trade";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

  public orders: Trade[];
  public loading = true;
  private destroyed = new Subject<void>();
  public currentScreenSize: any;
  displayNameMap: any;
  tradesSubscriber: any;
  public positionsSize: number;
  public openOrdersSize: number;

  constructor(private service: MainService, private router: Router, private breakpointObserver: BreakpointObserver, private cdr: ChangeDetectorRef) {
    this.orders = [];
    this.positionsSize = 0;
    this.openOrdersSize = 0;
    //for responsive design
    this.displayNameMap = new Map([
      [Breakpoints.XSmall, 'col-xs'],
      [Breakpoints.Small, 'col-xs'],
      [Breakpoints.Medium, 'col-sm'],
      [Breakpoints.Large, 'col-lg'],
      [Breakpoints.XLarge, 'col-lg'],
    ]);
    breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.currentScreenSize = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }


  ngAfterViewInit() {
    this.loading = true;
    this.pollingForStatus();
    this.fetchTrades();
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  pollingForStatus(): void {
    const load$ = new BehaviorSubject('');
    const polledForStatue$ = load$.pipe(
      switchMap(_ => timer(0, 10000).pipe(concatMap(_ => this.service.action("trades", {})))));

    polledForStatue$.subscribe((trades) => {
      this.orders = trades;
    }, error => {
      this.service.openSnackBar(`Error : ${error} when get information`);
    }, () => this.loading = false);
  }

  fetchTrades(): void {
    this.tradesSubscriber = this.service.action("trades", {}).subscribe(response => {
      this.orders = response;
    }, error => {
      this.service.openSnackBar("Error :" + error);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  refresh(state: boolean) {
    if (state)
      this.fetchTrades();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    this.tradesSubscriber?.unsubscribe();
  }
}
