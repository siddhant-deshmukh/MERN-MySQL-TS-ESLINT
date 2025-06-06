import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  show(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError in some cases
    setTimeout(() => this.loadingSubject.next(true));
  }

  hide(): void {
    setTimeout(() => this.loadingSubject.next(false));
  }
}