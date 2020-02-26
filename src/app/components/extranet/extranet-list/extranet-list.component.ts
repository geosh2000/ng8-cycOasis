import { Component, OnInit, Injectable, ViewChild, OnDestroy } from '@angular/core';
import { EasyTableServiceService } from '../../../services/easy-table-service.service';
import { ApiService, InitService, TokenCheckService } from 'src/app/services/service.index';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { ExtPapeletaComponent } from '../ext-papeleta.component';

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
  selector: 'app-extranet-list',
  templateUrl: './extranet-list.component.html',
  providers: [NgbDatepickerConfig],
  styleUrls: ['./extranet-list.component.css']
})
export class ExtranetListComponent implements OnInit, OnDestroy {

  @ViewChild(ExtPapeletaComponent, {static: false}) _ext:ExtPapeletaComponent

  currentUser: any
  showContents = false
  searchFlag = false
  mainCredential = 'rsv_extranet'
  paperItem:any = ''

  loading:Object = {}
  data:any = []

  search:Object = {
    searchString: '',
    activas: true
  }

  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  inicio: any;
  fin: any;

  config:EasyTableServiceService
  columns:any = [
    { type: 'default', key: 'itemLocatorId', title: 'Loc.' },
    { type: 'default', key: 'tipoServicio', title: 'Tipo' },
    { type: 'default', key: 'categoria', title: 'Descripción' },
    { type: 'npropio', key: 'nombreCliente', title: 'Nombre' },
    { type: 'default', key: 'grupo', title: 'Grupo Tfa' },
    { type: 'date', key: 'llegada', title: 'Inicio' },
    { type: 'date', key: 'salida', title: 'Fin' },
    { type: 'money', key: 'monto', title: 'Monto' },
    { type: 'default', key: 'confirmation', title: 'Conf' },
    { type: 'default', key: 'confirmUser', title: 'Usuario' },
    { type: 'date', key: 'confirmDate', title: 'Fecha Confirm.' },
    { type: 'pick', key: 'dtPickUpIn', title: 'PickUp Set' },
    { type: 'default', key: 'creador', title: 'Creador' },
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
    this.titleService.setTitle('CyC - RSV Listado');
    this.config = EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true
  }

  ngOnDestroy(){
    jQuery('#viewPaper').modal('hide')
  }

  getDif( i ){
    if( parseFloat(i['montoMXN']) + parseFloat(i['montoUSD']) == 0 ){
      return true
    }else{
      return false
    }
  }

  getTableConfig(){
    this._api.restfulGet( this.search, 'Rsv/getItem' )
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


    this._api.restfulPut( this.search, 'Rsv/getConfirmList' )
                .subscribe( res => {

                  console.log(res['data'])

                  this.loading['locs'] = false;
                  this.searchFlag = true
                  this.data = res['data']
                }, err => {
                  this.loading['locs'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatDate( e, f ){
    if( e == null ){
      return null
    }
    return moment(e).format(f)
  }

  pickUpColor( r ){
    if( r['salida'] == null ){
      if( r['dtPickUpIn'] != null ){
        return 'success'
      }else{
        return 'alert'
      }
    }else{
      if( r['dtPickUpIn'] != null && r['dtPickUpOut'] != null ){
        return 'success'
      }else{
        return 'alert'
      }
    }
  }

  pickUpTxt( r ){
    if( r['salida'] == null ){
      if( r['dtPickUpIn'] != null ){
        return '1 - 1'
      }else{
        return '0 - 1'
      }
    }else{
      if( r['dtPickUpIn'] != null && r['dtPickUpOut'] != null ){
        return '2 - 2'
      }else{
        if( r['dtPickUpIn'] == null && r['dtPickUpOut'] == null ){
          return '0- 2'
        }else{
          return '1 - 2'
        }
      }
    }
  }

  viewPaper( r ){
    this.paperItem = r['itemLocatorId']
    this._ext.getLoc(this.paperItem)
    jQuery('#viewPaper').modal('show')
  }


}
