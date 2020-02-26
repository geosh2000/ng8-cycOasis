import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-det-historial',
  templateUrl: './det-historial.component.html',
  styles: []
})
export class DetHistorialComponent implements OnChanges {

  @Input() asesor:any
  @Input() curAsesor:any
  @Input() time:any
  @Output() error = new EventEmitter<any>()
  @Output() reload = new EventEmitter<any>()

  loading:Object = {}
  deleteItem:Object = {}
  activo:any
  dataHistorial:Object = {}
  dataSolicitudes:Object = {}
  contratos:Object = {}

  constructor(public _api: ApiService,
              public toastr: ToastrService,
              public _init:InitService) {

    this.getData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getData()
  }

  getData(){
    this.getHistorial()
    this.getSolicitudes()
  }

  getHistorial(){
    this.loading['historial'] = true

    this._api.restfulGet( this.asesor,'DetalleAsesores/historial' )
              .subscribe( res => {

                this.loading['historial'] = false
                this.dataHistorial = res['data']

                if ( res['data'].length > 0) {
                  this.activo = res['data'][0]['activo']
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['historial'] = false
                let error = err.error
                this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                console.error(err.statusText, error.msg)

              })
  }

  getSolicitudes(){
    this.loading['solicitudes'] = true

    this._api.restfulGet( this.asesor,'DetalleAsesores/solicitudes' )
              .subscribe( res => {

                this.loading['solicitudes'] = false
                this.dataSolicitudes = res['data']
                if ( res['data'].length > 0) {
                  this.activo = res['data'][0]['activo']
                }

              }, err => {
                console.log("ERROR", err)

                this.loading['solicitudes'] = false
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

  deleteSol(){
    this.loading['delete'] = false
    this._api.restfulDelete( `${this.deleteItem['id']}/${this.deleteItem['tipo']}`, `SolicitudBC/cxl_solicitud` )
              .subscribe( res => {

                this.loading['delete'] = false
                jQuery('#confirmCancel').modal('hide')
                this.reload.emit(true)



              }, err => {
                console.log("ERROR", err)

                this.loading['delete'] = false
                let error = err.error
                this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                console.error(err.statusText, error.msg)

              })


  }

}
