import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-rsv-payment-registry',
  templateUrl: './rsv-payment-registry.component.html',
  styles: [`.mat-radio-button ~ .mat-radio-button {
    margin-left: 16px;
  }`]
})
export class RsvPaymentRegistryComponent implements OnInit {

  // tslint:disable-next-line: no-output-native
  @Output() close = new EventEmitter<any>()

  item:Object = {}
  master:any = []

  newPayment:FormGroup

  params:Object = {
    complejo: null,
    proveedor: null,
    referencia: null,
    operacion: null,
    aut: null,
    monto: null,
    moneda: null
  }

  errors:Object = {}

  loading:Object = {}

  constructor( public _api: ApiService,
               public _init: InitService,
               public toastr: ToastrService ) { 

    this.newPayment =  new FormGroup({
      ['complejo']:    new FormControl('', [ Validators.required ]),
      ['proveedor']:   new FormControl('', [ Validators.required ]),
      ['referencia']:  new FormControl('', [ Validators.required ]),
      ['operacion']:   new FormControl('', [ Validators.required ]),
      ['aut']:         new FormControl('', [ Validators.required ]),
      ['monto']:       new FormControl('', [ Validators.required ]),
      ['moneda']:      new FormControl('', [ Validators.required ]),
      ['tipo']:        new FormControl('', [ Validators.required ]),
      ['afiliacion']:  new FormControl('', [ Validators.required ]),
      ['tarjeta']:     new FormControl('Virtual', [ Validators.required ]),
      ['tipoTarjeta']: new FormControl('VIRTUAL', [ Validators.required ])
    })
  }

  ngOnInit() {
  }

  closeModal( reload = false ){
    this.close.emit( reload )
    jQuery('#rsvRegPayment').modal('hide')
  }

  openModal(){
    this.newPayment.reset()
    this.newPayment.controls['tarjeta'].setValue('Virtual')
    this.newPayment.controls['tipoTarjeta'].setValue('VIRTUAL')

    jQuery('#rsvRegPayment').modal('show')
  }

  chg(p, e){

    switch(p){
      case 'complejo':
        this.newPayment.controls['afiliacion'].setValue(`${this.newPayment.controls['proveedor'].value == 'Paypal' ? 'PP' : this.newPayment.controls['proveedor'].value == 'Tpv' ? 'TPV' : 'DP'}_${e.value}`)
        break
      case 'proveedor':
        this.newPayment.controls['tipo'].setValue(e.value)
        break
    }


  }

  savePayment(){
    this.sendPayment()
  }


  sendPayment(){

    this.loading['save'] = true;

    this._api.restfulPut( this.newPayment.value, 'Rsv/regPayment' )
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


}
