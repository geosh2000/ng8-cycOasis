import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';
declare var jQuery: any;

@Component({
  selector: 'app-rsv-cancel-item',
  templateUrl: './rsv-cancel-item.component.html',
  styleUrls: ['./rsv-cancel-item.component.css']
})
export class RsvCancelItemComponent implements OnInit {

  @Output() cancelled = new EventEmitter()

  loading:Object = {}

  rlPayments:any
  cancelItemData:Object = {}
  penaltiesFlag = false
  item:Object = {}
  policies:Object = {}
  isRefound = false

  constructor(public _api: ApiService,
              public _init: InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  cancelItem( i ){
    this.item = i
    this.cancelItemData = i
    jQuery('#cancelConfirm').modal('show')
    this.getRelatedPayments( i['itemId'] )
  }

  closeCancelModal(){
    this.item = {}
    this.policies = {}
    this.cancelItemData = {}
    this.rlPayments = null
    this.penaltiesFlag = false
    this.isRefound = false
    jQuery('#cancelConfirm').modal('hide')
  }

  confirmCancel(){
    if( this.cancelItemData['isQuote'] == 1 && this.cancelItemData['isConfirmable'] == 0 ){
      this.sendCancellation( true )
    }else{
      if( this._init.currentUser.credentials['rsv_cancelAll'] != 1 ){
        // this.sendCancellation( true )
        this.toastr.error( 'La reserva ya cuenta con pagos, solicita a tu gerente realizar la cancelación', 'No es podible cancelar' )
        return false
      }

      this.penaltiesFlag = true
      this.loadPenalties( this.item )

    }
  }

  loadPenalties( i ){
    this.loading['policies'] = true

    let params = {item: i}

    this._api.restfulPut( params, 'Rsv/getXldPolicy' )
                .subscribe( res => {

                  this.loading['policies'] = false;
                  this.policies = res['data']

                }, err => {
                  this.loading['policies'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  sendCancellation( flag = false ){

    if( this.item['penalidad'] < (this.item['xldType'] != 'reembolso' ? 0 : this.item['omit10'] ? 0 : this.policies['minimumPenalty']) ){
      this.toastr.error('La tarifa de penalidad establecida es menor a la permitida por el sistema. Revisa las políticas y parámetros seleccionados', 'Penalidad Incorrecta')
      return false
    }

    if( this.item['penalidad'] > this.item['montoPagado'] ){
      this.toastr.error('La tarifa de penalidad establecida es mayor al monto pagado por este item. Por favor revisa nuevamente el monto de penalidad', 'Penalidad Incorrecta')
      return false
    }

    this.loading['cancel'] = true

    let params = {data: this.item, policies: this.policies, related: this.rlPayments, flag}

    this._api.restfulPut( params, 'Rsv/cancelItemV2' )
                .subscribe( res => {

                  this.loading['cancel'] = false;
                  this.closeCancelModal()
                  this.cancelled.emit( true )

                }, err => {
                  this.loading['cancel'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getRelatedPayments( i ){
    this.loading['rlPay'] = true

    this._api.restfulGet( `${i}/1`, 'Rsv/itemPaymentsV2' )
                .subscribe( res => {

                  this.loading['rlPay'] = false;
                  this.rlPayments = res['data']
                }, err => {
                  this.loading['rlPay'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
