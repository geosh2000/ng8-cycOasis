import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InitService, ApiService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment-timezone';
declare var jQuery: any;

@Component({
  selector: 'app-edit-prepay',
  templateUrl: './edit-prepay.component.html',
  styleUrls: ['./edit-prepay.component.css']
})
export class EditPrepayComponent implements OnInit {

  @Input() i:Object = {}
  @Output() saveMonto = new EventEmitter()

  loading:Object = {}
  editFlag = false
  editTotalFlag = false
  sfFlag = false
  selectedRefound = true
  advancedTotal = false
  bufferedParams = {}

  constructor(public _api: ApiService,
              public _init: InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  editMonto( m ){

    if( this.i['isNR'] == '1' && !this._init.checkSingleCredential('rsv_cancelAll') && moment().format('YYYY-MM-DD') != moment(this.i['llegada']).format('YYYY-MM-DD') ){
      this.toastr.error('No es posible modificar el monto a prepagar de una reserva "No Reembolsable". El prepago debe hacerse al 100%', 'ERROR!')
      return false
    }

    if( this.i['itemType'] != '1' ){
      this.toastr.error('Este servicio no permite realizar un pago parcial. El prepago debe hacerse al 100%', 'ERROR!')
      return false
    }

    let params = {
      original: this.i,
      new: {
        montoParcial: m.value
      },
      itemId: this.i['itemId']
    }

    this.saveMontos( params )
  }

  editTotalMonto( m, c, adv = false ){

    console.log(m)
    console.log(c)

    // return false

    let params = {
      original: this.i,
      newMonto: m,
      comment: c
    }

    if( parseFloat(params['newMonto']) < parseFloat(this.i['montoPagado']) ){
      
      // Ajuste permitido solo a administrador
      if( this._init.checkSingleCredential('allmighty')){
        
        this.advancedTotal = true
        
        if( !adv ){
          this.bufferedParams = params
          return false
        }else{
          params['isR'] =  !this.selectedRefound
        }

      }else{
              this.toastr.error('El monto pagado es mayor al monto total indicado. Esta operación no es válida', 'Error!')
              return false
      }
    }

    this.loading['editTotalMonto'] = true

    this._api.restfulPut( params, 'Rsv/editMontoTotal' )
                .subscribe( res => {

                  this.loading['editTotalMonto'] = false;
                  this.i['montoOriginal'] = this.i['monto']
                  this.i['montoParcialOriginal'] = this.i['montoParcial']
                  this.i['monto'] = params['newMonto']
                  this.editTotalFlag = false
                  this.advancedTotal = false
                  this.bufferedParams = {}
                  this.saveMonto.emit( {itemId: this.i['itemId'], isMontoTotal: true, newMonto: params['newMonto'], montoParcial: res['data']['montoParcial'], montoPagado: res['data']['montoPagado']} )

                }, err => {
                  this.loading['editTotalMonto'] = false;
                  this.advancedTotal = false
                  this.bufferedParams = {}

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  saveMontos( e ){
    this.loading['editMonto'] = true

    this._api.restfulPut( e, 'Rsv/editMontoParcial' )
                .subscribe( res => {

                  this.loading['editMonto'] = false;
                  this.i['montoParcialOriginal'] = this.i['montoParcial']
                  this.i['montoParcial'] = e['new']['montoParcial']
                  this.saveMonto.emit( res['data'] )
                  this.editFlag = false

                }, err => {
                  this.loading['editMonto'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  setFree(i, v){
    this.loading['editMonto'] = true

    this._api.restfulPut( {item: i, relates: v.value}, 'Rsv/setFree' )
                .subscribe( res => {

                  this.loading['editMonto'] = false;
                  this.i['isFree'] = 1
                  this.i['isQuote'] = 0
                  this.i['montoPagado'] = this.i['monto']
                  this.saveMonto.emit( res['data'] )
                  this.editFlag = false
                  this.sfFlag = false

                }, err => {
                  this.loading['editMonto'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}
