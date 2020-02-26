import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-det-dias-pendientes',
  templateUrl: './det-dias-pendientes.component.html',
  styles: []
})
export class DetDiasPendientesComponent implements OnChanges {

  @Input() asesor:any
  @Input() curAsesor:any
  @Input() time:any
  @Output() error = new EventEmitter<any>()
  @Output() reload = new EventEmitter<any>()

  loading:Object = {}
  deleteItem:Object = {}
  activo:any
  dataHistorial:any = []
  detalleHistorial:any = []
  dataSolicitudes:Object = {}
  contratos:Object = {}

  detail:Object = {
    Nombre: null,
    asesor: null,
    data: null
  }

  detailData:Object = {
    hx: null,
    dt: null,
    sp: null
  }

  constructor(public _api: ApiService,
              public toastr: ToastrService,
              public _init:InitService) {

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.asesor){
      this.detailed(this.asesor)
      this.getAllList(this.asesor)
    }
  }

  getData(){
    if(this.asesor){
      this.detailed(this.asesor)
      this.getAllList(this.asesor)
    }
  }

  replaceStr( text ){
    return text.replace( /_/gm, ' ')
  }

  getAllList( asesor ){
    this.loading['list'] = asesor ? false : true
    this.loading['detail'] = asesor ? true : false

    this._api.restfulGet( asesor ? asesor : '', 'Diaspendientes/getSummary' )
              .subscribe( res => {

                this.loading['list'] = false
                this.loading['detail'] = false

                console.log(res['data'])

                if( asesor ){
                  this.detail['data'] = res['data']
                  this.detail['Nombre'] = res['data']['Nombre']
                  this.detail['asesor'] = res['data']['asesor']

                }

                console.log(this.detail)

              }, err => {
                console.log('ERROR', err)

                this.loading['list'] = false
                this.loading['detail'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  detailed( asesor ){
    this.loading['detailed'] = true

    this._api.restfulGet( asesor, 'Diaspendientes/detail' )
              .subscribe( res => {

                this.loading['detailed'] = false
                this.detailData = res['data']

              }, err => {
                console.log('ERROR', err)

                this.loading['detailed'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
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


