import { Component, Injectable, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewContainerRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { AddAusentismoComponent } from '../../../formularios/add-ausentismo.component';
import { PyaExceptionComponent } from '../../../formularios/pya-exception.component';

import { ApiService, InitService, TokenCheckService } from '../../../../services/service.index';

declare var jQuery:any;
import * as moment from 'moment-timezone';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<any> {

  fromModel(date: string): NgbDateStruct {

    let tmp = new Date(parseInt(moment(date).format('YYYY')), parseInt(moment(date).format('MM')), parseInt(moment(date).format('DD')))

    return (date && tmp.getFullYear) ? {year: tmp.getFullYear(), month: tmp.getMonth(), day: tmp.getDate()} : null;
  }

  toModel(date: NgbDateStruct): string {
    // return date ? new Date(date) : null;
    return date ? moment({year: date.year, month: date.month - 1, day:date.day}).format('YYYY-MM-DD') : null;
  }
}

@Component({
  selector: 'app-det-horario',
  templateUrl: './det-horario.component.html',
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
  `],
  // providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class DetHorarioComponent implements OnChanges {

  @Input() asesor:any
  @Input() time:any
  @Input() inicio:any = moment().subtract(3,'days').format('YYYY-MM-DD')
  @Input() fin:any = moment().add(3,'days').format('YYYY-MM-DD')

  @Output() error = new EventEmitter<any>()
  @Output() reload = new EventEmitter<any>()

  loading:Object = {}
  dataHorarios:any
  datesData:any

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct

  showOpts:Object = {
    ch_jornada:   true,
    ch_comida:    true,
    ch_excep:     true,
    ch_excep_p:    false,
    ch_ret:       true,
    ch_sa:        true,
    ch_x:        true,
    ch_x_p:        false,
    ch_pdv:        true,
    sh_p:        true,
    sh_d:        true
  }

  constructor(public _api: ApiService,
              public toastr: ToastrService,
              public _init:InitService) {

    if(this.asesor){
      this.getAsistencia()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getAsistencia()
  }

  formatDate(datetime, format){
    let time = moment.tz(datetime, 'this._zh.defaultZone')
    let cunTime = time.clone().tz('America/Bogota')

    return cunTime.format(format)
  }


  getAsistencia(){

      let params = `0/${this.inicio}/${this.fin}/${this.asesor}`
      this.loading['horarios'] = true

      this._api.restfulGet( params,'Asistencia/pyaV2' )
                .subscribe( res => {

                  this.loading['horarios'] = false
                  this.dataHorarios = res['array']['array']

                  let dates:any = []
                  for(let i = moment(this.inicio); i<=moment(this.fin); i = i.add(1,'days')){
                    dates.push( i.format('YYYY-MM-DD') )
                  }

                  this.datesData = dates
                  // console.log(res.array)
                  // console.log(this.datesData)

                }, err => {
                  console.log('ERROR', err)
                  this.loading['horarios'] = false

                  let error = err.error
                  this.error.emit( {msg: error.msg, status: err.status, text: err.statusText} )
                  console.error(err.statusText, error.msg)

                })


  }

  hxSave( event ){
    if( event.status ){
      this.toastr.success(`${ event.msg }`, 'Success!');
    }else{
      this.toastr.error(`${ event.msg }`, 'Error!');
    }
  }

  isToday( date ){
    if( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
      return 'bg-success text-light'
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
    } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals(date, this.fromDate))) {
      this.toDate = date
      this.fin = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a ${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')}`)
      el.close()
      this.getAsistencia()
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.inicio = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#picker').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
      this.fin = null
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

}
