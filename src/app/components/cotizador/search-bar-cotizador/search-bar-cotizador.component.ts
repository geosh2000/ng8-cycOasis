import { Component, OnInit, Injectable, Output, EventEmitter, Input } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';
import { ToastrModule, ToastrService } from 'ngx-toastr';

const equals = ({ one, two }: { one: NgbDateStruct; two: NgbDateStruct; }) => {
  return one && two && two.year == one.year && two.month == one.month && two.day == one.day;
};
const before = (one: NgbDateStruct, two: NgbDateStruct) => {
// tslint:disable-next-line: max-line-length
  return !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
};
const after = (one: NgbDateStruct, two: NgbDateStruct) => {
// tslint:disable-next-line: max-line-length
  return !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;
};

@Injectable()
export class NgbDateNativeAdapter extends NgbDateAdapter<any> {

  fromModel(date: string): NgbDateStruct {

    const tmp = new Date(parseInt(moment(date).format('YYYY')), parseInt(moment(date).format('MM')), parseInt(moment(date).format('DD')));

    return (date && tmp.getFullYear) ? {year: tmp.getFullYear(), month: tmp.getMonth(), day: tmp.getDate()} : null;
  }

  toModel(date: NgbDateStruct): string {
    // return date ? new Date(date) : null;
    return date ? moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD') : null;
  }
}

@Component({
  selector: 'app-search-bar-cotizador',
  templateUrl: './search-bar-cotizador.component.html',
  providers: [NgbDatepickerConfig],
  styles: [`
    .exp-height {
      height: auto !important;
      padding: 6px !important;
    }
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
    .acc-headers .mat-expansion-panel-header-title,
    .acc-headers .mat-expansion-panel-header-description {
      flex-basis: 0;
    }

    mat-accordion{
      width: 100% !important;
      max-width: 780px
    }

    .mat-radio-button ~ .mat-radio-button {
      margin-left: 16px;
    }

    .acc-headers .mat-expansion-panel-header-description {
      justify-content: space-between;
      align-items: center;
    }

    .mat-l3 {
      background-color: #bb9e11;
      color: white;
    }
    .mat-l4 {
      background-color: #b360bd;
      color: white;
    }

    mat-form-field {
      margin-right: 12px;
    }
    .lineNd {
      border-bottom: 1px solid red;
      -webkit-transform:
          translateY(20px)
          translateX(5px)
          rotate(-26deg);
      position: absolute;
      top: -33px;
      left: -13px;
  }

  ul.uib-datepicker-popup.dropdown-menu.ng-scope { z-index: 1090 !important; }

  .ngb-dp-month {
    pointer-events: none;
    background: aliceblue!important;
  }
  `]
})
export class SearchBarCotizadorComponent implements OnInit {

  @Output() search = new EventEmitter<any>()
  @Input() isDate = true
  @Input() loading = false
  @Input() local = false
  @Input() group = false
  @Input() isCode = false
  @Input() groupsTfa = []
  @Input() pax = true
  @Input() paxJr = false
  @Input() endDate = false
  @Input() endDateSep = false
  @Input() timepicker = false
  @Input() maxAdultos = 50
  @Input() maxMenores = 3
  @Input() maxJuniors = 3
  @Input() minHS = '12:00 am'
  @Input() minHE = '11:59 pm'
  @Input() maxHS = '12:00 am'
  @Input() maxHE = '11:59 pm'
  @Input() agesDispl = true
  @Input() minDate:NgbDateStruct = {
    day: parseInt(moment().add(1, 'days').format('DD')),
    month: parseInt(moment().add(1, 'days').format('MM')),
    year: parseInt(moment().add(1, 'days').format('YYYY'))
  }

  pickNum:any = []
  adults:any = 1
  min:any = 0
  jr:any = 0
  moneda = true
  minA = []
  selectedCode:any = 'ccenter'
  horaInicio:any
  horaFin:any
  searchFlag = true 

  isLocal = false
  isGroup = false

  e3=0
  e2=0
  e1=0

  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  inicio: any;
  fin: any;

  constructor(public toastr: ToastrService) {
    for(let i=0; i<=50; i++){
      this.pickNum.push(i)
    }
  }

  ngOnInit() {
  }

  isToday( date ) {
    if ( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ) {
      return 'bg-success text-light';
    }
  }

  onDateSelection(date: NgbDateStruct, el, tp = 'd' ) {
    if( !this.endDate ){
      switch( tp ){
        case 'd':
            this.inicio = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
            jQuery('#picker').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM/YYYY')}`);
            if(this.timepicker){
              this.dateTimePicker(this.inicio, true)
            }
            break;
          case 'ds':
            this.fin = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
            jQuery('#pickerDs').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM/YYYY')}`);
            if(this.timepicker){
              this.dateTimePicker(this.fin, false)
            }
            break;
      }

      el.close();
    }else{
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
        this.inicio = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
      } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals({ one: date, two: this.fromDate }))) {
        this.toDate = date;
        this.fin = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment(this.inicio).format('DD/MM')} a ${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')}`);
        el.close();
        // this.getAsistencia()
      } else {
        this.toDate = null;
        this.fromDate = date;
        this.inicio = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
        this.fin = null;
      }
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals({ one: date, two: this.fromDate });
  isTo = date => equals({ one: date, two: this.toDate });

  save(){

    if( this.timepicker ){
      if( this.horaInicio == null ){
        this.toastr.error('Falta la hora!', 'Debes ingresar una hora de inicio')
        return false
      }
      if( this.endDateSep && this.horaFin == null ){
        this.toastr.error('Falta la hora!', 'Debes ingresar una hora de fin')
        return false
      }
    }

    let ageSum = []

    for( let i=0; i < this.adults; i++ ){
      ageSum.push({type: 'adult', age: '+18'})
    }

    for( let i=0; i < this.min; i++ ){
      let age = i == 0 ? this.e1 : (i == 1 ? this.e2 : this.e3)
      ageSum.push({type: 'minor', age})
    }

    let r = {
      inicio: this.horaInicio == null ? this.inicio : this.horaInicio,
      adults: this.adults,
      min: parseInt(this.min),
      jr: this.jr,
      moneda: this.moneda,
      ages: ageSum,
      isLocal: this.isLocal,
      isGroup: this.isGroup,
      selectedCode: this.selectedCode
    }

    if( this.endDate || this.endDateSep ){
      r['fin'] = this.horaFin == null ? this.fin : this.horaFin
    }

    this.search.emit(r)
  }

  reset(){
    this.adults = 1
    this.min = 0
    this.inicio = null
    jQuery('#picker').val('');
    this.e3=0
    this.e2=0
    this.e1=0
  }

  resetAges(){
    this.e3=0
    this.e2=0
    this.e1=0
  }

  dateTimePicker(e, start){
    if( start ){
      if( this.horaInicio ){
        this.horaInicio = moment(`${e} ${moment(this.horaInicio).format('HH:mm')}:00`).format('YYYY-MM-DD HH:mm:ss')
      }
    }else{
      if( this.horaFin ){
        this.horaFin = moment(`${e} ${moment(this.horaFin).format('HH:mm')}:00`).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }

  setTimePicker( e, start, v ){
    if( start ){
      this.horaInicio = moment(`${this.inicio} ${e}:00`).format('YYYY-MM-DD HH:mm:ss')
    }else{
      this.horaFin = moment(`${this.fin} ${e}:00`).format('YYYY-MM-DD HH:mm:ss')
    }
    console.log( this.horaInicio, this.horaFin)
  }


}
