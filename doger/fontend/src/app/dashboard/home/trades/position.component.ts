import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Trade} from "../../../models/Trade";
import {MatPaginator} from "@angular/material/paginator";
import {MainService} from "../../../services/main.service";

@Component({
  selector: 'app-position',
  template: `
      <table mat-table [dataSource]="positions" class="mat-elevation-z8">

          <!--- Note that these columns can be defined in any order.
                The actual rendered columns are set as a property on the row definition" -->

          <!-- Position Column -->
          <ng-container matColumnDef="symbol">
              <th mat-header-cell *matHeaderCellDef> symbol</th>
              <td mat-cell *matCellDef="let element"> {{element.ticker}} </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="size">
              <th mat-header-cell *matHeaderCellDef> size</th>
              <td mat-cell *matCellDef="let element"> {{element.amount}} </td>
          </ng-container>
          <!-- Weight Column -->
          <ng-container matColumnDef="entry_price">
              <th mat-header-cell *matHeaderCellDef> entry price</th>
              <td mat-cell *matCellDef="let element"> {{element.price}} </td>
          </ng-container>
          <!-- Weight Column -->
          <ng-container matColumnDef="current_price">
              <th mat-header-cell *matHeaderCellDef> current price</th>
              <td mat-cell
                  *matCellDef="let element" [innerHTML]="price(element)"></td>
          </ng-container>

          <!-- Symbol Column -->
          <ng-container matColumnDef="pnl">
              <th mat-header-cell *matHeaderCellDef> PNL(ROE %)</th>
              <td mat-cell *matCellDef="let element" [innerHTML]="pnlROE(element)"></td>
          </ng-container>

          <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions</th>
              <td mat-cell *matCellDef="let element;let j = index;">
                  <button (click)="close(element.id , j)" mat-raised-button color="primary">Close</button>
              </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>`,
  styles: [`
      .mat-elevation-z8 {
          width: 100%;
      }`]
})
export class PositionComponent implements AfterViewInit, OnChanges {
  displayedColumns: string[];
  @Input('orders') orders: any = [];
  public positions: MatTableDataSource<Trade>;
  public loading: boolean;
  @ViewChild(MatPaginator) paginator: any;
  @Output() size: EventEmitter<number>;

  currentPrices: any;

  constructor(private service: MainService) {
    this.currentPrices = [];
    this.size = new EventEmitter<number>();
    this.positions = new MatTableDataSource<Trade>([]);
    this.displayedColumns = ['symbol', 'size', 'entry_price', 'current_price', 'pnl', 'actions'];
    this.loading = false;
  }

  ngAfterViewInit(): void {
    this.ngOnChanges();
    this.service.action("tickers", {symbols: this.orders.map((trade: Trade) => trade.ticker)})
  }

  ngOnChanges(): void {
    this.orders = this.orders.filter((x: Trade) => x.state == 1);
    this.size.emit(this.orders.length);
    this.positions = new MatTableDataSource<Trade>(this.orders);
    this.positions.paginator = this.paginator;
    this.service.action("tickers", {symbols: this.orders.map((trade: Trade) => trade.ticker)}).subscribe(response => {
      this.currentPrices = response;
    })
  }

  price(element: any) {
    const currentPrice = this.currentPrices[element.ticker];
    const price = element.price;
    if (currentPrice) {
      return currentPrice > price ? `<p class="greenoo">${currentPrice}</p>` : `<p class="redoo">${currentPrice}</p>`;
    }
    return '0';
  }

  pnlROE(element: any) {
    const currentPrice = this.currentPrices[element.ticker];
    const amount = element.amount;
    const price = element.price;
    const pnl = Math.round(amount * (currentPrice - price) * 10) / 10;
    const roe = Math.round((currentPrice - price) / price * 1000) / 10;
    if (currentPrice && amount && currentPrice) {
      return pnl > 0 ? `<p class="greenoo">${pnl} (${roe} %)</p>` : `<p class="redoo">${pnl} (${roe} %)</p>`;
    }
    return '0 (0%)';

  }

  close(id: any, row: number): void {
    this.loading = true;
    this.service.action("close_order", {id: id}).subscribe(next => {
      if (next.code == 200) {
        this.service.openSnackBar("You've closed your order");
        this.positions.data.splice(row, 1);
        this.positions = new MatTableDataSource<Trade>(this.positions.data);
        setTimeout(() => {
          this.positions.paginator = this.paginator;
        });
      } else {
        this.service.openSnackBar("Error : There is an error with the cancel action");
      }
    }, error => {
      this.service.openSnackBar("Error :" + error);
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }
}
