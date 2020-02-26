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
  selector: 'app-dasboard-venta-prepago-por-asesor',
  templateUrl: './dasboard-venta-prepago-por-asesor.component.html',
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
export class DasboardVentaPrepagoPorAsesorComponent implements OnInit {

  chart:any

  public options: any = {
      chart: {
          zoomType: 'xy',
          // height: '40%'
      },
      title: {
          text: 'Monto Prepagado por día'
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
                  if( this.series.name.match(/^FC/gm) ){
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
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'right',
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
      series: [
      {
        name: 'Monto PH',
        type: 'column',
        data: [],
        tooltip: {
            valuePrefix: '$'
        },
        color: '#03a9f4',
      },
      {
        name: 'Monto Prepagado',
        type: 'column',
        data: [],
        tooltip: {
            valuePrefix: '$'
        },
        color: '#8bc34a',
    },{
      name: 'Meta del Mes',
      type: 'spline',
      data: [],
      tooltip: {
          valuePrefix: '$'
      },
      color: '#ff9800',
    },
    {
      name: 'Meta al dia',
      type: 'spline',
      data: [],
      tooltip: {
          valuePrefix: '$'
      },
      color: '#62efff',
    }]
  }

  loading = {}
  dataExample = []

  divWidth = 1200
  @ViewChild('chartContainerPPasesor', {static: false}) parentDiv:ElementRef;


  constructor(public _api: ApiService,
              public toastr: ToastrService) { }

  ngOnInit(){
    this.getData(true)
  }

  setData(){
    let categories = []
    let series = {
      montoPrepago: [],
      montoPH: [],
      metaDia: [],
      metaMes: []
    }
    for( let r of this.dataExample ){
      categories.push( r['asesor'] )
      series['montoPrepago'].push(Math.round(r['montoPrepago']))
      series['montoPH'].push(Math.round(r['montoPH'] * 100) / 100)
      series['metaDia'].push(Math.round(r['metaDia']))
      series['metaMes'].push(Math.round(r['metaMes']))
    }

    this.chart.xAxis[0].setCategories( categories )
    this.chart.series[1].setData( series['montoPrepago'] )
    this.chart.series[0].setData( series['montoPH'] )
    this.chart.series[3].setData( series['metaDia'] )
    this.chart.series[2].setData( series['metaMes'] )
  }

  getData( ft = false) {

    this.loading['data'] = true;


    this._api.restfulGet( '', 'Dashboard/ventaPrepagoAsesor' )
                .subscribe( res => {

                  this.loading['data'] = false;
                  this.dataExample = res['data']

                  if( ft || !this.chart ){
                    this.chart = Highcharts.chart('containerPPasesor', this.options);
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
