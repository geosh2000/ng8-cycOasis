import { Component, OnInit, Injectable, ViewChildren, QueryList, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { OrderPipe } from 'ngx-order-pipe';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';
import { SearchHotelModuleComponent } from './search-hotel-module/search-hotel-module.component';
import { CreateRsvComponent } from './create-rsv/create-rsv.component';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import * as Globals from '../../globals';
import { Router } from '@angular/router';
import { SearchZdUserComponent } from 'src/app/shared/search-zd-user/search-zd-user.component';

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
  selector: 'app-cotizador-v2',
  templateUrl: './cotizador-v2.component.html',
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
  `]
})
export class CotizadorV2Component implements OnInit, OnDestroy {

  @Output() rsv = new EventEmitter<any>()
  @ViewChildren('fltr') _filters: QueryList<SearchHotelModuleComponent>;
  @ViewChildren('zdu') _zdUser: QueryList<SearchZdUserComponent>;
  @ViewChild(CreateRsvComponent,{static:false}) _rsv:CreateRsvComponent;

  currentUser: any;
  showContents = false;
  mainCredential = 'app_cotizador';
  loading: Object = {};

  habs = 1;

  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  inicio: any;
  fin: any;
  hotelList: Object = {};
  groupsTfa: any = [];
  resultCot: Object = {};
  selectedCode: any = 'ccenter';

  moneda = true
  searchUserFlag = true
  filterExp = true;
  dataForBudget:any

  budgetName:any
  budgetMail:any
  budgetNumber:any
  budgetZenId:any
  budgetExistTicket = false
  budgetNoEdit = true
  budgetLang = true
  linkedTicketFlag = false
  budgetTicket:any
  budgetExistingBudgets:any = []
  resTours:any = []

  lastLocCreated:any
  linkTicket:any = []
  linkedTicket:any
  flagManage = false
  flagSearchTicket = false
  updateTicket:Object = {ticket: ''}
  lTicket = ''

  constructor(public _api: ApiService,
              private nbConfig: NgbDatepickerConfig,
              private route: Router,
              public _init: InitService,
              private titleService: Title,
              private _tokenCheck: TokenCheckService,
              private orderPipe: OrderPipe,
              private sanitization:DomSanitizer,
              public toastr: ToastrService) {

    this.currentUser = this._init.getUserInfo();
    this.showContents = this._init.checkCredential( this.mainCredential, true );

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if ( res.status ) {
            this.showContents = this._init.checkCredential( this.mainCredential, true );
          } else {
            this.showContents = false;
            jQuery('#loginModal').modal('show');
          }
        });

    this.getHoteles();
    this.getCodes();

    nbConfig.minDate = {year: parseInt(moment().format('YYYY')), month: parseInt(moment().format('MM')), day: parseInt(moment().format('DD'))};

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Cotizador');
  }

  ngOnDestroy() {
    jQuery('#loginModal').modal('hide');
    jQuery('#rsvPop').modal('hide');
    jQuery('#cotizador').modal('hide');
    jQuery('#confirmRsv').modal('hide');
  }

  isToday( date ) {
    if ( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ) {
      return 'bg-success text-light';
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
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

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals({ one: date, two: this.fromDate });
  isTo = date => equals({ one: date, two: this.toDate });

  getHoteles() {

    this.loading['hoteles'] = true;


    this._api.restfulGet( '', 'Lists/hotelNames' )
                .subscribe( res => {

                  this.loading['hoteles'] = false;
                  this.hotelList = res['data']

                }, err => {
                  this.loading['hoteles'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getCodes() {

    this.loading['grupos'] = true;


    this._api.restfulGet( '', 'Lists/gruposTarifa' )
                .subscribe( res => {

                  this.loading['grupos'] = false;
                  this.groupsTfa = res['data']

                }, err => {
                  this.loading['grupos'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  test(e){
    console.log(e)
  }

  getCotizacion() {

    this.loading['cotizador'] = true;

    let params = {
        inicio: this.inicio,
        fin: this.fin,
        habs: [],
        grupo: this.selectedCode
      };

    this._filters.forEach(reg => {
        const item = {
          adults: reg.adults,
          minors: reg.min,
          m1: reg.e1,
          m2: reg.e2,
          m3: reg.e3,
          inicio: this.inicio,
          fin: this.fin,
          grupo: this.selectedCode
        };

        params.habs.push(item);
      });

    params['nh'] = params['habs'].length

    this._api.restfulPut( params, 'Venta/cotiza' )
                .subscribe( res => {

                  this.loading['cotizador'] = false;
                  this.resultCot = res['data']
                  this.filterExp = false;

                   // let date1 = new Date(moment(res['data']['gen']['inicio']).format('YYYY'),moment(res['data']['gen']['inicio']).format('MM'),moment(res['data']['gen']['inicio']).format('DD'));
                  // let date2 = new Date(moment(res['data']['gen']['fin']).format('YYYY'),moment(res['data']['gen']['fin']).format('MM'),moment(res['data']['gen']['fin']).format('DD'));
                  // let diffTime = Math.abs(date2.getTime() - date1.getTime())
                  // let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                  let a = moment(res['data']['gen']['inicio'])
                  let b = moment(res['data']['gen']['fin'])
                  this.resultCot['gen']['noches'] = b.diff(a, 'days');

                  this.resultCot['habs'] = this.buildData(res['data'])
                  this.resTours = res['tours']

                  console.log( this.resultCot)

                }, err => {
                  this.loading['cotizador'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatDate(date, format, tz?) {
    if( !tz ){
      return moment(date).format(format);
    }else{
      return moment.tz(date).tz('America/Bogota').format(format);
    }
  }

  buildData( data ){

    let result = []
    let inicio = data['gen']['inicio']
    let fin = data['gen']['fin']
    let noches = data['gen']['noches']

    for( let c in this.hotelList ){
      if( this.hotelList.hasOwnProperty(c) ){
        for( let h of this.hotelList[c] ){
          if( data['habs'][h['code']] ){
            for(let cat in data['habs'][h['code']]['cot'] ){
              if( data['habs'][h['code']]['cot'].hasOwnProperty(cat) ){
                let arr = {
                  inicio: data['gen']['inicio'],
                  fin: data['gen']['fin'],
                  complejo: c,
                  hotel: h['hotelName'],
                  hotelCode: h['code'],
                  hotelOrder: parseInt(h['displayOrder']),
                  hotelUrl: this.sanitization.bypassSecurityTrustStyle(`url('assets/img/logos/logo_${h['code'].toLowerCase()}.jpg')`),
                  categoria: cat,
                  usd_total: 0,
                  mxn_total: 0,
                  l1usd_totalDisc: 0,
                  l1mxn_totalDisc: 0,
                  l2usd_totalDisc: 0,
                  l2mxn_totalDisc: 0,
                  l3usd_totalDisc: 0,
                  l3mxn_totalDisc: 0,
                  l4usd_totalDisc: 0,
                  l4mxn_totalDisc: 0,
                  usd_totalDisc: 0,
                  mxn_totalDisc: 0,
                  totalOpaque: 0,
                  desc: 0.0,
                  isOk: true,
                  habs: [],
                  adults: 0,
                  minors: 0,
                  lSelected: '2',
                  bo: data['habs'][h['code']]['disp']
                }
                for(let hab in data['habs'][h['code']]['cot'][cat] ){
                  if( data['habs'][h['code']]['cot'][cat].hasOwnProperty(hab) ){
                    arr['adults'] += parseInt(data['habs'][h['code']]['cot'][cat][hab][0]['adults'])
                    arr['minors'] += parseInt(data['habs'][h['code']]['cot'][cat][hab][0]['minors'])
                    arr['isNR'] = data['habs'][h['code']]['cot'][cat][hab][0]['isNR']
                    arr['totalOpaque'] = arr['totalOpaque'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['USD'])
                    arr['mxn_total'] = arr['mxn_total'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['MXN'])
                    arr['usd_total'] = arr['usd_total'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['USD'])
                    arr['l1mxn_totalDisc'] = arr['l1mxn_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['l1MXN_total'])
                    arr['l1usd_totalDisc'] = arr['l1usd_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['l1USD_total'])
                    arr['l2mxn_totalDisc'] = arr['l2mxn_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['MXN_total'])
                    arr['l2usd_totalDisc'] = arr['l2usd_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['USD_total'])
                    arr['l3mxn_totalDisc'] = arr['l3mxn_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['l3MXN_total'])
                    arr['l3usd_totalDisc'] = arr['l3usd_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['l3USD_total'])
                    arr['l4mxn_totalDisc'] = arr['l4mxn_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['l4MXN_total'])
                    arr['l4usd_totalDisc'] = arr['l4usd_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['l4USD_total'])
                    arr['mxn_totalDisc'] = arr['mxn_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['MXN_total'])
                    arr['usd_totalDisc'] = arr['usd_totalDisc'] + parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['USD_total'])
                    if( parseInt(data['habs'][h['code']]['cot'][cat][hab][0]['isOk']) == 0 ){
                      arr['isOk'] = false
                      if( data['habs'][h['code']]['cot'][cat][hab][0]['r5'] ){
                        arr['no_disp'] = data['habs'][h['code']]['cot'][cat][hab][0]['r5']
                      }
                      if( data['habs'][h['code']]['cot'][cat][hab][0]['r1'] ){
                        arr['no_occ'] = data['habs'][h['code']]['cot'][cat][hab][0]['r1']
                      }
                      if( data['habs'][h['code']]['cot'][cat][hab][0]['r2'] ){
                        arr['no_adl'] = data['habs'][h['code']]['cot'][cat][hab][0]['r2']
                      }
                      if( data['habs'][h['code']]['cot'][cat][hab][0]['r3'] ){
                        arr['no_min'] = data['habs'][h['code']]['cot'][cat][hab][0]['r3']
                      }
                      if( data['habs'][h['code']]['cot'][cat][hab][0]['r4'] ){
                        arr['no_comb'] = data['habs'][h['code']]['cot'][cat][hab][0]['r4']
                      }
                    }
                    if( !arr['isOk'] ){
                      arr['mxn_total'] = 0
                      arr['usd_total'] = 0
                      arr['mxn_totalDisc'] = 0
                      arr['usd_totalDisc'] = 0
                      arr['l1mxn_totalDisc'] = 0
                      arr['l1usd_totalDisc'] = 0
                      arr['l2mxn_totalDisc'] = 0
                      arr['l2usd_totalDisc'] = 0
                      arr['l3mxn_totalDisc'] = 0
                      arr['l3usd_totalDisc'] = 0
                      arr['l4mxn_totalDisc'] = 0
                      arr['l4usd_totalDisc'] = 0
                    }
                    arr['desc'] = parseFloat(data['habs'][h['code']]['cot'][cat][hab][0]['lv'])
                    arr['habitacion'] = data['habs'][h['code']]['cot'][cat][hab][0]['habName']
                    arr['habCat'] = data['habs'][h['code']]['cot'][cat][hab][0]['cat']
                    arr['habs'].push(data['habs'][h['code']]['cot'][cat][hab][0])
                    arr['spl3'] = data['habs'][h['code']]['cot'][cat][hab][0]['spl3']
                    arr['spl4'] = data['habs'][h['code']]['cot'][cat][hab][0]['spl4']
                    arr['spl3Desc'] = data['habs'][h['code']]['cot'][cat][hab][0]['spl3Desc']
                    arr['spl4Desc'] = data['habs'][h['code']]['cot'][cat][hab][0]['spl4Desc']
                  }
                }
                result.push(arr)
              }
            }
          }
        }
      }
    }

    result = this.orderPipe.transform(result, 'totalOpaque')
    result = this.orderPipe.transform(result, 'hotelOrder')

    return result
  }

  popReserve( h: any ){
    this.rsv.emit({
      data: h,
      moneda: this.moneda,
      tipo: 'hotel'
    })
  }

  sendCotizacion( h ){
    this.dataForBudget = h
    this.budgetTicket = null
    this.budgetExistTicket = false
    this.budgetExistingBudgets = []
    jQuery('#cotizador').modal('show')
    this.chgUser()
  }

  sendBudget(){
    this.loading['cotizando'] = true;

    let params = {
        mail: this.budgetMail,
        name: this.budgetName,
        phone: this.budgetNumber,
        cotizacion: this.dataForBudget,
        ticket: this.budgetTicket,
        noEdit: this.budgetNoEdit,
        lang: this.budgetLang,
        moneda: this.moneda,
        subject: `Cotizacion ${this.dataForBudget['hotel']} del ${this.formatDate(this.dataForBudget['inicio'],'DD-MM-YYYY')} al ${this.formatDate(this.dataForBudget['fin'],'DD-MM-YYYY')}`
      };

    params['cotizacion']['name'] = this.budgetName

    this._api.restfulPut( params, 'Calls/cotizacion' )
                .subscribe( res => {

                  this.loading['cotizando'] = false;

                  jQuery('#cotizador').modal('hide')
                  this.budgetMail = ''
                  this.budgetName = ''
                  this.budgetNumber = ''
                  this.budgetTicket = null
                  this.budgetExistTicket = false
                  this.budgetNoEdit = true
                  this.budgetLang = true
                  this.dataForBudget = []

                  this.toastr.success( 'ticket creado', res['data'] )
                  console.log( 'ticket: '+res['data'] )

                }, err => {
                  this.loading['cotizando'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  rsvError( e ){
    this.toastr.error(e, 'ERROR!')
  }

  endRsv( e ){
    // via:phone type:ticket status:open order_by:created sort:desc created>2019-07-17 asignee:
    this.lastLocCreated = e['masterlocator']
    this.lTicket = ''
    this.flagManage = false
    this.linkedTicketFlag = false
    this.flagSearchTicket = false
    this.getCallTicket(e['items'])
    jQuery('#confirmRsv').modal('show')
  }

  getCallTicket( e, t? ){
    this.loading['callTicket'] = true;

    let asignee = this._init.currentUser['hcInfo']['zdId']
    let date = moment().subtract(2,'days').format('YYYY-MM-DD')

    let query = t ? t : `via:phone type:ticket status:open order_by:created sort:desc created>${date}T00:00:00Z assignee:${asignee}`
    let params = {
        query
      };

    this._api.restfulPut( params, 'Calls/searchZdQuery' )
                .subscribe( res => {

                  this.loading['callTicket'] = false;

                  let results = {}

                  if( t ){
                    for(let r of res['data']['results']){
                      if( r['id'] == t ){
                        results = [r]
                        break
                      }
                    }
                  }else{
                    results = res['data']['results'][0] ? [res['data']['results'][0]] : []
                  }

                  this.linkTicketProc( results, e == null ? this.updateTicket['tickets'] : e, t ? true : false )

                }, err => {
                  this.loading['callTicket'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  linkTicketProc( results, e, f = false ){
    let ticket = ''
    let update = {
      ml: this.lastLocCreated,
      tickets: e,
      ticket: ''
    }

    if( results.length > 0 ){
      ticket = results[0]['id']
      this.linkedTicket = `${ticket} (${results[0]['subject']})`
      update['ticket'] = ticket
      this.flagSearchTicket = false
    }else{
      if( f ){
        this.toastr.error( 'No se encontró el ticket', 'Error' );
      }

      this.flagSearchTicket = true
    }

    this.linkedTicketFlag = false
    this.updateTicket = update
  }

  linkTickets(){
    this.loading['linkingTicket'] = true;

    this._api.restfulPut( this.updateTicket, 'Rsv/linkTicket' )
                .subscribe( res => {

                  this.loading['linkingTicket'] = false;
                  this.flagManage = true
                  this.linkedTicketFlag = true
                }, err => {
                  this.loading['linkingTicket'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  omitLink(){
    this.flagSearchTicket = false
    this.flagManage = true
    this.linkedTicketFlag = true
  }

  chgTicketLink(){
    this.flagSearchTicket = true
    this.flagManage = false
    this.linkedTicketFlag = false
  }

  viewRsv(){
    this.route.navigateByUrl(`/rsv/${this.lastLocCreated}`);
  }

  selectedUser( e ){
    this.budgetName = e['name']
    this.budgetMail = e['email']
    this.budgetNumber = e['phone']
    this.budgetZenId = e['id']

    this.getCotizaciones(e['id'])

    this.searchUserFlag = false
  }

  chgUser(){
    this._zdUser.forEach(reg => {
      reg.reset()
    })

    this.searchUserFlag = true
    this.budgetName = null
    this.budgetMail = null
    this.budgetNumber = null
    this.budgetZenId = null
    this.budgetExistingBudgets = []
  }

  getCotizaciones( rq ){
    this.loading['getCot'] = true;

    let params = {
        query: `type:ticket tags:"cotizacioncyc" requester:${rq}`
      };

    this._api.restfulPut( params, 'Calls/getCot' )
                .subscribe( res => {

                  this.loading['getCot'] = false;

                  this.budgetExistingBudgets = res['data']['details']

                }, err => {
                  this.loading['getCot'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  viewCurrent(){
    console.log(this._init.currentUser)
  }
}
