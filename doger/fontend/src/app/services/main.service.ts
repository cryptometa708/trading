import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';

import {environment} from "../../environments/environment";
import {DTO} from "../models/DTO";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Exchange} from "../models/Exchange";

@Injectable({
  providedIn: 'root'
})
export class MainService {
  symbol: BehaviorSubject<string> = new BehaviorSubject('BTC/USDT');
  private currentDTO: Observable<DTO>;
  public currentDTOSubject: BehaviorSubject<DTO>;

  constructor(private http: HttpClient, private route: Router, private snackBar: MatSnackBar) {
    const storage = JSON.parse(<string>localStorage.getItem('dto')) || new DTO();
    this.currentDTOSubject = new BehaviorSubject<DTO>(storage);
    this.currentDTO = this.currentDTOSubject.asObservable();
  }

  public get currentDTOValue(): DTO {
    return this.currentDTOSubject.value;
  }

  public get defaultExchange(): Exchange {
    return this.currentDTOValue.exchanges.filter((exchange: Exchange) => exchange.main)[0] || null;
  }


  public action(action: string, data: any): Observable<any> {
    data.userId = this.currentDTOValue?.user?.id;
    data.exchangeId = this.defaultExchange?.id;
    return this.http.post<any>(`${environment.apiUrl}?action=${action}`, data).pipe(catchError(this.errorHandler));
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'close', {
      duration: 2000,
    });
  }

  makeid(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }


  errorHandler(error: string): Observable<never> {
    return throwError('Une erreur s\'est produite lors de la tentative de traitement de votre demande.');
  }

  logout(): void {
    const dto: DTO = new DTO();
    this.currentDTOSubject.next(dto);
    localStorage.setItem('dto', JSON.stringify(dto));
    this.route.navigate(['logout']);
  }
}
