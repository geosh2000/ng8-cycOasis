import { Component, OnInit, Injectable, ViewChild, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment-timezone';
import { SearchBarCotizadorComponent } from '../search-bar-cotizador/search-bar-cotizador.component';
import { ApiService, InitService } from 'src/app/services/service.index';
import { OrderPipe } from 'ngx-order-pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

declare var jQuery: any;

@Component({
  selector: 'app-cotiza-day-pass',
  templateUrl: './cotiza-day-pass.component.html',
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
export class CotizaDayPassComponent implements OnInit {

  @ViewChild(SearchBarCotizadorComponent, {static:false}) _search:SearchBarCotizadorComponent
  @Output() rsv = new EventEmitter<any>()

  pickNum:any = []
  adults:any = 1
  min:any = 0
  loading:Object = {}

  inicio: any;
  results:any = []
  occup:Object = {}
  searchParams = {}

  minDate:NgbDateStruct = {
    day: parseInt(moment().format('DD')),
    month: parseInt(moment().format('MM')),
    year: parseInt(moment().format('YYYY'))
  }

  constructor(public _api: ApiService,
              public _init: InitService,
              private orderPipe: OrderPipe,
              private sanitization:DomSanitizer,
              public toastr: ToastrService) {

  }

  ngOnInit() {
  }

  notToday(){
    let f = moment(this.searchParams['inicio']).format('YYYY-MM-DD') != moment().format('YYYY-MM-DD')
    return f
  }

  search( e ){
    this.loading['cotizar'] = true

    this._api.restfulPut( e, 'Cotizador/dayPass' )
                .subscribe( res => {

                  this.loading['cotizar'] = false;

                  let results = []

                  for( let r of res['data'] ){
                    r['hotelUrl'] = this.sanitization.bypassSecurityTrustStyle(`url('assets/img/logos/logo_${r['hotel'].toLowerCase()}.jpg')`)
                    results.push(r)
                  }

                  this.results = results
                  this.searchParams = e
                  this.occup = res['occup']
                  // this._search.reset()

                }, err => {
                  this.loading['cotizar'] = false;

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

  popReserve( h ){
    h['adultos'] = this.occup['adultos']
    h['juniors'] = this.occup['juniors']
    h['menores'] = this.occup['menores']
    h['fecha'] = this.occup['fecha']
    this.rsv.emit({
      data: h,
      moneda: this._search.moneda,
      tipo: 'daypass'
    })
  }

}
