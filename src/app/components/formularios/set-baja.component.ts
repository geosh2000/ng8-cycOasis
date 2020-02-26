import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, OnChanges, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';
declare var jQuery:any;

import { ApiService } from '../../services/service.index';


@Component({
  selector: 'app-set-baja',
  templateUrl: './set-baja.component.html',
  styles: []
})
export class SetBajaComponent implements OnChanges {

  @Input() asesor:any
  @Input() modal:any
  @Input() tipo:boolean
  @Input() nombre:any

  @Output() closeDialog = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @Output() error = new EventEmitter<any>()

  formSetBaja:FormGroup;
  confirmReemp:boolean = false

  bajaData:any
  titleSubmit:string

  parentModal:string
  retrieving:boolean = false
  saveAlert:boolean = false
  errorMsg:string = ""


  constructor(
              private _api:ApiService
              ) {


      this.formSetBaja = new FormGroup({
        tipo: new FormControl(this.tipo, [ Validators.required ]),
        id: new FormControl('', [ Validators.required ]),
        fechaBaja: new FormControl('', [ Validators.required ] ),
        comentarios: new FormControl('', [ Validators.required ] ),
        recontratable: new FormControl('indeterminate', [ this.checkChange ]),
        reemplazable: new FormControl('indeterminate', [ this.checkChange ]),
        fechaLiberacion: new FormControl('')
      })

      //reemplazable
      this.formSetBaja.get('reemplazable').valueChanges.subscribe( res => {

        if(res){
           this.formSetBaja.get('fechaLiberacion').setValidators(
             [ Validators.required, this.lessFechaLiberacion.bind( this.formSetBaja ) ]
          )
          this.formSetBaja.get('fechaLiberacion').setValue(this.formSetBaja.controls['fechaBaja'].value)
        }else{
          this.formSetBaja.get('fechaLiberacion').setValue("")
          this.formSetBaja.get('fechaLiberacion').setValidators(
            []
         )
        }

        this.formSetBaja.get('fechaLiberacion').updateValueAndValidity();
      })

      this.titleSubmit = this.tipo ? 'Registrar' : 'Solicitar'
  }

  ngOnChanges() {
    this.buildForm()
  }

  closeModal(){

    if(this.parentModal == null || this.parentModal == ''){
      jQuery("#form_setBaja").modal('hide')
    }else{
      this.closeDialog.emit("#form_setBaja")
    }


  }

  setVal( val, control ){
    this.formSetBaja.controls[control].setValue( val.format("YYYY-MM-DD") )
    console.log('trig')
  }

  resetForm(){
    this.formSetBaja.reset(this.bajaData)
  }

  //Validación Fecha Liberación
  lessFechaLiberacion( control: FormControl ): { [s:string]:boolean }{

    let formSetBaja:any = this

    if( moment(`${control.value}`) > moment(`${formSetBaja.controls['fechaBaja'].value}`) ){
      return {
        lessFechaLiberacion: true
      }
    }else{
      return null
    }

  }

  //Validación Check
  checkChange( control: FormControl ): { [s:string]:boolean }{

    if( !control.dirty ){
      return {
        indeterminate: true
      }
    }else{
      return null
    }

  }

  buildForm(){

    this.bajaData = {
      tipo:             this.tipo ? 'else' : 'ask',
      id:               this.asesor,
      fechaBaja:        '',
      comentarios:      '',
      reemplazable:     'indeterminate',
      fechaLiberacion:  ''
    }

    this.formSetBaja.reset(this.bajaData)
  }


  setValDP(date: NgbDateStruct, field){
    this.formSetBaja.controls[field].setValue(moment({year: date['year'], month: date['month']-1, day: date['day']}).format('YYYY-MM-DD'))
  }

  submitBaja(){
    this.confirmReemp = false
    // console.log("sending")
    this.retrieving = true
    let api:string

    if(this.formSetBaja.controls['tipo'].value == 'ask' ){
      api = "SolicitudBC/baja_solicitud"
    }else{
      api = "SolicitudBC/baja_set"
    }

    this._api.restfulPut( this.formSetBaja.value, api)
      .subscribe( res => {

        this.retrieving = false
        this.save.emit({form: this.modal, status: true})
          jQuery(this.modal).modal('hide')
          this.resetForm()

      }, err => {
        console.log('ERROR', err)

        this.retrieving = false

        this.error.emit({code: 'ERROR', msg: err.error.msg})

      })

  }


}
