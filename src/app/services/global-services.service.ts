import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class GlobalServicesService {

  monitorDisplay = new Subject<boolean>();

  constructor() {
    this.monitorDisplay.next(false)
  }

  displayMonitor( flag ){
    this.monitorDisplay.next(flag)
  }

  getMonitorStatus(): Observable<any>{
    return this.monitorDisplay.asObservable();
  }



}
