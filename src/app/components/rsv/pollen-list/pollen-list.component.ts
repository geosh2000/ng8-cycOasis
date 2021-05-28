import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';
import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from 'src/app/services/service.index';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { CieloChangesComponent } from '../../cielo/cielo-changes/cielo-changes.component';

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
  selector: 'app-pollen-list',
  templateUrl: './pollen-list.component.html',
  providers: [NgbDatepickerConfig],
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
    .acc-headers .mat-expansion-panel-header-title,
    .acc-headers .mat-expansion-panel-header-description {
      flex-basis: 0;
    }

    .mat-radio-button ~ .mat-radio-button {
      margin-left: 16px;
    }
    .mat-success {
      background-color: #33a933;
      color: #fff;
    }
    .mat-alert {
      background-color: #e2be0c;
      color: #fff;
    }
    .mat-info {
      background-color: #34a3b5;
      color: #fff;
    }
    .mat-pdt {
      background-color: #72658c;
      color: #fff;
    }

    .mat-danger {
      background-color: #9c1414;
      color: #fff;
    }

    mat-accordion{
      width: 100% !important;
      max-width: 780px
    }

    .acc-headers .mat-expansion-panel-header-description {
      justify-content: space-between;
      align-items: center;
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
  .form-group {
    margin-bottom: -10px;
  }
  `]
})
export class PollenListComponent implements OnInit {

  @ViewChild(CieloChangesComponent,{static:false}) _cg:CieloChangesComponent;

  currentUser: any
  showContents = false
  searchFlag = false
  byEvent = false
  mainCredential = 'pollen_manage'

  loading:Object = {}
  data:any = []

  search:Object = {
    searchString: '',
    noXld: false
  }

  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  inicio: any;
  fin: any;
  eventos:any = []

  changesParams = {
    fechas: true,
    adultos: true,
    huespedes: true,
    nombres: true 
  }

  config:EasyTableServiceService
  columns:any = [
    { type: 'default', key: 'rsva', title: 'Rsva' },
    { type: 'default', key: 'voucher', title: 'Voucher' },
    { type: 'default', key: 'hotel', title: 'Hotel' },
    { type: 'default', key: 'habName', title: 'Cat.' },
    { type: 'default', key: 'adultos', title: 'Occupancy' },
    // { type: 'default', key: 'mdo', title: 'Mdo' },
    // { type: 'default', key: 'agencia', title: 'Agencia' },
    { type: 'default', key: 'grupo', title: 'Group' },
    // { type: 'nr', key: 'isNR', title: 'NR' },
    // { type: 'validate', key: 'pagoValidado', title: 'NrValid' },
    { type: 'npropio', key: 'nombre', title: 'Names', width: 350 },
    { type: 'date', key: 'llegada', title: 'Start' },
    { type: 'date', key: 'salida', title: 'End' },
    { type: 'default', key: 'noches', title: 'Nights' },
    // { type: 'ocup', key: 'a', title: 'Ocup' },
    // { type: 'default', key: 'j', title: 'Jrs' },
    // { type: 'default', key: 'm', title: 'Mnrs' },
    // { type: 'money', key: 'total', title: 'Total' },
    // { type: 'default', key: 'mon', title: 'Curr.' },
    // { type: 'pago', key: 'prefix', title: 'Pago' },
    { type: 'default', key: 'grupo', title: 'Event' },
    { type: 'default', key: 'notas', title: 'Notes' },
    { type: 'default', key: 'hab', title: 'Room ' },
    { type: 'default', key: 'bedType', title: 'BedType' },
    { type: 'conf', key: 'e', title: 'Status Rsva' },
    // { type: 'desplazo', key: 'desplazo_o', title: 'Desplazo' },
    // { type: 'date', key: 'dtCreated', title: 'Creacion' },
    // { type: 'default', key: 'asesor', title: 'Creador' }
  ]

  constructor(public _api: ApiService,
              private titleService: Title,
              public _init:InitService,
              public _tz:ZonaHorariaService,
              private _tokenCheck:TokenCheckService,
              public toastr: ToastrService ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
      .subscribe( res => {

        if( res['status'] ){
          this.showContents = this._init.checkCredential( this.mainCredential, true )
        }else{
          this.showContents = false
          jQuery('#loginModal').modal('show');
        }
    })

  }
  ngOnInit() {
    this.titleService.setTitle('CyC - RSV Listado');
    this.config = EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true
    this.config['searchEnabled'] = true
  }

  changeItem( i ){
    this._cg.open( i )
  }

  getDif( i ){
    if( parseFloat(i['montoMXN']) + parseFloat(i['montoUSD']) == 0 ){
      return true
    }else{
      return false
    }
  }

  getEventos( f ) {

    if( !f ){ return false }
    this.loading['eventos'] = true;


    this._api.restfulGet( '', 'Lists/gruposTarifaConcert' )
                .subscribe( res => {

                  this.loading['eventos'] = false;
                  this.eventos = res['data']

                }, err => {
                  this.loading['eventos'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getTableConfig(){
    this._api.restfulGet( this.search, 'Rsv/tableConfig' )
                .subscribe( res => {

                  this.columns = res['data']

                }, err => {
                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  isToday( date ) {
    if ( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ) {
      return 'bg-success text-light';
    }
  }

  onDateSelection(date: NgbDateStruct, el, tp ) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.search[tp + '_inicio'] = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
      jQuery('#' + tp).val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
    } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals({ one: date, two: this.fromDate }))) {
      this.toDate = date;
      this.search[tp + '_fin'] = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
      jQuery('#' + tp).val(`${moment(this.search[tp + '_inicio']).format('DD/MM')} a ${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')}`);
      el.close();
      // this.getAsistencia()
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.search[tp + '_inicio'] = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
      jQuery('#' + tp).val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
      this.search[tp + '_fin'] = null;
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals({ one: date, two: this.fromDate });
  isTo = date => equals({ one: date, two: this.toDate });

  onSelected( item ){
    this.search['asesor'] = item.asesor
  }

  searchLocs() {

    this.loading['locs'] = true;


    this._api.restfulPut( this.search, 'Rsv/listPollen' )
                .subscribe( res => {

                  console.log(res['data'])

                  this.loading['locs'] = false;
                  this.searchFlag = true
                  this.data = res['data']['items']

                }, err => {
                  this.loading['locs'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatDate( e, f ){
    // return e
    return moment(e).format(f)
  }

  isVigente(e){
    let m = moment.tz(e, this._tz.defaultZone).tz(this._tz.zone)

    return m > moment()
  }

}
