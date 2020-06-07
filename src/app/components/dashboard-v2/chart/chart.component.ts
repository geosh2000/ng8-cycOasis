import { Component, OnInit, HostListener, ViewChild, ElementRef, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ApiService, ZonaHorariaService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

import * as moment from 'moment-timezone';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  chart:any

  public options: any = {
        chart: {
            type: 'column',
            height: 190
        },
        time: {
            timezone: 'America/New_York'
        },
        xAxis: {
            type: 'datetime',
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'YAxis Title'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        legend: {
          layout: 'horizontal',
          align: 'left',
          verticalAlign: 'top',
          x: 0,
          y: 5,
          floating: true,
          borderWidth: 1,
          backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
          shadow: true
        },
        series: [{
            name: 'John',
            data: [5, 3, 4, 7, 2]
        }]
  }

  loading = {}
  dataExample = []

  divWidth = 1200
  @ViewChild('chartContainer', {static: false}) parentDiv:ElementRef;
  @Input() chartHeight:any = 197
  @Input() chartLoading = false
  @Input() idName = 'a'

  constructor(public _api: ApiService,
              private _zh:ZonaHorariaService,
              public toastr: ToastrService) { }

  ngOnInit(){
    console.log('init chart')
    // this.chart = Highcharts.chart(this.idName, this.options);
    // console.log(this.chart)
  }

  setData( d, data, opts = {}, type='date' ){

    let categories = []
    let options = this.options;
    options.chart.height = this.chartHeight

    if( opts['chartType'] ){
      if( opts['stacking'] ){
        options.plotOptions = { [opts['chartType']]: {stacking: opts['stacking'] } }
      }
      options.chart.type = opts['chartType']
    }

    if( opts['nodatetime'] ){
      if( opts['chartType'] && opts['chartType'] == 'bar' ){
        options.yAxis = { crosshair: true }
        options.xAxis = { min: 0, title: {text: 'YAxis Title'} }
      }else{
        options.xAxis = { crosshair: true }
        options.yAxis = { min: 0, title: {text: 'YAxis Title'} }
      }
    }

    this.chart = Highcharts.chart(this.idName, options);

    let series = {}

    for(let s in d){
      if( d.hasOwnProperty(s) && s != 'Total' ){
        series[s] = {data: [], color: ''}
      }
    }

    for( let r of data ){
      if( series[r['serie']] ){

        if( type == 'date' ){
          series[r['serie']]['data'].push([ type == 'date' ? parseInt(this.unixTime(moment.tz(r['cat'],this._zh.defaultZone).tz(this._zh.zone).format('YYYY-MM-DD HH:mm:ss'))) : r['cat'], Math.round(r['value'])])
        }else{
          series[r['serie']]['data'].push(Math.round(r['value']))
        }
        series[r['serie']]['color'] = r['color']

        if( categories.indexOf(r['cat']) < 0 ){
            categories.push(r['cat'])
        }
      }
    }

    let x = 0;
    for( let ser in series ){
      if( series.hasOwnProperty(ser) ){

        if( this.chart.series[x] ){
          this.chart.series[x].update( {name: ser, color: series[ser]['color']})
          this.chart.series[x].setData( series[ser]['data'] )
        }else{
          this.chart.addSeries({
            name: ser,
            data: series[ser]['data'],
            color: series[ser]['color']
          })
        }

        x++
      }
    }

    if( this.chart.series.length > x ){
      for(let i=x; i <= this.chart.series.length; i++ ){
        this.chart.series[x].remove()
      }
    }

    if( !opts['title'] ){
      this.chart.title.hide()
    }else{
      this.chart.title.update({ text: opts['title'] });
      this.chart.title.show();
    }

    if( opts['yAxis'] ){
      if( opts['chartType'] && opts['chartType'] == 'bar' ){
        this.chart.yAxis[0].setTitle({ text: opts['yAxis'] });
        this.chart.xAxis[0].setTitle({ text: opts['xAxis'] });
        if( type != 'date' ){
          this.chart.xAxis[0].setCategories( categories )
        }
      }else{
        this.chart.yAxis[0].setTitle({ text: opts['yAxis'] });
        if( type != 'date' ){
          this.chart.yAxis[0].setCategories( categories )
        }
      }
    }

  }

  unixTime( time ){
    // DEFINE UNIX TIME
    let m = moment.tz(`${ time }`, this._zh.defaultZone)
    let local = m.clone().tz( this._zh.zone )
    let dif = moment(m.format('YYYY-MM-DD HH:mm:ss')).diff(local.format('YYYY-MM-DD HH:mm:ss'), 'hours')
    m.subtract((5+(dif*(-1))), 'hours')
    return m.format('x')
  }

}
