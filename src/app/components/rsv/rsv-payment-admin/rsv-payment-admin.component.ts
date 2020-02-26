import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-rsv-payment-admin',
  templateUrl: './rsv-payment-admin.component.html',
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
export class RsvPaymentAdminComponent implements OnInit {

// tslint:disable-next-line: no-output-native
  @Output() close = new EventEmitter<any>()
  @Output() linkedPayment = new EventEmitter<any>()

  item:Object = {}
  loading:Object = {}
  dataPayment:any = []
  pLinks = 0

  constructor( public _api: ApiService,
               public _init: InitService,
               public toastr: ToastrService ) { }

  ngOnInit() {
  }

  closeModal( reload = false ){
    this.close.emit( reload )
    jQuery('#rsvPaymentAdmin').modal('hide')
    this.dataPayment = []
    this.pLinks = 0
  }

  openModal( item ){
    this.item = item
    this.getPayments( item )
    jQuery('#rsvPaymentAdmin').modal('show')
  }

  getPayments( loc ){

    this.loading['payments'] = true;

    this._api.restfulGet( loc, 'Rsv/getPayments' )
                .subscribe( res => {

                  this.loading['payments'] = false;
                  this.dataPayment = res['data']
                  this.pLinks = res['ligas']

                }, err => {
                  this.loading['payments'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  copyLink( i ){
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = i;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  linked(e){
    this.close.emit(e)
  }

}
