import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, InitService, TokenCheckService, ZonaHorariaService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { ContextMenuComponent } from 'ngx-contextmenu';

const equals = (one: NgbDateStruct, two: NgbDateStruct) => one && two && two.year == one.year && two.month == one.month && two.day == one.day;
const before = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day < two.day : one.month < two.month : one.year < two.year;
const after = (one: NgbDateStruct, two: NgbDateStruct) => !one || !two ? false : one.year == two.year ? one.month == two.month ? one.day == two.day ? false : one.day > two.day : one.month > two.month : one.year > two.year;

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-carga-horarios',
  templateUrl: './carga-horarios.component.html',
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

            .ng-invalid {
              border: 1px solid red;
            }
  `]
})
export class CargaHorariosComponent implements OnInit {

  @ViewChild(ContextMenuComponent, {static:false}) public basicMenu: ContextMenuComponent;

  mainCredential: any = 'sch'
  showContents: boolean;
  currentUser: any;

  loading:Object = {}

  horaCun:boolean = false
  filterExpanded:boolean = false
  copyShow:boolean = false
  selectedAsesores:any = []
  pdvList:any = []

  inicio:any = moment().format('YYYY-MM-DD')
  fin:any = moment().format('YYYY-MM-DD')

  d:any

  hoveredDate: NgbDateStruct
  fromDate: NgbDateStruct
  toDate: NgbDateStruct
  fromDateCopy: NgbDateStruct
  toDateCopy: NgbDateStruct
  inicioCopy: any
  finCopy: any

  listScheds:any
  listDates:any

  zhs:any = []
  zone:any = 'America/Mexico_city'
  zoneIdx:any = 0
  zoneMap:Object = {}

  selectedHIds:any = []
  tmpArr:any
  editOpts:Object = {
    i: null,
    e: null,
    x1i: null,
    x1e: null,
    x2i: null,
    x2e: null,
    ci: null,
    ce: null
  }

  optH:Object = {
    cc8: {
            m: [ ['00:00', '07:00'], ['05:00', '12:30'], ['05:30', '13:00'], ['06:00', '14:00'], ['06:30', '14:30'], ['07:00', '15:00'], ['07:30', '15:30'], ['08:00', '16:00'], ['08:30', '16:30'], ['09:00', '17:00'], ['09:30', '17:30'], ['10:00', '18:00'], ['10:00', '20:00'], ['10:00', '21:00'], ['10:30', '18:30'], ['11:00', '19:00'], ['11:30', '19:30'] ],
            v: [ ['12:00', '20:00'], ['12:30', '20:30'], ['13:30', '21:00'], ['14:00', '21:30'], ['14:30', '22:00'], ['15:00', '22:30'], ['15:30', '23:00'], ['16:00', '23:30'], ['17:00', '00:00'], ['17:30', '00:30'], ['18:00', '01:00'], ['18:30', '01:30'], ['19:00', '02:00'], ['19:30', '02:30'], ['20:00', '03:00'], ['23:30', '06:00'] ]
          },
    sc8: {
            m: [ ['00:00', '06:30'], ['05:00', '12:30'], ['05:30', '13:00'], ['06:00', '13:30'], ['06:30', '14:00'], ['07:00', '14:30'], ['07:30', '15:00'], ['08:00', '15:30'], ['08:30', '16:00'], ['09:00', '16:30'], ['09:30', '17:00'], ['10:00', '17:30'], ['10:00', '19:30'], ['10:30', '18:00'], ['11:00', '18:30'], ['11:30', '19:00'] ],
            v: [ ['12:00', '19:30'], ['12:30', '20:00'], ['13:30', '20:30'], ['14:00', '21:00'], ['14:30', '21:30'], ['15:00', '22:00'], ['15:30', '22:30'], ['16:00', '23:00'], ['17:00', '23:30'], ['17:30', '00:00'], ['18:00', '00:30'], ['18:30', '01:00'], ['19:00', '01:30'], ['19:30', '02:00'], ['20:00', '02:30'], ['23:30', '06:00'] ]
          }
  }

  errors:any = []

  selectOptions:Select2Options = {
    multiple: false,
  }

  constructor(
              private _api:ApiService,
              private _init:InitService,
              private titleService: Title,
              private _tokenCheck:TokenCheckService,
              public toastr: ToastrService,
              private _zh:ZonaHorariaService
              ) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
                    .subscribe( res => {

                      if( res.status ){
                        this.showContents = this._init.checkCredential( this.mainCredential, true )
                      }else{
                        this.showContents = false
                      }
                    })

    moment.locale('es-MX')

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Carga de Horarios');
    this.getZones()
    this.getPdvs()
    setTimeout( () => {
      this.horaCun = this._zh.isCun
      this.zone = this._zh.zone
      this.zoneIdx = this._zh.zoneIdx
    }, 1000)
  }

  getZones(){
    this._api.restfulGet( '', 'Preferences/listZonasHorarias')
        .subscribe( res => {
          this.zhs = res['data']

          let zonesMap = {}
          for( let item of res['data'] ){
            zonesMap[item['id']] = item['zonaHoraria']
          }

          this.zoneMap = zonesMap
        })
  }

  chgZone( val ){
    this.zone = this.zoneMap[val]
  }

  isToday( date ){
    if( moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ){
      return 'bg-success text-light'
    }
  }

  onDateSelection(date: NgbDateStruct, el ) {
    let selected = moment({year: date.year, month: date.month-1, day: date.day})
    let dow = parseInt(selected.format('e'))

    let inicio = selected.subtract( dow, 'days')
    let fin = selected.clone().add( 6, 'days')

    this.inicio = inicio.format('YYYY-MM-DD')
    this.fin = fin.format('YYYY-MM-DD')

    jQuery('#picker').val(`${inicio.format('DD/MM')} a ${fin.format('DD/MM')}`)

    el.close()
  }

  onDateSelectionCopy(date: NgbDateStruct, el ) {
    if (!this.fromDateCopy && !this.toDateCopy) {
      this.fromDateCopy = date
      this.inicioCopy = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#pickerCopy').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
    } else if (this.fromDateCopy && !this.toDate && (after(date, this.fromDateCopy) || equals(date, this.fromDateCopy))) {
      this.toDateCopy = date
      this.finCopy = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#pickerCopy').val(`${moment({year: this.fromDateCopy.year, month: this.fromDateCopy.month-1, day: this.fromDateCopy.day}).format('DD/MM')} a ${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')}`)
      el.close()
      this.fromDateCopy = null
      this.toDateCopy = null
    } else {
      this.toDateCopy = null;
      this.fromDateCopy = date;
      this.inicioCopy = moment({year: date.year, month: date.month-1, day: date.day}).format('YYYY-MM-DD')
      jQuery('#pickerCopy').val(`${moment({year: date.year, month: date.month-1, day: date.day}).format('DD/MM')} a `)
      this.finCopy = null
    }
  }

  isHovered = date => this.fromDateCopy && !this.toDateCopy && this.hoveredDate && after(date, this.fromDateCopy) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDateCopy) && before(date, this.toDateCopy);
  isFrom = date => equals(date, this.fromDateCopy);
  isTo = date => equals(date, this.toDateCopy);

  getSchedules(){
    this.filterExpanded=false
    this.selectedHIds = []
    this.loading['schedules'] = true

    let params = {
      asesores: this.selectedAsesores,
      inicio: this.inicio,
      fin: this.fin
    }

    this._api.restfulPut( params, 'Asistencia/schedulesEditList' )
              .subscribe( res => {

                this.loading['schedules'] = false
                this.listScheds = {}

                let data = res['data']
                let list = {}

                for( let item of data ){
                  if( list[item['asesor']] ){
                    list[item['asesor']][item['Fecha']] = {
                                                            sel: false,
                                                            change: false,
                                                            data: item
                                                          }
                  }else{
                    list[item['asesor']] = {
                      [item['Fecha']]: {
                        sel: false,
                        change: false,
                        data: item
                      },
                      Nombre: item['Nombre']
                    }
                  }
                }

                this.listDates = []
                for( let i = moment(this.inicio); i <= moment(this.fin); i.add(1, 'days') ){
                  this.listDates.push( i.format('YYYY-MM-DD') )
                }

                // tslint:disable-next-line:forin
                for( let asesor in list ){
                  for( let date of this.listDates ){
                    if( !list[asesor][date] ){
                      list[asesor][date] = { sel: false, change: false }
                    }
                  }
                }

                this.listScheds = list
                // console.log(this.listScheds)

              }, err => {
                console.log('ERROR', err)

                this.loading['schedules'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  printMoment( val, format, header = false ){
    return moment.tz(header ? `${val} 12:00:00` : val, 'America/Mexico_city').tz(this.zone).format(format)
  }

  selectH( asesor, date, skip = false ){

    if( !skip ){
      this.listScheds[asesor][date]['sel'] = !this.listScheds[asesor][date]['sel']
    }

    let flag = this.listScheds[asesor][date]['sel']

    if( flag ){
      this.selectedHIds.push( { asesor: asesor, date: date, id: this.listScheds[asesor][date]['data']['id'] } )
    }else{
      let index = this.findId( this.listScheds[asesor][date]['data']['id'] )
      if( index >= 0 ){
        this.selectedHIds.splice( index, 1 )
      }
    }
  }

  findId( id ){
    let i = 0
    for( let item of this.selectedHIds ){
      if( item['id'] == id ){
        return i
      }
      i++
    }

    return -1
  }

  transformHs(item, field, tz = true){
    let m = moment.tz(this.listScheds[item['asesor']][item['date']]['data'][field], this.zone)
    // if( this.horaCun ){
      if( this.listScheds[item['asesor']][item['date']]['data'][field] != null ){
        this.listScheds[item['asesor']][item['date']]['data'][field] = tz ? m.tz('America/Mexico_city').format('YYYY-MM-DD HH:mm:ss') : m.format('YYYY-MM-DD HH:mm:ss')
      }
    // }
  }

  quickSet( type, arr = this.selectedHIds, i?, e?, flag = false ){
    console.log(i,e)

    for( let item of arr ){

      // if( i ){
      //   i = moment.tz(`${item['date']} ${i}:00`, this.zone).tz('America/Mexico_city').format('HH:mm')
      //   // `${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`
      // }
      // if( e ){
      //   e = moment.tz(`${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`, this.zone).tz('America/Mexico_city').format('HH:mm')
      // }

      switch( type ){
        case 'descanso':
          this.listScheds[item['asesor']][item['date']]['data']['js'] = `${item['date']} 00:00:00`
          this.listScheds[item['asesor']][item['date']]['data']['je'] = `${item['date']} 00:00:00`
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['cs'] = null
          this.listScheds[item['asesor']][item['date']]['data']['ce'] = null
          break
        case 'jdelete':
          this.listScheds[item['asesor']][item['date']]['data']['js'] = null
          this.listScheds[item['asesor']][item['date']]['data']['je'] = null
          break
        case 'x1delete':
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          break
        case 'x2delete':
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          break
        case 'xdelete':
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          break
        case 'cdelete':
          this.listScheds[item['asesor']][item['date']]['data']['cs'] = null
          this.listScheds[item['asesor']][item['date']]['data']['ce'] = null
          break
        case 'cSE':
          this.listScheds[item['asesor']][item['date']]['data']['cs'] = `${item['date']} ${i}:00`
          this.listScheds[item['asesor']][item['date']]['data']['ce'] = `${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`
          this.transformHs( item, 'cs' )
          this.transformHs( item, 'ce' )
          break
        case 'jSE':
          this.listScheds[item['asesor']][item['date']]['data']['js'] = `${item['date']} ${i}:00`
          this.listScheds[item['asesor']][item['date']]['data']['je'] = `${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          this.listScheds[item['asesor']][item['date']]['data']['cs'] = null
          this.listScheds[item['asesor']][item['date']]['data']['ce'] = null
          this.transformHs( item, 'js' )
          this.transformHs( item, 'je' )
          break
        case 'x1SE':
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = `${item['date']} ${i}:00`
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = `${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          this.transformHs( item, 'x1s', false )
          this.transformHs( item, 'x1e', false )
          break
        case 'x2SE':
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = `${item['date']} ${i}:00`
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = `${ moment(`${item['date']} ${i}:00`) > moment(`${item['date']} ${e}:00`) ? moment(item['date']).add(1,'days').format('YYYY-MM-DD') : item['date']} ${e}:00`
          if( !flag ){
            this.listScheds[item['asesor']][item['date']]['data']['x2s'] = null
            this.listScheds[item['asesor']][item['date']]['data']['x2e'] = null
          }
          this.transformHs( item, 'x2s', false )
          this.transformHs( item, 'x2e', false )
          break
        case 'qX1':
          if( this.listScheds[item['asesor']][item['date']]['data']['js'] == this.listScheds[item['asesor']][item['date']]['data']['je'] ){
            return false
          }
          this.listScheds[item['asesor']][item['date']]['data']['x1s'] = i > 0 ? this.listScheds[item['asesor']][item['date']]['data']['je'] : `${moment(this.listScheds[item['asesor']][item['date']]['data']['js']).subtract(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}`
          this.listScheds[item['asesor']][item['date']]['data']['x1e'] = i > 0 ? `${moment(this.listScheds[item['asesor']][item['date']]['data']['je']).add(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}` : this.listScheds[item['asesor']][item['date']]['data']['js']
          this.transformHs( item, 'x1s', false )
          this.transformHs( item, 'x1e', false )
          break
        case 'qX2':
          if( this.listScheds[item['asesor']][item['date']]['data']['js'] == this.listScheds[item['asesor']][item['date']]['data']['je'] ){
            return false
          }
          this.listScheds[item['asesor']][item['date']]['data']['x2s'] = i > 0 ? this.listScheds[item['asesor']][item['date']]['data']['je'] : `${moment(this.listScheds[item['asesor']][item['date']]['data']['js']).subtract(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}`
          this.listScheds[item['asesor']][item['date']]['data']['x2e'] = i > 0 ? `${moment(this.listScheds[item['asesor']][item['date']]['data']['je']).add(Math.abs(i), 'hours').format('YYYY-MM-DD HH:mm:ss')}` : this.listScheds[item['asesor']][item['date']]['data']['js']
          this.transformHs( item, 'x2s', false )
          this.transformHs( item, 'x2e', false )
          break
        case 'qC':
          if( this.listScheds[item['asesor']][item['date']]['data']['js'] == this.listScheds[item['asesor']][item['date']]['data']['je'] ){
            return false
          }
          this.listScheds[item['asesor']][item['date']]['data']['cs'] = `${moment(this.listScheds[item['asesor']][item['date']]['data']['js']).add(i, 'hours').format('YYYY-MM-DD HH:mm:ss')}`
          this.listScheds[item['asesor']][item['date']]['data']['ce'] = `${moment(this.listScheds[item['asesor']][item['date']]['data']['js']).add(i, 'hours').add(e, 'hours').format('YYYY-MM-DD HH:mm:ss')}`
          this.transformHs( item, 'cs', false )
          this.transformHs( item, 'ce', false )
          break
      }

      this.listScheds[item['asesor']][item['date']]['change'] = true
    }
  }

  quickSel( flag ){
    // tslint:disable-next-line:forin
    for( let asesor in this.listScheds ){
      for( let item of this.listDates ){
        this.listScheds[asesor][item]['sel'] = flag
        this.selectH( asesor, item, true )
      }
    }
  }

  runCompare( arr ){
    console.log(arr)
    let flag = true
    let compare = { j: [], x1: [], x2: [], c: [] }, i=0
    for( let item of arr ){
      console.log(this.listScheds[item['asesor']][item['date']]['data'])
      console.log(this.listScheds[item['asesor']][item['date']]['data']['js'])
      if( i > 0 ){
        if( !( this.listScheds[item['asesor']][item['date']]['data']['js'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['js']).format('HH:mm:ss') : null == compare['j'][0] && this.listScheds[item['asesor']][item['date']]['data']['je'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['je']).format('HH:mm:ss') : null == compare['j'][1] ) ){
          return false
        }
        if( !( this.listScheds[item['asesor']][item['date']]['data']['x1s'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['x1s']).format('HH:mm:ss') : null == compare['x1'][0] && this.listScheds[item['asesor']][item['date']]['data']['x1e'] ?  moment(this.listScheds[item['asesor']][item['date']]['data']['x1e']).format('HH:mm:ss') : null == compare['x1'][1] ) ){
          return false
        }
        if( !( this.listScheds[item['asesor']][item['date']]['data']['x2s'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['x2s']).format('HH:mm:ss') : null == compare['x2'][0] && this.listScheds[item['asesor']][item['date']]['data']['x2e'] ?  moment(this.listScheds[item['asesor']][item['date']]['data']['x2e']).format('HH:mm:ss') : null == compare['x2'][1] ) ){
          return false
        }
        if( !( this.listScheds[item['asesor']][item['date']]['data']['cs'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['cs']).format('HH:mm:ss') : null == compare['c'][0] && this.listScheds[item['asesor']][item['date']]['data']['ce'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['ce']).format('HH:mm:ss') : null == compare['c'][1] ) ){
          return false
        }
      }
      compare['j'] = [this.listScheds[item['asesor']][item['date']]['data']['js'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['js']).format('HH:mm:ss') : null, this.listScheds[item['asesor']][item['date']]['data']['je'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['je']).format('HH:mm:ss') : null]
      compare['x1'] = [this.listScheds[item['asesor']][item['date']]['data']['x1s'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['x1s']).format('HH:mm:ss') : null, this.listScheds[item['asesor']][item['date']]['data']['x1e'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['x1e']).format('HH:mm:ss') : null]
      compare['x1'] = [this.listScheds[item['asesor']][item['date']]['data']['x2s'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['x2s']).format('HH:mm:ss') : null, this.listScheds[item['asesor']][item['date']]['data']['x2e'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['x2e']).format('HH:mm:ss') : null]
      compare['c'] = [this.listScheds[item['asesor']][item['date']]['data']['cs'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['cs']).format('HH:mm:ss') : null, this.listScheds[item['asesor']][item['date']]['data']['ce'] ? moment(this.listScheds[item['asesor']][item['date']]['data']['ce']).format('HH:mm:ss') : null]
      i++
    }

    return true
  }

  editH( arr = this.selectedHIds, form ){
    form.reset()
    this.tmpArr = arr

    if( this.runCompare(arr) ){
      form.controls['i'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['js'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['js'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['e'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['je'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['je'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['x1i'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x1s'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x1s'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['x1e'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x1e'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x1e'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['x2i'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x2s'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x2s'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['x2e'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x2e'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['x2e'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['ci'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['cs'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['cs'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
      form.controls['ce'].setValue( this.listScheds[arr[0]['asesor']][arr[0]['date']]['data'] && this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['ce'] ? moment( moment.tz(this.listScheds[arr[0]['asesor']][arr[0]['date']]['data']['ce'], 'America/Mexico_city').tz(this.zone).format('YYYY-MM-DD HH:mm:ss')).format('HH:mm') : null)
    }
    jQuery('#editHorario').modal('show')
  }

  saveEdit( form: NgForm ){

    console.log( form )

    if ( form.valid ){

      if ( !this.validateHs( form.value ) ){
        return false
      }

      if ( form.value['i'] ){
        this.quickSet( 'jSE', this.tmpArr, form.value['i'], form.value['e'] )
      }else{
        this.quickSet( 'jdelete', this.tmpArr )
      }
      if ( form.value['x1i'] ){
        this.quickSet( 'x1SE', this.tmpArr, form.value['x1i'], form.value['x1e'] )
      }else{
        this.quickSet( 'x1delete', this.tmpArr )
      }
      if ( form.value['x2i'] ){
        this.quickSet( 'x2SE', this.tmpArr, form.value['x2i'], form.value['x2e'], true )
      }else{
        this.quickSet( 'x2delete', this.tmpArr )
      }
      if ( form.value['ci'] ){
        this.quickSet( 'cSE', this.tmpArr, form.value['ci'], form.value['ce'] )
      }else{
        this.quickSet( 'cdelete', this.tmpArr )
      }

      jQuery('#editHorario').modal('hide')
      form.resetForm()
    }else{
      this.toastr.error('El formulario es inválido', 'ERROR!')

      let ctrls = {
        i: ['Jornada Inicio', 'Jornada'],
        e: ['Jornada Fin', 'Jornada'],
        x1i: ['Horas Extra 1 Inicio', 'x1'],
        x1e: ['Horas Extra 1 Fin', 'x1'],
        x2i: ['Horas Extra 2 Inicio', 'x2'],
        x2e: ['Horas Extra 2 Fin', 'x2'],
        ci: ['Comida Inicio', 'Comida'],
        ce: ['Comida Fin', 'Comida'],
      }

      // tslint:disable-next-line:forin
      for( let ctrl in form.controls ){
        if( !form.controls[ctrl]['valid'] ){
          // tslint:disable-next-line:forin
          for( let err in form.controls[ctrl]['errors'] ){
            let msg
            switch( err ){
              case 'required':
                msg = 'Debes ingresar horarios de inicio y fin'
                break
              case 'pattern':
                msg = 'Debes ingresar el horario en forma HH:MM en formato de 24 hrs (sólo se aceptan minutos en \'00\' y \'30\''
                break
            }

            this.toastr.error(msg, `Error en ${ctrls[ctrl][0]}`)
          }
        }
      }
    }

  }

  validateHs( value ){
    let max, i, e
    let vals = {
      j: {},
      x1: {},
      x2: {},
      c: {},
    }


    // Jornadas
    i = value['i']
    e = value['e']
    vals['j']['start'] = moment(`${moment().format('YYYY-MM-DD')} ${i}:00`)
    vals['j']['end'] = moment(`${ moment(`${moment().format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment().format('YYYY-MM-DD')} ${e}:00`) ? moment().add(1,'days').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')} ${e}:00`)
    vals['j']['duration'] = moment.duration(vals['j']['end'].diff(vals['j']['start'])).asHours();
    max = 12
    this.checkLenHs( vals['j']['start'], vals['j']['end'], vals['j']['duration'], max, 'Jornadas')

    if( value['i'] == value['e'] || value['i'] == null || value['e'] == null || value['i'] == '' || value['e'] == '' ){
      this.toastr.error(`Para cargar horas extra o comidas, debes ingresar una jornada. Si deseas asignar un descanso, puedes hacerlo desde el menú rápido`, 'Error en Jornadas')
      return false
    }

    if(!( value['x1i'] == null || value['x1e'] == null || value['x1i'] == '' || value['x1e'] == '' )){
      // X1
      i = value['x1i']
      e = value['x1e']
      vals['x1']['start'] = moment(`${moment().format('YYYY-MM-DD')} ${i}:00`)
      vals['x1']['end'] = moment(`${ moment(`${moment().format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment().format('YYYY-MM-DD')} ${e}:00`) ? moment().add(1,'days').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')} ${e}:00`)
      vals['x1']['duration'] = moment.duration(vals['x1']['end'].diff(vals['x1']['start'])).asHours();
      max = 2
      this.checkLenHs( vals['x1']['start'], vals['x1']['end'], vals['x1']['duration'], max, 'X1')
      if( vals['x1']['start'] > vals['j']['start'] && vals['x1']['start'] < vals['j']['end'] ){
        this.toastr.error(`Las horas extra no pueden iniciar entre los horarios de jornada`, 'Error en Extra 1')
        return false
      }
      if( vals['x1']['end'] > vals['j']['start'] && vals['x1']['end'] < vals['j']['end'] ){
        this.toastr.error(`Las horas extra no pueden terminar entre los horarios de jornada`, 'Error en Extra 1')
        return false
      }
    }

    if(!( value['x2i'] == null || value['x2e'] == null || value['x2i'] == '' || value['x2e'] == '' )){
      // X2
      i = value['x2i']
      e = value['x2e']
      vals['x2']['start'] = moment(`${moment().format('YYYY-MM-DD')} ${i}:00`)
      vals['x2']['end'] = moment(`${ moment(`${moment().format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment().format('YYYY-MM-DD')} ${e}:00`) ? moment().add(1,'days').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')} ${e}:00`)
      vals['x2']['duration'] = moment.duration(vals['x2']['end'].diff(vals['x2']['start'])).asHours();
      max = 2
      this.checkLenHs( vals['x2']['start'], vals['x2']['end'], vals['x2']['duration'], max, 'X2')
      if( value['x1i'] == value['x1e'] || value['x1i'] == null || value['x1e'] == null || value['x1i'] == '' || value['x1e'] == '' ){
        this.toastr.error(`No es posible cargar horas extra en el slot 2 si el slot \'x1\' está vacío`, 'Error en X2')
        return false
      }
      if( vals['x2']['start'] > vals['j']['start'] && vals['x2']['start'] < vals['j']['end'] ){
        this.toastr.error(`Las horas extra no pueden iniciar entre los horarios de jornada`, 'Error en Extra 2')
        return false
      }
      if( vals['x2']['end'] > vals['j']['start'] && vals['x2']['end'] < vals['j']['end'] ){
        this.toastr.error(`Las horas extra no pueden terminar entre los horarios de jornada`, 'Error en Extra 2')
        return false
      }
      if( vals['x2']['start'] > vals['x1']['start'] && vals['x2']['start'] < vals['x1']['end'] ){
        this.toastr.error(`Las horas extra del slot 2 no pueden iniciar entre los horarios de las horas extra del slot 1`, 'Error en Extra 2')
        return false
      }
      if( vals['x2']['end'] > vals['x1']['start'] && vals['x2']['end'] < vals['x1']['end'] ){
        this.toastr.error(`Las horas extra del slot 2 no pueden terminar entre los horarios de las horas extra del slot 1`, 'Error en Extra 2')
        return false
      }
    }

    if(!( value['ci'] == null || value['ce'] == null || value['ci'] == '' || value['ce'] == '' )){
      // Comidas
      i = value['ci']
      e = value['ce']
      vals['c']['start'] = moment(`${moment().format('YYYY-MM-DD')} ${i}:00`)
      vals['c']['end'] = moment(`${ moment(`${moment().format('YYYY-MM-DD')} ${i}:00`) > moment(`${moment().format('YYYY-MM-DD')} ${e}:00`) ? moment().add(1,'days').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')} ${e}:00`)
      vals['c']['duration'] = moment.duration(vals['c']['end'].diff(vals['c']['start'])).asHours();
      max = 1
      this.checkLenHs( vals['c']['start'], vals['c']['end'], vals['c']['duration'], max, 'Comidas')
      if( vals['c']['start'] < vals['j']['start'] || vals['c']['start'] > vals['j']['end'] ){
        this.toastr.error(`El horario de comida debe estar dentro de los horarios de jornada`, 'Error en Extra 2')
        return false
      }
      if( vals['c']['start'] < vals['j']['start'] || vals['c']['end'] > vals['j']['end'] ){
        this.toastr.error(`El horario de comida debe estar dentro de los horarios de jornada`, 'Error en Extra 2')
        return false
      }

    }
    return true

  }

  checkLenHs( start, end, duration, max, ctrl ){
    if( start == end ){
      this.toastr.error(`No es posible ingresar dos valores idénticos. Si necesitas ingresar un descanso, puedes hacerlo desde el menú rápido`, 'Error en ' + ctrl)
      return false
    }

    if (duration > max) {
      this.toastr.error(`El horario de fin es menor al de inicio, o existe una diferencia mayor a ${max} horas entre horarios`, 'Error en ' + ctrl)
      return false
    }

    return true
  }

  saveScheds(){
    let changes = [], hs = ['js','je','x1s','x1e','x2s','x2e','cs','ce']
    // tslint:disable-next-line:forin
    for( let asesor in this.listScheds ){
      for( let date of this.listDates ){
        if( this.listScheds[asesor][date]['change'] ){
          let item = JSON.parse(JSON.stringify(this.listScheds[asesor][date]['data']))
          delete item.Nombre
          delete item.aus
          delete item.id
          changes.push(item)
        }
      }
    }

    this.uploadChanges( changes, 'save')
  }

  uploadChanges( changes, loader ){
    this.loading[loader] = true

    this._api.restfulPut( changes, 'Asistencia/schedulesChargeSave' )
              .subscribe( res => {

                this.loading[loader] = false

                if( res['omited'] > 0 ){
                  this.toastr.error(`Se omitieron ${res['omited']} registros por ser de fechas pasadas o de este mes y no contar con permisos para hacerlo`, 'Guardado' )
                }else{
                  this.toastr.success(res['msg'], 'Guardado' )
                }
                this.getSchedules()

              }, err => {
                console.log('ERROR', err)

                this.loading[loader] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                this.errors = error['errores']
                console.error(err.statusText, error.msg)

              })
  }

  selRow( asesor, flag ){
    for( let date of this.listDates ){
      this.listScheds[asesor][date]['sel'] = flag
      this.selectH( asesor, date, true )
    }
  }

  closeAlert( alert ) {
    const index: number = this.errors.indexOf(alert);
    this.errors.splice(index, 1);
  }

  copyArr(){
    let hs = ['js','je','x1s','x1e','x2s','x2e','cs','ce']
    let dowArr = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []  }
    let finalArr = []

    for( let item of this.selectedHIds ){
      let dow = parseInt(moment(this.listScheds[item['asesor']][item['date']]['data']['js']).format('e'))

      let it = JSON.parse(JSON.stringify(this.listScheds[item['asesor']][item['date']]['data']))
      delete it.Nombre
      delete it.aus
      delete it.id

      dowArr[dow].push(it)
    }

    for(let i = moment(this.inicioCopy); i <= moment(this.finCopy); i.add(1,'days') ){
      let dow = parseInt(i.format('e'))

      for( let item of dowArr[dow] ){
        let tmp = JSON.parse(JSON.stringify(item))
        tmp['Fecha'] = i.format('YYYY-MM-DD')
        for( let f of hs ){
          if( tmp[f] != null){
            tmp[f] = dow != parseInt(moment(tmp[f]).format('e')) ? moment(`${i.clone().add(1,'days').format('YYYY-MM-DD')} ${moment(tmp[f]).format('HH:mm:ss')}`).format('YYYY-MM-DD HH:mm:ss') : moment(`${i.clone().format('YYYY-MM-DD')} ${moment(tmp[f]).format('HH:mm:ss')}`).format('YYYY-MM-DD HH:mm:ss')
          }
        }

        finalArr.push(tmp)
      }
    }

    this.uploadChanges( finalArr, 'copySave' )

  }

  getPdvs(){
    this.loading['pdvs'] = true

    this._api.restfulGet( `MX/${moment().format('MM')}/${moment().format('YYYY')}/0`, 'Lists/pdvMetas')
        .subscribe( res => {

          this.loading['pdvs'] = false
          let data = []

          for( let item of res['data'] ){
            data.push({ id: item['id'], text: `${item['displayNameShortOk']} (${ item['Ciudad'] })` })
          }

          this.pdvList = data

        }, err => {
          console.log('ERROR', err)
          this.loading['pdvs'] = false
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)
        })
  }

  selectedVal( asesor, item, val ){
    this.listScheds[asesor][item]['data']['pdv'] = val.value
    this.listScheds[asesor][item]['change'] = true
    console.log(val)
    console.log(this.listScheds[asesor][item]['data'])
  }

}
