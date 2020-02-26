import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-rsv-link-payment',
  templateUrl: './rsv-link-payment.component.html',
  styles: [`
            .mat-radio-button ~ .mat-radio-button {
              margin-left: 16px;
            }
            .mat-success {
              background-color: #33a933;
              color: #fff;
            }
            .mat-alert {
              background-color: #e2be0c;
              color: #fff;
            }`]
})
export class RsvLinkPaymentComponent implements OnInit {

  @Input() item
  @Input() pLinks:any = 0
  @Output() linked = new EventEmitter<any>()

  loading:Object = {}
  data:any = []

  flagWarn:Object = {}
  flagDelete:boolean = false

  constructor( public _api: ApiService,
               public _init: InitService,
               public toastr: ToastrService ) { }

  ngOnInit() {
  }

  tabChange( e ){
    if( e.index == 1 ){
      this.getLinks()
    }
  }

  getLinks( l = this.item['masterItemLocator'] ){

    this.loading['links'] = true;

    this._api.restfulGet( `${l}/${this.item['tipoPago']}`, 'Rsv/getLinks' )
                .subscribe( res => {

                  this.loading['links'] = false;
                  this.data = res['data']

                }, err => {
                  this.loading['links'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  linkPayment( p, f ){
    if( !f ){
      this.flagWarn[p['operacion']] = true
      return
    }else{
      this.flagWarn[p['operacion']] = false
    }

    let params = {
      link: {
        paymentId: p['paymentId'] == this.item['id'] ? null : this.item['id']
      },
      operacion: p['operacion'],
      last_id: this.item['id'],
      unset: p['paymentId']
    }

    this.loading['linking'] = true;

    this._api.restfulPut( params, 'Rsv/linkPayment' )
                .subscribe( res => {

                  this.loading['linking'] = false;
                  this.linked.emit( true )

                }, err => {
                  this.loading['linking'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  delete(id){
    this.loading['deleting'] = true;

    let params = {
      id
    }

    this._api.restfulPut( params, 'Rsv/deletePayment' )
                .subscribe( res => {

                  this.loading['deleting'] = false;
                  this.flagDelete = true
                  this.linked.emit( true )

                }, err => {
                  this.loading['deleting'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }
  

}
