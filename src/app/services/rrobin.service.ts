import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class RrobinService {


  loading = false
  st = false

  constructor( private _api:ApiService ) {
    this.checkStatus()
  }

  checkStatus(){

    this.loading = true

    this._api.restfulPut( null, 'Rrobin/checkStatus' )
                .subscribe( res => {

                  this.loading = false
                  this.st = res['data']['status'] == '1' ? true : false

                }, err => {
                  this.loading = false
                  const error = err.error;
                  console.error(err.statusText, error.msg);

                });

    // setTimeout( () => this.checkStatus() , 10000 )
  }

}
