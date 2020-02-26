import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class RrobinService {

  st = false

  constructor( private _api:ApiService ) {
    this.checkStatus()
  }

  checkStatus(){
    this._api.restfulPut( null, 'Rrobin/checkStatus' )
                .subscribe( res => {

                  this.st = res['data']['status'] == '1' ? true : false

                }, err => {
                  const error = err.error;
                  console.error(err.statusText, error.msg);

                });

    setTimeout( () => this.checkStatus() , 10000 )
  }

}
