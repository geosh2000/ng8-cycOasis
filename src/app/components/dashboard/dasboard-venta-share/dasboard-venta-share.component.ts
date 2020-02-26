import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ApiService } from 'src/app/services/service.index';
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
  selector: 'app-dasboard-venta-share',
  templateUrl: './dasboard-venta-share.component.html',
  styles: [`
    /* Link the series colors to axis colors */
    .highcharts-color-0 {
    	fill: #7cb5ec;
    	stroke: #7cb5ec;
    }
    .highcharts-axis.highcharts-color-0 .highcharts-axis-line {
    	stroke: #7cb5ec;
    }
    .highcharts-axis.highcharts-color-0 text {
    	fill: #7cb5ec;
    }
    .highcharts-color-1 {
      fill: #90ed7d;
      stroke: #90ed7d;
    }
    .highcharts-axis.highcharts-color-1 .highcharts-axis-line {
      stroke: #90ed7d;
    }
    .highcharts-axis.highcharts-color-1 text {
      fill: #90ed7d;
    }
  `]
})
export class DasboardVentaShareComponent implements OnInit {

  chart:any

  public options: any = {
      chart: {
          zoomType: 'xy',
          height: '40%'
      },
      title: {
          text: 'Share de Venta por dia'
      },
      subtitle: {
          text: 'Source: CIELO'
      },
      xAxis: [{
          crosshair: true
      }],
      yAxis: [{ // Primary yAxis
          labels: {
              format: '${value}',
              style: {
                  color: Highcharts.getOptions().colors[1]
              }
          },
          title: {
              text: 'Monto',
              style: {
                  color: Highcharts.getOptions().colors[1]
              }
          },
          stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold'
            }
        }
      }, { // Secondary yAxis
        title: {
            text: 'FC',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} %',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        opposite: true
    }],
      tooltip: {
          shared: true,
          formatter() {
              let s = '<b>' + this.x + '</b>';
              let amm = []
              let x = 0
              let per = 0
              let color = '';
              let compare = 100;

              $.each(this.points, function() {
                  if( this.series.name.match(/^fc/gm) ){
                    s += '<br/>' + this.series.name + ': <b>' + this.y.toFixed(2) + '%</b>';
                  }else{
                    s += '<br/>' + this.series.name + ': <b>$' + this.y.toLocaleString() + '</b>';
                  }

                  amm.push(this.y);
                  x++;
              });

              return s;
          }
      },
      legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          backgroundColor: 'rgba(255,255,255,0.25)'
      },
      plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: false,
                color: 'white'
            }
        }
      },
      series: [{
        name: 'No Show',
        type: 'column',
        data: [],
        tooltip: {
            valuePrefix: '$'
        },
        color: '#ff7961',
      },
      {
        name: 'Canceladas',
        type: 'column',
        data: [],
        tooltip: {
            valuePrefix: '$'
        },
        color: '#f44336',
      },
      {
        name: 'Futuras',
        type: 'column',
        data: [],
        tooltip: {
            valuePrefix: '$'
        },
        color: '#03a9f4',
      },
      {
        name: 'Efectivas',
        type: 'column',
        data: [],
        tooltip: {
            valuePrefix: '$'
        },
        color: '#8bc34a',
    },{
      name: 'FC Real',
      type: 'spline',
      data: [],
      yAxis: 1,
      tooltip: {
          valueSuffix: '%'
      },
      color: '#ff9800',
    },
    {
      name: 'Meta al dia',
      type: 'spline',
      dashStyle: 'ShortDot',
      data: [],
      tooltip: {
          valuePrefix: '$'
      },
      color: '#673ab7',
    },{
      name: 'FC Dia',
      type: 'spline',
      dashStyle: 'ShortDot',
      data: [],
      yAxis: 1,
      tooltip: {
          valueSuffix: '%'
      },
      color: '#c8b900',
  }]
  }

  loading = {}
  dataExample = []

  divWidth = 1200
  @ViewChild('chartContainerShare', {static: false}) parentDiv:ElementRef;


  constructor(public _api: ApiService,
              public toastr: ToastrService) { }

  ngOnInit(){
    this.getData(true)
  }

  setData(){
    let categories = []
    let series = {
      efectivas: [],
      futuras: [],
      xld: [],
      noShow: [],
      metaDia: [],
      fcReal: [],
      fcDia: []
    }
    for( let r of this.dataExample ){
      categories.push( moment(r['Fecha']).format('DD-MMM'))
      series['efectivas'].push(Math.round(r['montoEfectivas']))
      series['futuras'].push(Math.round(r['montoFuturas']))
      series['xld'].push(Math.round(r['montoXLD']))
      series['noShow'].push(Math.round(r['montoNoShow']))
      series['metaDia'].push(Math.round(r['metaDia']))
      series['fcReal'].push(Math.round(r['fcReal']))
      series['fcDia'].push(Math.round(r['fcDia']))
    }

    this.chart.xAxis[0].setCategories( categories )
    this.chart.series[3].setData( series['efectivas'] )
    this.chart.series[2].setData( series['futuras'] )
    this.chart.series[1].setData( series['xld'] )
    this.chart.series[0].setData( series['noShow'] )
    this.chart.series[5].setData( series['metaDia'] )
    this.chart.series[4].setData( series['fcReal'] )
    this.chart.series[6].setData( series['fcDia'] )
  }

  getData( ft = false) {

    this.loading['data'] = true;


    this._api.restfulGet( '', 'Dashboard/ventaShare' )
                .subscribe( res => {

                  this.loading['data'] = false;
                  this.dataExample = res['data']

                  if( ft || !this.chart ){
                    this.chart = Highcharts.chart('containerShare', this.options);
                  }

                  this.setData()

                }, err => {
                  this.loading['data'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }


}
