import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-det-contrato',
  templateUrl: './det-contrato.component.html',
  styles: []
})
export class DetContratoComponent implements OnChanges {

  @Input() asesor:any
  @Input() time:any
  @Output() error = new EventEmitter<any>()
  @Output() reload = new EventEmitter<any>()
  @Output() showEval = new EventEmitter<any>()

  loading:Object = {}
  data:Object = {}
  contratos:any = []
  solicitudes:any
  bajaTipo:boolean = false
  evalModal:Object = {}

  constructor(public _api: ApiService,
              public toastr: ToastrService,
              public _init:InitService) {

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  getData(){
    this.loading['data'] = true

    console.log('contratos', this.asesor)

    this._api.restfulGet( this.asesor,'DetalleAsesores/contrato' )
              .subscribe( res => {

                this.loading['data'] = false
                this.data = res['data']['actual']
                this.contratos = res['data']['contratos']
                this.solicitudes = res['pendientes']

              }, err => {
                console.log('ERROR', err)

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
      this.reload.emit( true )
    }
    this.getData()
  }

  printOld(years, months, days){
    let m = parseInt(months) - (parseInt(years)*12)

    if( parseInt(years) > 0 ){
      return `${years} ${ parseInt(years) > 0 ? 'años' : 'año' } ${ m > 0 ? m : ''}${ m > 1 ? ' meses' : m > 1 ? ' mes' : ''}`
    }else{
      if( m > 3 ){
        return `${m} meses`
      }else{
        return `${days} ${ parseInt(days) > 1 ? 'dias' : 'día'}`
      }
    }
  }

  saved( flag ){
    if(flag){
        this.toastr.success('Guardado', 'Guardado')
    }
  }

}
