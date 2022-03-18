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
  selector: 'app-open',
  template: `
      <table mat-table [dataSource]="openOrders" class="mat-elevation-z8">

          <!--- Note that these columns can be defined in any order.
                The actual rendered columns are set as a property on the row definition" -->
          <!-- Position Column -->
          <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date</th>
              <td mat-cell *matCellDef="let element"> {{element.creationDate}} </td>
          </ng-container>
          <!-- Position Column -->
          <ng-container matColumnDef="pair">
              <th mat-header-cell *matHeaderCellDef> Pair</th>
              <td mat-cell *matCellDef="let element"> {{element.ticker}} </td>
          </ng-container>

          <!-- Position Column -->
          <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef> Type</th>
              <td mat-cell *matCellDef="let element"> {{element.command.replace("_", ' ')}} </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="size">
              <th mat-header-cell *matHeaderCellDef> size</th>
              <td mat-cell *matCellDef="let element"> {{element.amount}} </td>
          </ng-container>
          <!-- Weight Column -->
          <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef> price</th>
              <td mat-cell *matCellDef="let element"> {{element.price}} </td>
          </ng-container>


          <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions</th>
              <td mat-cell *matCellDef="let element;let j = index;">
                  <button (click)="delete(element.id , j)" mat-raised-button color="warn">Cancel</button>
              </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
      <app-loading *ngIf="loading"></app-loading>`,
  styles: [`
      .mat-elevation-z8 {
          width: 100%;
      }

      button {
          margin: 5px;
      }`]
})
export class OpenComponent implements AfterViewInit, OnChanges {
  public displayedColumns: string[];
  @Input('orders') orders: any;

  @ViewChild(MatTable) table: any;
  @ViewChild(MatPaginator) paginator: any;
  public openOrders: MatTableDataSource<Trade>;
  @Output() size: EventEmitter<number>;
  public loading: boolean;

  constructor(private service: MainService) {
    this.size = new EventEmitter<number>();
    this.openOrders = new MatTableDataSource<Trade>([]);
    this.displayedColumns = ['date', 'pair', 'type', 'size', 'price', 'actions'];
    this.loading = false;
  }

  ngAfterViewInit(): void {
    this.ngOnChanges();
  }

  delete(id: any, row: number): void {
    this.loading = true;
    this.service.action("cancel_order", {id: id}).subscribe(response => {
      if (response.code == 200) {
        this.service.openSnackBar("You've cancel the order");
        this.openOrders.data.splice(row, 1);
        this.openOrders = new MatTableDataSource<Trade>(this.openOrders.data);
        setTimeout(() => {
          this.openOrders.paginator = this.paginator;
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

  ngOnChanges() {
    this.orders = this.orders.filter((x: Trade) => x.state == 0);
    this.size.emit(this.orders.length);
    this.openOrders = new MatTableDataSource<Trade>(this.orders);
    this.openOrders.paginator = this.paginator;
  }


}
