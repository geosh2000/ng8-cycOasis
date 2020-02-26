import { Component, OnChanges, Input, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

import * as moment from 'moment';
declare var jQuery:any;

import { ApiService } from '../../services/service.index';

@Component({
  selector: 'app-add-contrato',
  templateUrl: './add-contrato.component.html',
  styles: [`
    .custom-day {
      text-align: center;
      padding: 0.185rem 0.25rem;
      display: inline-block;
      height: 2rem;
      width: 2rem;
    }
    .custom-day.focused {
      background-color: #e6e6e6;
    }
    .custom-day.range, .custom-day:hover {
      background-color: rgb(2, 117, 216);
      color: white;
    }
    .custom-day.faded {
      background-color: rgba(2, 117, 216, 0.5);
    }
  `]
})
export class AddContratoComponent implements OnChanges {

  @Input() asesor:any
  @Input() contratos:any = []
  @Input() modal:any
  @Input() nombre:any

  @Output() error = new EventEmitter<any>()
  @Output() save = new EventEmitter<any>()
  @Output() showEval = new EventEmitter<any>()

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct

  submitting:boolean = false
  currentUser:any

  saveAlert:boolean = false
  addForm:boolean = false
  errorMsg:string = ''

  evalModal:Object = {}

  formData:Object = {
    thisActive: true
  }
  originalActive:any
  delete:any = ''

  loading:Object = {}

  constructor(
                private _api:ApiService, calendar: NgbCalendar
                ){

  }

  ngOnChanges() {
    this.build()
    this.formData['thisActive'] = true
    this.delete = ''
  }

  setValDP(date: NgbDateStruct, field){
    this.formData[field] = moment({year: date['year'], month: date['month']-1, day: date['day']}).format('YYYY-MM-DD')
    if(field == 'inicio'){
      this.formData['fin'] = ''
    }
  }

  build(){
    for( let item of this.contratos ){
      if( parseInt(item['activo']) ){
        this.formData['activo'] = item['id']
        this.originalActive = item['id']
      }
    }
  }

  onDateSelection(date: NgbDateStruct ) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date
      this.formData['inicio'] = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date
      this.formData['fin'] = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.formData['inicio'] = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      this.formData['fin'] = null
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  submit(){
    this.submitting = true

    this._api.restfulGet( this.formData, 'SolicitudBC/addContrato' )
              .subscribe( res => {

                this.submitting = false
                this.save.emit({form: this.modal, status: true})
                jQuery(this.modal).modal('hide')
                this.formData = {}

              }, err => {
                console.log('ERROR', err)

                this.submitting = false

                let error = err.error
                this.error.emit({code: err.statusText, msg: err.msg})
                console.error(err.statusText, error.msg)

              })
  }

  chgActive( id, original ){
    this.loading['active'] = true

    this._api.restfulGet( `${this.asesor}/${id}`, 'SolicitudBC/contrato_chgActive' )
              .subscribe( res => {

                this.loading['active'] = false
                this.save.emit({toastrOff: true, status: true})
                this.delete=''

              }, err => {
                console.log('ERROR', err)

                this.loading['active'] = false
                this.formData['activo'] = original

                let error = err.error
                this.error.emit({code: err.statusText, msg: `${error.msg} -> ${error.error.message}`})
                console.error(err.statusText, error.msg)

              })
  }

  confDelete( id ){
    this.loading['delete'] = true

    this._api.restfulGet( id, 'SolicitudBC/contrato_delete' )
              .subscribe( res => {

                this.loading['delete'] = false
                this.save.emit({status: true})
                this.delete=''

              }, err => {
                console.log('ERROR', err)

                this.loading['delete'] = false

                let error = err.error
                this.error.emit({code: err.statusText, msg: `${error.msg} -> ${error.error.message}`})
                console.error(err.statusText, error.msg)

              })
  }

  printDate(date, format){
    return moment(date).format(format)
  }

  inputChg( id ){
    this.chgActive( id, this.originalActive )
  }

  close(){
    jQuery(this.modal).modal('hide')
  }

  addContract(){
    this.loading['add'] = true

    let params = {
      asesor: this.asesor,
      tipo: this.formData['tipo'] ? 2 : 1,
      inicio: this.formData['inicio'],
      activo: this.formData['thisActive'] ? 1 : 0
    }

    if( !this.formData['tipo'] ){
      params['fin'] = this.formData['fin']
    }

    this._api.restfulPut( params, 'SolicitudBC/contrato_add' )
              .subscribe( res => {

                this.loading['add'] = false
                this.save.emit({status: true})
                this.delete=''
                this.addForm=false

              }, err => {
                console.log('ERROR', err)

                this.loading['add'] = false

                let error = err.error
                this.error.emit({code: err.statusText, msg: `${error.msg} -> ${error.error.message}`})
                console.error(err.statusText, error.msg)

              })
  }

  evalText( status, clFlag = false ){

    if( !clFlag ){
      switch( status ){
        case '1':
        case '5':
          return 'Ev: Renovar (sf)'
        case '2':
          return 'Ev: No Ren (en rev)'
        case '3':
          return 'Ev: Renovar (rev sup)'
        case '4':
          return 'Ev: No Renovar'
        case '6':
          return 'Ev: Renovar (firmado)'
      }
    }else{
      switch( status ){
        case '1':
        case '5':
          return 'btn-warning'
        case '2':
          return 'btn-danger'
        case '3':
          return 'btn-warning'
        case '4':
          return 'btn-danger'
        case '6':
          return 'btn-success'
      }
    }
  }

  openEval( asesorId, contrato, nombre, status, newFlag = false, asesor = false ){

    let manager = false, sup = false

    let evalModal = {
      asesor: asesorId,
      contrato: contrato,
      nombre: nombre,
      manager: manager,
      agent: asesor,
      superReview: sup,
      new: newFlag,
      status: status,
      readOnly: true,
      openTime: new Date()
    }
    jQuery('#editContratos').modal('hide')
    this.showEval.emit( evalModal )

  }

}
