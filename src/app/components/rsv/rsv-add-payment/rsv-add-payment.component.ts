import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';

@Component({
  selector: 'app-rsv-add-payment',
  templateUrl: './rsv-add-payment.component.html',
  styles: [`.mat-radio-button ~ .mat-radio-button {
    margin-left: 16px;
  }`]
})
export class RsvAddPaymentComponent implements OnInit {

// tslint:disable-next-line: no-output-native
  @Output() close = new EventEmitter<any>()

  item:Object = {}
  master:any = []

  params:Object = {
    items: [],
    referencia: '',
    countItems: 0,
    original: {},
    montos: {}
  }

  loading:Object = {}

  constructor( public _api: ApiService,
               public _init: InitService,
               public toastr: ToastrService ) { }

  ngOnInit() {
  }

  closeModal( reload = false ){
    this.close.emit( reload )
    jQuery('#rsvAddPayment').modal('hide')
  }

  openModal(a: any, i: string | number){
    this.params = {
      items: [],
      referencia: '',
      countItems: 0,
      original: {},
      montos: {}
    }

    this.master = JSON.parse(JSON.stringify(a))
    this.item = this.master[i]
    jQuery('#rsvAddPayment').modal('show')
  }

  chgCheck(x, e){

    let i = this.params['items'].indexOf(this.master[x]['masterItemLocator'])
    if ( i >= 0 ){
      if ( !e['checked'] ){
        this.params['items'].splice( i , 1 )
      }
    }else{
      this.params['items'].push(this.master[x]['masterItemLocator'])
    }

    this.params['items'].sort()
    this.params['referencia'] = ''
    this.params['montoTotalItems'] = 0
    this.params['countItems'] = this.params['items'].length
    let ind = 0

    for( let it of this.master ){
      if( this.params['items'].indexOf(it['masterItemLocator']) >= 0 ){
        if( ind != 0 ){
          this.params['referencia'] += ','
        }
        this.params['referencia'] += it['masterItemLocator']
        ind++

        this.params['montoTotalItems'] = parseFloat(this.params['montoTotalItems']) + (Math.round((parseFloat(it['monto']) - (parseFloat(it['montoPendiente']) + parseFloat(it['montoPagado']))) * 100) / 100)
        this.params['montoNocheItems'] = parseFloat(this.params['montoNocheItems']) + (Math.round(parseFloat(it['monto']) / parseInt(it['noches']) * 100) / 100)
        this.params['moneda'] = it['mon']
        this.params['original']['pi_' + it['masterItemLocator']] = Math.round((parseFloat(it['monto']) - (parseFloat(it['montoPendiente']) + parseFloat(it['montoPagado']))) * 100) / 100
        this.params['original']['pn_' + it['masterItemLocator']] = Math.round(parseFloat(it['monto']) / parseInt(it['noches']) * 100) / 100
      }
    }

    if( this.params['ptype'] && this.params['ptype'] != null ){
      this.autoPay(this.params['ptype'], this.params['monto'])
    }


  }

  autoPay( t, e? ){
    this.params['ptype'] = t
    this.params['montos'] = {}

    switch( t ){
      case 'all':
        this.params['monto'] = Math.round(parseFloat(this.params['montoTotalItems']) * 100) / 100
        for ( let i of this.params['items'] ){
          this.params['montos'][i] =  parseFloat(this.params['original']['pi_' + i])
        }
        break
      case 'night':
        this.params['monto'] = 0
        for ( let i of this.params['items'] ){
          this.params['montos'][i] =  parseFloat(this.params['original']['pn_' + i])
          this.params['monto'] += this.params['montos'][i]
        }
        this.params['monto'] = Math.round(this.params['monto'] * 100) / 100
        break
      case 'custom':
        let monto = e.target['valueAsNumber']

        if ( monto > Math.round(parseFloat(this.params['montoTotalItems']) * 100) / 100 ){
          this.autoPay('all')
          return
        }

        let pi = Math.round(monto / this.params['items'].length * 100) / 100
        let r = 0
        for ( let i of this.params['items'] ){
          if (  pi > parseFloat(this.params['original']['pi_' + i])  ){
            this.params['montos'][i] = parseFloat(this.params['original']['pi_' + i])
            r += (pi - parseFloat(this.params['original']['pi_' + i]))
          }else{
            this.params['montos'][i] = pi
          }
        }

        while ( r > 0 ){
          r = this.distributeAmmount( this.params['items'], r )
          console.log(r)
        }
        break
    }
  }

  distributeAmmount( arr, m ){

    let r = 0
    let pi = Math.round(m / this.params['items'].length * 100) / 100
    for ( let i of arr ){
      if ( this.params['montos'][i] + pi > parseFloat(this.params['original']['pi_' + i])  ){
        r += ((this.params['montos'][i] + pi) - parseFloat(this.params['original']['pi_' + i]))
        this.params['montos'][i] = Math.round(parseFloat(this.params['original']['pi_' + i]) * 100) / 100
      }else{
        this.params['montos'][i] += pi
        this.params['montos'][i] = Math.round(this.params['montos'][i] * 100) / 100
      }
    }

    return Math.round(r * 100) / 100
  }

  savePayment(){
    let status = this.validate()

    if (status['status']){
      this.sendPayment()
    }else{
      this.toastr.error( status['msg'], 'ERROR' )
    }

  }

  validate(){
    if ( this.params['items'].length == 0 ){
      return {status: false, msg: 'Debes elegir al menos un ítem'}
    }

    if ( !this.params['paymentType'] ){
      return {status: false, msg: 'Debes elegir un método de pago'}
    }

    if ( !this.params['paymentType'] ){
      return {status: false, msg: 'Debes elegir un método de pago'}
    }

    if ( !this.params['monto'] || this.params['monto'] == 0 ){
      return {status: false, msg: 'El monto debe ser mayor a 0'}
    }

    return {status: true}

  }

  sendPayment(){

    this.loading['save'] = true;

    let params = {
      items: [],
      payment: {
        paymentType: this.params['paymentType'],
        monto:  this.params['monto'],
        moneda: this.params['moneda'],
        referencia: this.params['referencia'],
        link: this.params['link'],
        itemsIncluded: this.params['countItems'],
        createdBy: this._init.currentUser['hcInfo']['id']
      }
    }

    for( let i of this.params['items'] ){
      let arr = {
        masterItemLocator: i,
        monto: this.params['montos'][i]
      }

      params['items'].push(arr)
    }

    this._api.restfulPut( params, 'Rsv/addPayment' )
                .subscribe( res => {

                  this.loading['save'] = false;

                  if( res['data'] ){
                    this.toastr.success( res['msg'], 'Guardado' )
                    this.closeModal( true )
                  }


                }, err => {
                  this.loading['save'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  checkSaldo( i ){
    return parseFloat(i['monto']) > (parseFloat(i['montoPendiente']) + parseFloat(i['montoPagado']))
  }

}
