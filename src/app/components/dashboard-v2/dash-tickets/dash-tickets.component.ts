import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment-timezone';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/service.index';
import { ChartComponent } from '../chart/chart.component';

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
  selector: 'app-dash-tickets',
  templateUrl: './dash-tickets.component.html',
  providers: [NgbDatepickerConfig],
  styleUrls: ['./dash-tickets.component.css']
})
export class DashTicketsComponent implements OnInit {

  @ViewChild('ticketStack100', {static: false}) _stack100:ChartComponent
  @ViewChild('ticketStackAbs', {static: false}) _stackAbs:ChartComponent
  @ViewChild('ticketStackCot', {static: false}) _stackCot:ChartComponent
  @ViewChild('ticketStackAg', {static: false}) _stackAg:ChartComponent

  maxDate:NgbDateStruct = {
    day: parseInt(moment().format('DD')),
    month: parseInt(moment().format('MM')),
    year: parseInt(moment().format('YYYY'))
  }

  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct = {
    day: 1,
    month: parseInt(moment().format('MM')),
    year: parseInt(moment().format('YYYY'))
  }
  toDate: NgbDateStruct = {
    day: parseInt(moment().format('DD')),
    month: parseInt(moment().format('MM')),
    year: parseInt(moment().format('YYYY'))
  }
  inicio: any = moment().format('YYYY-MM') + '-01'
  fin: any = moment().format('YYYY-MM-DD')
  inicioCompare: any = moment().subtract(1, 'month').format('YYYY-MM') + '-01'
  finCompare: any = moment().subtract(1, 'month').format('YYYY-MM-DD')

  loading:Object = {}
  totales:Object = {}
  dias:Object = {}

  constructor( private _api:ApiService, private toastr:ToastrService) {
  }

  ngOnInit() {
    jQuery('#picker').val(`${moment(this.inicio).format('DD MMM')} a ${moment(this.fin).format('DD MMM')}`)
    jQuery('#pickerC').val(`${moment(this.inicioCompare).format('DD MMM')} a ${moment(this.finCompare).format('DD MMM')}`)
    this.getData()
  }

  onDateSelection(date: NgbDateStruct, el, type='date', tp = 'd' ) {
    if( type == 'date' ){
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
        this.inicio = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
      } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals({ one: date, two: this.fromDate }))) {
        this.toDate = date;
        this.fin = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment(this.inicio).format('DD/MM')} a ${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')}`);
        el.close();
        this.getData()
        // this.getAsistencia()
      } else {
        this.toDate = null;
        this.fromDate = date;
        this.inicio = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#picker').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
        this.fin = null;
      }
    }else{
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
        this.inicioCompare = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#pickerC').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
      } else if (this.fromDate && !this.toDate && (after(date, this.fromDate) || equals({ one: date, two: this.fromDate }))) {
        this.toDate = date;
        this.finCompare = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#pickerC').val(`${moment(this.inicioCompare).format('DD/MM')} a ${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')}`);
        el.close();
        this.getData()
        // this.getAsistencia()
      } else {
        this.toDate = null;
        this.fromDate = date;
        this.inicioCompare = moment({year: date.year, month: date.month - 1, day: date.day}).format('YYYY-MM-DD');
        jQuery('#pickerC').val(`${moment({year: date.year, month: date.month - 1, day: date.day}).format('DD/MM')} a `);
        this.finCompare = null;
      }
    }
  }

  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals({ one: date, two: this.fromDate });
  isTo = date => equals({ one: date, two: this.toDate });

  getData(){
    this.getTotales()
  }

  getTotales() {

    this.loading['totales'] = true;
    this.loading['dia'] = true;
    this.loading['cot'] = true;
    this.loading['agent'] = true;


    this._api.restfulPut( {inicio: this.inicio, fin: this.fin, inicioCompare: this.inicioCompare, finCompare: this.finCompare}, 'Datastudio/ticketVia' )
                .subscribe( res => {

                  this.loading['totales'] = false;
                  this.totales = res['data']
                  this.getDates()
                  this.getCot()
                  this.getAgent()

                }, err => {
                  this.loading['totales'] = false;
                  this.loading['dia'] = false;
                  this.loading['cot'] = false;
                  this.loading['agent'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getDates() {

    this.loading['dia'] = true;


    this._api.restfulPut( {inicio: this.inicio, fin: this.fin}, 'Datastudio/ticketDia' )
                .subscribe( res => {

                  this.loading['dia'] = false;
                  this.dias = res['data']
                  this._stack100.setData(this.totales, res['data'], {id: 'stack100', yAxis: '% share'})
                  this._stackAbs.setData(this.totales, res['data'], {id: 'stackAbs', yAxis: 'Q Tickets', stacking: 'normal', chartType: 'column'})
                }, err => {
                  this.loading['dia'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getCot() {

    this.loading['cot'] = true;


    this._api.restfulPut( {inicio: this.inicio, fin: this.fin}, 'Datastudio/ticketCot' )
                .subscribe( res => {

                  this.loading['cot'] = false;
                  this._stackCot.setData(res['data']['cats'], res['data']['data'], {id: 'stackCot', yAxis: 'Q Cotizaciones', stacking: 'normal', chartType: 'column'})

                }, err => {
                  this.loading['cot'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  getAgent() {

    this.loading['agent'] = true;


    this._api.restfulPut( {inicio: this.inicio, fin: this.fin}, 'Datastudio/ticketAgent' )
                .subscribe( res => {

                  this.loading['agent'] = false;
                  this._stackAg.setData(this.totales, res['data'], {id: 'stackCot', yAxis: 'Q Por Agente', xAxis: 'Agente', stacking: 'normal', chartType: 'bar', nodatetime: true}, 'text')

                }, err => {
                  this.loading['agent'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatCompare(d, type){

    if( d['var'] > 0.05 ){
      return type == 'icon' ? 'fas fa-long-arrow-alt-up' : 'text-success'
    }

    if( d['var'] < -0.05 ){
      return type == 'icon' ? 'fas fa-long-arrow-alt-down' : 'text-danger'
    }

    return type == 'icon' ? 'fas fa-arrows-alt-h' : 'text-warning'

  }


}
