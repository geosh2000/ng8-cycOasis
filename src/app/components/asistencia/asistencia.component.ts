import { Component, OnInit, ViewChild, ViewContainerRef, Input, ChangeDetectorRef } from '@angular/core';
import { PopoverModule } from 'ngx-popover';
import { DaterangepickerConfig, DaterangePickerComponent } from 'ng2-daterangepicker';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AddAusentismoComponent } from '../formularios/add-ausentismo.component';
import { PyaExceptionComponent } from '../formularios/pya-exception.component';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook, read } from 'xlsx';

import * as Globals from '../../globals';
declare var jQuery:any;
// import * as moment from 'moment';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styles: ['input[type=checkbox]{ cursor: pointer}']
})
export class AsistenciaComponent implements OnInit {

  @ViewChild( DaterangePickerComponent,{static:false} ) private picker: DaterangePickerComponent
  @ViewChild( AddAusentismoComponent,{static:false} ) _aus: AddAusentismoComponent
  @ViewChild( PyaExceptionComponent,{static:false} ) _pya:PyaExceptionComponent

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'tablas_f'

  filterExpanded:boolean = false
  selectedAsesores:any = []

  loading:boolean = false
  showProgress:boolean = false

  asistData:any
  datesData:any
  deps:any
  searchBy:boolean = true

  private depsSubject = new Subject<any>();
  private asistSubject = new Subject<any>();

  orederedKeys:any
  shownDom:any = []
  depLoaders:any = {}
  depLoadFlag:boolean = false

  showOpts:Object = {
    ch_jornada:   true,
    ch_comida:    false,
    ch_excep:     true,
    ch_excep_p:    false,
    ch_ret:       false,
    ch_sa:        false,
    ch_x:        false,
    ch_x_p:        false,
    sh_p:        false,
    sh_d:        false
  }

  today:any = moment()

  searchCriteria:Object = {
    start:  this.today.subtract(15, 'days').format('YYYY-MM-DD'),
    end:    this.today.add(15, 'days').format('YYYY-MM-DD'),
    value:  '',
    skill:  ''
  }

  searchFilter:string = ''

  searchFields:any = [
    'Nombre', 'PuestoName', 'Departamento'
  ]

  error:string = null

  constructor(
                private _dateRangeOptions: DaterangepickerConfig,
                private _api:ApiService,
                private _init:InitService,
                private _tokenCheck:TokenCheckService,
                public toastr: ToastrService,
                private cd: ChangeDetectorRef
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

    this.searchCriteria['value']= `${this.searchCriteria['start']} - ${this.searchCriteria['end']}`

    this._dateRangeOptions.settings = {
      autoUpdateInput: true,
      locale: { format: 'YYYY-MM-DD' }
    }

    this.loadDeps()
    moment.locale('es-MX')

  }

  searchAsistencia( dep, inicio, fin ){
    if( dep != 'MX' && dep != 'CO' ){
      this.depLoadFlag = false
      this.getAsistencia( dep, inicio, fin )
    }else{
      this.depLoadFlag = true
      this.asistData = {}
      this.datesData = []
      this.depLoaders = {}

      for( let pcrc of this.deps ){
        if( pcrc.id != 29 && pcrc.id != 56 && pcrc.sede == dep ){
          this.depLoaders[pcrc.Departamento] = true
          let params = `${pcrc.id}/${inicio}/${fin}`
          this.getAllDeps( pcrc, params, () => {
            this.orderNames( this.asistData, 1)
          })
        }

      }

      this.orderNames( this.asistData, 1)
    }
  }

  getAllDeps( pcrc, params, callback ){
    this._api.restfulGet( params, 'Asistencia/pya' )
            .subscribe( res =>{
              this.depLoaders[pcrc.Departamento] = false
              if( res['data'] != null ){
                Object.assign(this.asistData,res['data']);
                this.datesData = (res['Fechas'])
              }
              callback()

            },
              (err) => {
                this.error = err
                this.depLoaders[pcrc.Departamento] = false
                this.toastr.error(`${ this.error }`, 'Error!');
                callback()
            });
  }

  getAsistencia( dep, inicio, fin, asesor?:any, flag=false ){

      this.filterExpanded = false
      this.searchFilter = ''
      let params = {
        dep     : dep ,
        inicio  : inicio ,
        fin     : fin ,
        asesor  : asesor ,
        noSup   : null ,
        order   : null ,
      }

      if( asesor ){
        if( !flag ){
          this.asistData[asesor]['data'][inicio]['loading'] = true
        }else{
          this.loading = true
        }
      }else{
        this.loading = true
      }

      this._api.restfulPut( params, 'Asistencia/pya' )
              .subscribe( res =>{

                if( asesor && !flag){
                  // console.log( res )
                  this.singleUpdate( res )
                }else{
                  this.asistSubject.next({ res })
                }

              },
                (err) => {
                  this.error = err
                  this.loading = false
                  this.toastr.error(`${ this.error }`, 'Error!');
              });


  }

  singleUpdate( data ){
    for( let asesor in data.data ){
      // tslint:disable-next-line:forin
      for(let fecha in data.Fechas ){
        this.asistData[ asesor ]['data'][ fecha ] = data.data[ asesor ][ 'data' ][ fecha ]
      }
    }

  }

  compareDates( date ){
    let header = moment(date)
    let td = moment( this.today.format('YYYY-MM-DD') )

    if(header >= td){
      return false
    }else{
      return true
    }

  }

  loadDeps(){
    this._api.restfulGet( '','Headcount/deps' )
            .subscribe( res => {
              this.depsSubject.next({ res })
            })
  }

  @Input() loadData(): Observable<any>{
    return this.asistSubject.asObservable();
  }

  @Input() getDeps(): Observable<any>{
    return this.depsSubject.asObservable();
  }


  setVal( inicio, fin ){
    this.searchCriteria['start'] = inicio.format('YYYY-MM-DD')
    this.searchCriteria['end'] = fin.format('YYYY-MM-DD')
  }

  pcrcChange( select ){
    this.searchCriteria['skill']=event.target['value']
  }

  applyFilter( rac ){


    if(this.searchFilter == ''){
      return true
    }

    for(let item of this.searchFields){
      if(rac[item].toLowerCase().includes(this.searchFilter.toLowerCase())){
        return true
      }
    }

    return false
  }


  ngOnInit() {

    this.getDeps()
        .subscribe( res => {
          this.deps = res.res
          // console.log( res.res )
          this.cd.markForCheck()
        })

    this.loadData()
        .subscribe( res => {
          this.asistData = res.res['data']
          this.datesData = res.res['Fechas']
          this.orderNames( this.asistData, 1)
          this.loading = false

          // console.log( res.res )
          // console.log( this.asistData )
          this.cd.markForCheck()
        })
  }

  printTimeInterval(date, start, end){
    let inicio =    moment.tz(`${date} ${start}`, 'this._zh.defaultZone')
    let fin =       moment.tz(`${date} ${end}`, 'this._zh.defaultZone')
    let inicioCUN = inicio.clone().tz('America/Bogota')
    let finCUN =    fin.clone().tz('America/Bogota')

    let result = `${inicioCUN.format('HH:mm')} - ${finCUN.format('HH:mm')}`

    return result
  }

  printTime(date, time){
    let tiempo =    moment.tz(`${date} ${time}`, 'this._zh.defaultZone')
    let tiempoCUN =    tiempo.clone().tz('America/Bogota')

    let result = tiempoCUN.format('HH:mm:ss')

    return result
  }

  formatDate(datetime, format){
    let time = moment.tz(datetime, 'this._zh.defaultZone')
    let cunTime = time.clone().tz('America/Bogota')

    return cunTime.format(format)
  }

  orderNames( data, ord=1 ){

    // console.log(data)

    let sortArray:any   = []
    let tmpSlot:any     = []
    let flag:boolean
    let pushFlag:boolean
    let x:number
    let lastInput:any
    let compare:any = []

    for(let id in data){
      if(sortArray.length == 0){
        sortArray[0] = id
      }else{
        flag = false
        for(x=0; x<sortArray.length; x++){
          if(!flag){

            if(ord == 1){
              compare[1] = data[id]['Nombre']
              compare[2] = data[sortArray[x]]['Nombre']
            }else{
              compare[1] = data[sortArray[x]]['Nombre']
              compare[2] = data[id]['Nombre']
            }
            if(compare[1] < compare[2]){
              tmpSlot[0]      = sortArray[x]
              sortArray[x]    = id
              flag            = true

              if(x == (sortArray.length)-1){
                pushFlag=true
                lastInput = tmpSlot[0]
              }
            }else{
              if(x == (sortArray.length)-1){
                pushFlag=true
                lastInput = id
              }
            }
          }else{
            tmpSlot[1]      = sortArray[x]
            sortArray[x]    = tmpSlot[0]
            tmpSlot[0]      = tmpSlot[1]
          }
        }

        if(pushFlag){
          sortArray.push(lastInput)
        }
      }

    }

    this.orederedKeys = sortArray
  }

  ausentNotif( event ){
    this.toastr.error(`${ event.msg }`, `${ event.title.toUpperCase() }!`);
  }

  perCumplimiento( rac, date, log ){

    let inicio = this.asistData[rac].data[date][`${log}s`]
    let fin    = this.asistData[rac].data[date][`${log}e`]
    let ji     = this.asistData[rac].data[date][`${log}_login`]
    let jf     = this.asistData[rac].data[date][`${log}_logout`]

    if( inicio == null  ||
        fin == null     ||
        ji == null      ||
        jf == null ){
      return 0
    }

    let s   = moment( inicio )
    let e   = moment( fin )
    let js  = moment( ji )
    let je  = moment( jf )

    let total = e.diff(s, 'seconds')

    let did = je.diff(js, 'seconds')
    let result:number = did / total * 100
    return (Math.floor(result))
  }

  timeDateXform( time ){
    let td = moment(time)
    if( td < moment(`${moment().format('YYYY-MM-DD')} 05:00:00`)){
      return td.add(1, 'days')
    }else{
      return td
    }
  }

  showDom(rac, date, block){
    if(this.checkSet(rac, date, block)){
      this.shownDom[`${rac}_${date}_${block}`] = undefined
    }else{
      this.shownDom[`${rac}_${date}_${block}`] = true
    }
  }

  checkSet(rac, date, block){
    if(this.isset(this.shownDom,`${rac}_${date}_${block}`)){
      return true
    }else{
      return false
    }
  }

  isset (a, name ) {
    let is = true
    if ( a[name] == undefined || a[name] == '' || a[name] == null ) {
            is = false
        }
    return is;
  }

  progressProps( val, originalBg = 'primary' ){

    let bar: string
    let border: string

    if(val<60){
      bar    = 'danger'
    }else if(val<100){
      bar    = 'warning'
    }else{
      bar    = 'success'
    }

    if(originalBg == bar){
      border = 'light'
    }else{
      border = bar
    }

    return {bar: bar, border: border, val: val}
  }


  excStatus( event ){
    if( !event.status ){
      let error = event.error.json()
      this.toastr.error( error.msg, `Error ${event.error.status} - ${event.error.statusText}` )

      if( error.Existente ){
        console.error('Ausentismo existente: ', error.Existente)
      }

      if( error.errores ){
        console.error('Ausentismo existente: ', error.errores)
      }
    }else{
      this.toastr.success( event.error.msg, `Guardado` )
      this.getAsistencia( this.searchCriteria['skill'] ? this.searchCriteria['skill'] : 0, event.fecha, event.fecha, [event.asesor] )

    }
  }

  downloadXLS( id, title ){
    this.toXls( id, title )
  }

  toXls( sheets, title ){
    let wb = utils.table_to_book(document.getElementById(sheets), {raw: false});

    let newSheets = {
      jornada: JSON.parse(JSON.stringify(wb.Sheets['Sheet1'])),
      extra: JSON.parse(JSON.stringify(wb.Sheets['Sheet1'])),
      excepciones: JSON.parse(JSON.stringify(wb.Sheets['Sheet1'])),
      retardos: JSON.parse(JSON.stringify(wb.Sheets['Sheet1']))
    }

    // tslint:disable-next-line:forin
    for( let cell in wb.Sheets['Sheet1']){
      // tslint:disable-next-line:max-line-length
      let j = wb.Sheets['Sheet1'][cell].v, x2 = wb.Sheets['Sheet1'][cell].v, x1 = wb.Sheets['Sheet1'][cell].v, he = wb.Sheets['Sheet1'][cell].v, r = wb.Sheets['Sheet1'][cell].v, e = wb.Sheets['Sheet1'][cell].v

      let compare = {}
      if( cell.match(/^[A-D]{1}[0-9]*$/g) || cell.match(/^[A-Z]*[1]{1}$/g) ){
        newSheets['jornada'][cell] = wb.Sheets['Sheet1'][cell]
        newSheets['extra'][cell] = wb.Sheets['Sheet1'][cell]
        newSheets['excepciones'][cell] = wb.Sheets['Sheet1'][cell]
        newSheets['retardos'][cell] = wb.Sheets['Sheet1'][cell]
      }else{
        if( cell.match(/^[A-Z]*[0-9]*$/g)){
          if( j.match(/[j]:/g) ){
            let jornada = j.match(/(([j]:[ ]*[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2})|([j]:[ ]*[a-zA-Z\-]*))/gm)
            if( jornada ){
              newSheets['jornada'][cell].v = jornada[0].replace('j:','').trim()
            }else{
              newSheets['jornada'][cell].v = '-'
            }
          }else{
            newSheets['jornada'][cell].v = '*'
          }

          if( x1.match(/[x]:/g) ){
            let extra1 = x1.match(/([x]:[ ]*[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2})/gm)
            if( extra1 ){
              newSheets['extra'][cell].v = extra1[0].replace('x:','').trim()
            }else{
              newSheets['extra'][cell].v = '-'
            }

            if( x2.match(/((-->[ ]*\W[ ]*[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}))/g) ){
              let extra2 = x2.match(/-->[ ]*\W[ ]*[0-9]{2}:[0-9]{2} - [0-9]{2}:[0-9]{2}/gm)
              if( extra2 ){
                newSheets['extra'][cell].v = newSheets['extra'][cell].v + '\r\n' + extra2[0].replace('-->','').trim()
                newSheets['extra'][cell].t = 'h'
              }
            }

          }else{
            newSheets['extra'][cell].v = ''
          }

          if( e.match(/[e]:/g) ){
            let excep = e.match(/[e]:[ ]*[a-zA-Z\-]*/gm)
            if( excep ){
              newSheets['excepciones'][cell].v = excep[0].replace('e:','').trim()
            }else{
              newSheets['excepciones'][cell].v = '-'
            }
          }else{
            newSheets['excepciones'][cell].v = ''
          }

          if( r.match(/[r]:/g) ){
            let rts = r.match(/[r]:[ ]*[a-zA-Z\-]*/gm)
            if( rts ){
              newSheets['retardos'][cell].v = rts[0].replace('r:','').trim()
            }else{
              newSheets['retardos'][cell].v = '-'
            }
          }else{
            newSheets['retardos'][cell].v = ''
          }

        }
      }
    }

    wb.SheetNames[0]='Jornadas'
    delete wb.Sheets['Sheet1']

    wb.SheetNames.push('Excepciones')
    wb.SheetNames.push('Retardos')
    wb.SheetNames.push('Extra')

    wb.Sheets['Jornadas']   = newSheets['jornada']
    wb.Sheets['Extra']   = newSheets['extra']
    wb.Sheets['Excepciones']= newSheets['excepciones']
    wb.Sheets['Retardos']   = newSheets['retardos']

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${title}.xlsx`)
  }


  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }

  tst(){
    console.log(this.asistData)
  }

  sRep( input ){
    return input.toLowerCase()
              .replace(/á/gm,'a')
              .replace(/é/gm,'e')
              .replace(/í/gm,'i')
              .replace(/ó/gm,'o')
              .replace(/ú/gm,'u')
              .replace(/ñ/gm,'n')
  }

  hxSave( event ){
    if( event.status ){
      this.toastr.success(`${ event.msg }`, 'Success!');
    }else{
      this.toastr.error(`${ event.msg }`, 'Error!');
    }
  }

}
