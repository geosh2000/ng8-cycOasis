import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ApiService, InitService } from '../../services/service.index';

import * as moment from 'moment-timezone';
declare var jQuery:any;

@Component({
  selector: 'app-pya-exception',
  templateUrl: './pya-exception.component.html',
  styles: []
})
export class PyaExceptionComponent implements OnInit {

  @Output() save = new EventEmitter<any>()

  asesor:any
  name:any
  fecha:any = 'NA'

  types:any
  existent:any

  tipo:boolean = false
  showAllTypes:boolean = false
  flagDel:boolean = false
  loading:Object = {}

  tipoExc:any
  caso:any
  notas:any
  changed:any
  lu:any

  currentUser:any

  constructor(public _api: ApiService, private _init:InitService) {
    this.currentUser = this._init.getUserInfo()
  }

  build( asesor, name, fecha, showAll ){
    this.reset() 

    this.showAllTypes = showAll
    this.asesor = asesor
    this.name = name
    this.fecha = fecha

    this.existent = null
    this.tipo = false
    this.getExistent( )
  }

  ngOnInit() {
  }

  reset(){
    this.caso = ''
    this.tipoExc = ''
    this.notas = ''
    this.changed = null
    this.lu = null
    this.flagDel = false
  }

  refresh( event ){
    this.reset()

    this.getTypes( event )
  }

  printTime( date, format ){
    return moment( date ).format(format)
  }

  getTypes( type ){
    this.loading['types'] = true

    this._api.restfulGet( `${type}/${this.showAllTypes}`, 'Asistencia/tiposExc' )
              .subscribe( res => {

                this.loading['types'] = false
                this.types = res['data']

              }, err => {
                console.log('ERROR', err)

                this.loading['types'] = false

                let error = err.error
                this.save.emit({
                  asesor: this.asesor,
                  fecha:  this.fecha,
                  status: false,
                  msg:    error.msg
                })
                console.error(err.statusText, error.msg)

              })
  }

  getExistent(){
    this.loading['existent'] = true

    this._api.restfulGet( `${this.asesor}/${this.fecha}`, 'Asistencia/registeredExc')
              .subscribe( res => {

                this.loading['existent'] = false

                if( res['exc'] > 0 ){
                  this.existent = res['data']

                  if( res['exc'] == 1 ){
                    this.showAllTypes = true
                    this.tipo = true
                  }else{
                    this.tipo = false
                  }

                  this.tipoExc = res['data']['tipo']
                  this.caso = res['data']['caso']
                  this.notas = res['data']['Nota']
                  this.changed = res['data']['changed']
                  this.lu = res['data']['Last_Update']

                  this.getTypes( this.tipo )

                }else{
                  this.getTypes( false )
                }

              }, err => {

                this.loading['existent'] = false
                let error = err.error
                this.save.emit({
                  asesor: this.asesor,
                  fecha:  this.fecha,
                  status: false,
                  error: err
                })
                console.error(err.statusText, error.msg)
              })
  }

  prepareForm(){
    let tipo = 'tipo', caso = null, nota = 'Nota'

    if( this.tipo ){
        tipo = 'ausentismo'
        nota = 'comments'
    }

    if( this.caso != null && this.caso.trim() != '' ){
      caso = this.caso.trim()
    }

    let form = {
      changed_by: this.currentUser.hcInfo.id,
      [tipo]    : this.tipoExc,
      Fecha     : this.fecha,
      asesor    : this.asesor,
      caso      : caso,
      [nota]    : this.notas
    }

    let params = {tipo: this.tipo, form: form}

    return params
  }

  saveExc(){

    let params = this.prepareForm()

    this.loading['save'] = true

    this._api.restfulPut( params, 'Asistencia/saveExc' )
            .subscribe( res => {

              this.loading['save'] = false
              this.save.emit({
                asesor: this.asesor,
                fecha:  this.fecha,
                status: true,
                error : res
              })
              jQuery('#pyaExceptModal').modal('hide')

            }, err => {
              this.loading['save'] = false

              let error = err.error
              this.save.emit({
                asesor: this.asesor,
                fecha:  this.fecha,
                status: false,
                error:    err
              })
              console.error(err.statusText, error.msg)
              jQuery('#pyaExceptModal').modal('hide')
            })
  }

  caseReq(){

    if( this.tipo ){
      return false
    }

    let optSel = jQuery('#selectType option:selected').text()

    if( optSel.match(/(?:([jJ])ustificado)/g) ){
      return true
    }else{
      return false
    }

  }

  confirmDel(){
    this.flagDel = true
  }

  delete( flag = true){
    if( flag ){
      let params = this.prepareForm()

      this.loading['delete'] = true

      this._api.restfulPut( params, 'Asistencia/excDelete' )
              .subscribe( res => {

                this.loading['delete'] = false
                this.save.emit({
                  asesor: this.asesor,
                  fecha:  this.fecha,
                  status: true,
                  error : res
                })
                jQuery('#pyaExceptModal').modal('hide')

              }, err => {
                this.loading['delete'] = false

                let error = err.error
                this.save.emit({
                  asesor: this.asesor,
                  fecha:  this.fecha,
                  status: false,
                  error:    err
                })
                console.error(err.statusText, error.msg)
                jQuery('#pyaExceptModal').modal('hide')
              })
    }else{
      this.flagDel = false
    }
  }

}
