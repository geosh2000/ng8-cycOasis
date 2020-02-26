import { Component, AfterViewInit, ViewContainerRef, Input, SimpleChanges, ViewChild, HostListener, ElementRef, ChangeDetectionStrategy, OnChanges } from '@angular/core';

import * as Highcharts from 'highcharts';
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
  selector: 'app-graph-call-stats',
  templateUrl: './graph-call-stats.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphCallStatsComponent implements AfterViewInit, OnChanges {

    @Input() data = []
    @Input() h = []
    @Input() date = []
    @Input() multi = false
    divWidth = 1200

    chart:Object = {}

    public options:Object = {}

    loading = {}
    dataExample = []

    @ViewChild('chartDiv', {static: false}) parentDiv:ElementRef;

    // @ViewChild('chartContainer') parentDiv:ElementRef;
    @HostListener('window:resize') onResize() {
    this.resizeChart()
    }

  constructor() {

    this.options = {
                title: {
                    text: 'Participación por 800'
                },
                chart: {
                  width: 1200,
                  height: 600,
                  type: 'column'
                },
                xAxis: {
                  type: 'datetime',
                  crosshair: true
                },
                yAxis: [{
                    min: 0,
                    title: {
                        text: 'Total de llamadas'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    }
                },{
                    min: 0,
                    title: {
                        text: 'AHT'
                    },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    },
                    opposite: true
                }],
                legend: {
                    align: 'right',
                    x: -30,
                    verticalAlign: 'top',
                    y: 25,
                    floating: true,
                    backgroundColor: 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: [{
                    name: 'lw',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#a50092',
                    visible: !this.multi
                },{
                    name: 'ly',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300',
                    visible: !this.multi
                },{
                    name: 'Abandon',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'Desborde',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'Otros',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'IN',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300'
                },{
                    name: 'AHT - Desborde',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300',
                    visible: false
                },{
                    name: 'AHT - Mixcoac',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300',
                    visible: false
                },{
                    name: 'AHT - IN',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300',
                    visible: this.multi
                },{
                    name: 'Forecast',
                    data: [1],
                    dashStyle: 'ShortDot',
                    color: '#ef9300',
                    visible: this.multi
                }]

            }

  }


  ngAfterViewInit() {
    this.setData()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setData()
    this.setVisible( this.multi )
  }

  setVisible( flag ){
      if( this.chart['calls'] ){
          let opt = {}
          if( flag ){
                this.chart['calls']['series'][0].hide()
                this.chart['calls']['series'][1].show()
                this.chart['calls']['series'][8].show()
                this.chart['calls']['series'][9].show()
                // dataLabels
                opt[1] = this.chart['calls']['series'][2].options
                opt[2] = this.chart['calls']['series'][3].options
                opt[3] = this.chart['calls']['series'][4].options
                opt[4] = this.chart['calls']['series'][5].options
                opt[1].dataLabels.enabled = false
                opt[2].dataLabels.enabled = false
                opt[3].dataLabels.enabled = false
                opt[4].dataLabels.enabled = false
                this.chart['calls']['series'][2].update(opt[1])
                this.chart['calls']['series'][3].update(opt[2])
                this.chart['calls']['series'][4].update(opt[3])
                this.chart['calls']['series'][5].update(opt[4])
            }else{
                this.chart['calls']['series'][0].show()
                this.chart['calls']['series'][1].show()
                this.chart['calls']['series'][8].hide()
                this.chart['calls']['series'][9].hide()

                // dataLabels
                opt[1] = this.chart['calls']['series'][2].options
                opt[2] = this.chart['calls']['series'][3].options
                opt[3] = this.chart['calls']['series'][4].options
                opt[4] = this.chart['calls']['series'][5].options
                opt[1].dataLabels.enabled = true
                opt[2].dataLabels.enabled = true
                opt[3].dataLabels.enabled = true
                opt[4].dataLabels.enabled = true
                this.chart['calls']['series'][2].update(opt[1])
                this.chart['calls']['series'][3].update(opt[2])
                this.chart['calls']['series'][4].update(opt[3])
                this.chart['calls']['series'][5].update(opt[4])
            }
        }
  }

  saveInstance(identifier, chartInstance) {
      this.chart[identifier] = chartInstance;
      // console.log(this.chart)
  }

  setData(){
    if( !this.chart['calls'] ){
      this.chart['calls'] = Highcharts.chart('chartDiv', this.options);
    }

    console.log(this.data)

    if( this.chart['calls'] ){
      if( this.h && this.h['ly'] && this.h['ly']['name'] ){
        this.chart['calls']['series'][0].update( { name: this.h['ly']['name'], data: this.h['ly']['data'], type: this.h['ly']['type'] } )
      }

      if( this.h && this.h['lw'] && this.h['lw']['name'] ){
        this.chart['calls']['series'][1].update( { name: this.h['lw']['name'], data: this.h['lw']['data'], type: this.h['lw']['type'] } )
      }

      if( this.data && this.data['Abandon'] && this.data['Abandon']['name'] ){
        this.chart['calls']['series'][2].update( { name: this.data['Abandon']['name'], color: this.data['Abandon']['color'], data: this.data['Abandon']['data'] })
      }

      if( this.data && this.data['PDV'] && this.data['PDV']['name'] ){
        this.chart['calls']['series'][3].update( { name: this.data['PDV']['name'], color: this.data['PDV']['color'], data: this.data['PDV']['data'] })
      }

      if( this.data && this.data['Mixcoac'] && this.data['Mixcoac']['name'] ){
        this.chart['calls']['series'][4].update( { name: this.data['Mixcoac']['name'], color: this.data['Mixcoac']['color'], data: this.data['Mixcoac']['data'] })
      }

      if( this.data && this.data['IN'] && this.data['IN']['name'] ){
        this.chart['calls']['series'][5].update( { name: this.data['IN']['name'], color: this.data['IN']['color'], data: this.data['IN']['data'] })
      }

      if( this.data && this.data['Forecast'] && this.data['Forecast']['name'] ){
        this.chart['calls']['series'][9].update( { name: this.data['Forecast']['name'], color: this.data['Forecast']['color'], data: this.data['Forecast']['data'], type: 'line' })
      }
      // AHT

      if( this.data && this.data['PDV'] && this.data['PDV']['name'] ){
        this.chart['calls']['series'][6].update( { name: `AHT - ${this.data['PDV']['name']}`, color: this.data['PDV']['color'], data: this.data['PDV']['aht'], type: 'line', yAxis: 1 })
      }

      if( this.data && this.data['Mixcoac'] && this.data['Mixcoac']['name'] ){
        this.chart['calls']['series'][7].update( { name: `AHT - ${this.data['Mixcoac']['name']}`, color: this.data['Mixcoac']['color'], data: this.data['Mixcoac']['aht'], type: 'line', yAxis: 1 })
      }

      if( this.data && this.data['IN'] && this.data['IN']['name'] ){
        this.chart['calls']['series'][8].update( { name: `AHT - ${this.data['IN']['name']}`, color: this.data['IN']['color'], data: this.data['IN']['aht'], type: 'line', yAxis: 1 })
      }

      this.chart['calls'].title.update({ text: `Llamadas ${ this.date }`})
      // this.chart['calls'].subtitle.update({ text: `$${this.totals[group].toLocaleString('es-MX')} (Last Update: ${ this.lu })`})
      this.resizeChart()
    }
  }

  resizeChart(){
    // guard against resize before view is rendered
    if(this.parentDiv) {
      this.divWidth = this.parentDiv.nativeElement.clientWidth;
      if( this.chart ){
        // tslint:disable-next-line:forin
        for( let group in this.chart ){
          let h = this.divWidth*1000/2200
          this.chart['calls'].setSize(this.divWidth, h);
        }
      }
    }
  }


}
