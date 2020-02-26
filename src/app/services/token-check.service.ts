import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';



@Injectable()
export class TokenCheckService {

  private subject = new Subject<any>();

  sendTokenStatus( status:boolean ){
    this.subject.next({ status })
  }

  getTokenStatus(): Observable<any>{
    return this.subject.asObservable();
  }

  constructor(  ) { }

}
