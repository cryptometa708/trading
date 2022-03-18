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
import {MainService} from "../../../services/main.service";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {Trade} from "../../../models/Trade";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-history',
  template: `
      <table mat-table [dataSource]="orderHistory" class="mat-elevation-z8">

          <!--- Note that these columns can be defined in any order.
                The actual rendered columns are set as a property on the row definition" -->
          <!-- Position Column -->
          <ng-container matColumnDef="Date">
              <th mat-header-cell *matHeaderCellDef> Date</th>
              <td mat-cell *matCellDef="let element"> {{element.executionDate}} </td>
          </ng-container>
          <!-- Position Column -->
          <ng-container matColumnDef="Pair">
              <th mat-header-cell *matHeaderCellDef> Pair</th>
              <td mat-cell *matCellDef="let element"> {{element.ticker}} </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="Amount">
              <th mat-header-cell *matHeaderCellDef> Amount</th>
              <td mat-cell *matCellDef="let element"> {{element.amount}} </td>
          </ng-container>
          <!-- Weight Column -->
          <ng-container matColumnDef="Price">
              <th mat-header-cell *matHeaderCellDef> Price</th>
              <td mat-cell *matCellDef="let element"> {{element.price}} </td>
          </ng-container>
          <!-- Weight Column -->
          <ng-container matColumnDef="PNL">
              <th mat-header-cell *matHeaderCellDef> PNL</th>
              <td mat-cell *matCellDef="let element" [innerHTML]="roe(element)"></td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>`,
  styles: [`
      .mat-elevation-z8 {
          width: 100%;
      }

      button {
          margin: 5px;
      }`]
})
export class HistoryComponent implements AfterViewInit, OnChanges {
  displayedColumns: string[];
  @Input('orders') orders: any;
  @ViewChild(MatTable) table: any;
  orderHistory: MatTableDataSource<Trade>;
  @ViewChild(MatPaginator) paginator: any;

  constructor() {
    this.orderHistory = new MatTableDataSource<Trade>([]);
    this.displayedColumns = ['Date', 'Pair', 'Amount', 'Price', 'PNL'];
  }

  ngAfterViewInit(): void {
    this.orderHistory = new MatTableDataSource<Trade>(this.orders.filter((x: Trade) => x.state == 2));
    this.orderHistory.paginator = this.paginator;
  }

  roe(element: any) {
    const size = element.amount * element.price;

    const pnl = Math.round(element.pnl* 10) / 10;
    const roe = Math.round((size + pnl) / size * 10) / 10;
    return pnl > 0 ? `<p class="greenoo">${pnl} (${roe} %)</p>` : `<p class="redoo">${pnl} (${roe} %)</p>`;

  }

  ngOnChanges() {
    this.orders = this.orders.filter((x: Trade) => x.state == 2);
    this.orderHistory = new MatTableDataSource<Trade>(this.orders);
    this.orderHistory.paginator = this.paginator;
  }

}
