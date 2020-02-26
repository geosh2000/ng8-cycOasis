import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { ConfigService } from './configuration.service';
import { ApiService, InitService, TokenCheckService } from 'src/app/services/service.index';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { RsvPaymentRegistryComponent } from '../rsv-payment-registry/rsv-payment-registry.component';
import { RsvLinkAnyPaymentComponent } from '../rsv-link-any-payment/rsv-link-any-payment.component';

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
  selector: 'app-rsv-payment-list',
  templateUrl: './rsv-payment-list.component.html',
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
      background-color: #e00f0f;
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
export class RsvPaymentListComponent implements OnInit {

  @ViewChild(RsvPaymentRegistryComponent,{static:false}) _regP:RsvPaymentRegistryComponent;
  @ViewChild(RsvLinkAnyPaymentComponent,{static:false}) _linkP:RsvLinkAnyPaymentComponent;

  currentUser: any
  showContents = false
  searchFlag = false
  mainCredential = 'rsv_manage'

  loading:Object = {}
  data:any = []

  search:Object = {
    searchString: ''
  }

  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  inicio: any;
  fin: any;

  config:any
  columns:any = [
    { type: 'default', key: 'operacion', title: 'Operacion' },
    { type: 'prov', key: 'proveedor', title: 'Proveedor' },
    { type: 'default', key: 'tipo', title: 'Tipo' },
    { type: 'default', key: 'complejo', title: 'Complejo' },
    { type: 'ticket', key: 'ticket', title: 'ticket' },
    { type: 'money', key: 'monto', title: 'Monto'},
    { type: 'default', key: 'moneda', title: 'Mon' },
    { type: 'ref', key: 'referencia', title: 'Ref.' },
    { type: 'default', key: 'aut', title: 'Aut.' },
    { type: 'date', key: 'dtCreated', title: 'F. Pago' },
    { type: 'default', key: 'accountId', title: 'Id Cuenta' },
    // { type: 'default', key: 'j', title: 'Jrs' },
    // { type: 'default', key: 'm', title: 'Mnrs' },
    { type: 'default', key: 'clientName', title: 'Titular Cuenta' },
    { type: 'button', key: 'view', title: 'Ver' }
  ]

  constructor(public _api: ApiService,
              private titleService: Title,
              public _init:InitService,
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
    this.titleService.setTitle('CyC - RSV Listado de pagos');
    this.config = ConfigService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true
    this.config['threeWaySort'] = true
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


    this._api.restfulPut( this.search, 'Rsv/listPaymentsV2' )
                .subscribe( res => {

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
    return moment(e).format(f)
  }

  linked(e){
    this._linkP.closeModal()
    this.searchLocs()
  }

  toggle(key: string, v: any): void {
    this.config[key] = v;
    this.config = { ...this.config };
  }
}
