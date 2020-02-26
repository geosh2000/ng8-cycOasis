import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-det-salario',
  templateUrl: './det-salario.component.html',
  styles: []
})
export class DetSalarioComponent implements OnChanges {

  @Input() asesor:any
  @Output() error = new EventEmitter<any>()

  loading:Object = {}
  data:Object = {}
  contratos:Object = {}

  constructor(public _api: ApiService,
              public toastr: ToastrService,
              private _init:InitService) {

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  getData(){
    this.loading['data'] = true

    this._api.restfulGet( this.asesor,'DetalleAsesores/contrato' )
              .subscribe( res => {

                this.loading['data'] = false
                this.data = res['data']['actual']
                this.contratos = res['data']['contratos']

              }, err => {
                console.log("ERROR", err)

                this.loading['data'] = false
                let error = err.error
                this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                console.error(err.statusText, error.msg)

              })
  }

  printDate(date, format){
    return date ? moment.tz(date, 'this._zh.defaultZone').tz('America/Bogota').format(format) : '-'
  }

  err( data ){
    this.toastr.error(data.msg, data.code)
  }

  succ( data ){
    if( !data.toastrOff ){
      this.toastr.success( 'Solicitud guardada correctamente', 'Guardado!')
    }
    this.getData()
  }

}
