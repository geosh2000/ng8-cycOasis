import { Component, OnInit } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-cc-super-assign',
  templateUrl: './cc-super-assign.component.html',
  styles: [`
    .dragOver {
      background: #12479b;
      color: white
    }

    .overlay {
      position: absolute;
      top: 0px;
      left:  0px;
      z-index:  50;
      background:  rgba(0,0,0,0.2);
      width:  100%;
      height: 100%;
    }

    .loading-container {
        position:  absolute;
        top: 150px;
        left: 50%;
        width: 375px;
        background: white;
        margin-left: -187.5px;
        text-align: center;
        box-shadow: 0px 0px 2px 1px black;
        z-index: 51;
    }
 `]
})
export class CcSuperAssignComponent implements OnInit {

  currentUser: any
  showContents:boolean = false
  mainCredential:string = 'config_supAsignCC'

  loading:Object = {}

  singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: 'left',
    locale: {
      format: 'YYYY-MM-DD'
    }
  }

  selectOptions:Select2Options = {
    multiple: true,
  }

  selectedDate:any
  selectedCountry:any
  selectedSups:any = []
  supListFilter:any = []
  filterText:any = ''

  asesorList:any = []
  asesorAssign:Object = {}
  supList:any = []
  itemsIndex:Object = {}

  constructor(public _api: ApiService,
        public _init:InitService,
        private titleService: Title,
        private _tokenCheck:TokenCheckService,
        public toastr: ToastrService) {

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
    this.titleService.setTitle('CyC - CC Asignación Supervisores');

    this.selectedDate = moment().format('YYYY-MM-DD')
  }

  setDate( val ){
    this.selectedDate = val.format('YYYY-MM-DD')
  }

  search(){
    this.getSupList()
  }

  buildAssign(data){
    let result = {
      'none': []
    }

    for( let item of this.supList ){
      if( !result[item['asesor']] ){
        result[item['asesor']] = []
      }
    }

    for( let item of data ){

      if( item['Supervisor'] ){
        if( !result[item['Supervisor']] ){
          result['none'].push(item)
        }else{
          result[item['Supervisor']].push(item)
        }

      }else{
        result['none'].push(item)
      }
    }

    this.asesorAssign = result
    this.indexItems()

  }

  indexItems(){
    // tslint:disable-next-line:forin
    for( let ind in this.asesorAssign ){
      for( let item of this.asesorAssign[ind] ){
        this.itemsIndex[item['asesor']] = ind
      }
    }
  }

  getSupList(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.selectedCountry}/${this.selectedDate}`,'Lists/ccSupList' )
              .subscribe( res => {

                let supListFilter = []

                for( let sup of res['data'] ){
                  let tmp = {
                    id: sup['asesor'],
                    text: sup['NombreCompleto']
                  }
                  supListFilter.push(tmp)
                }

                this.supList = res['data']
                this.supListFilter = supListFilter
                this.getModules()

              }, err => {
                console.log('ERROR', err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  getModules(){
    this.loading['data'] = true

    this._api.restfulGet( `${this.selectedCountry}/${this.selectedDate}`,'Lists/ccAsesoresSupList' )
              .subscribe( res => {

                this.loading['data'] = false

                this.asesorList = res['data']
                this.buildAssign(res['data'])

              }, err => {
                console.log('ERROR', err)

                this.loading['data'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  selectedVal( val ){
    this.selectedSups = val.value
  }

  isFilter( name ){
    if( this.filterText.trim().length < 3 ){
      return true
    }

    let text = this.cleanSt(name)

    if(this.filterText.trim() == ''){
      return true
    }else{
      let words = this.filterText.split()
      for( let word of words ){
        if( name.toLowerCase().indexOf( this.cleanSt(word) ) >= 0 ){
          return true
        }
      }
    }

    return false
  }

  cleanSt(cadena){
    // Definimos los caracteres que queremos eliminar
    let specialChars = '!@#$^&%*()+=-[]\/{}|:<>?,.';

    // Los eliminamos todos
    for (let i = 0; i < specialChars.length; i++) {
        cadena= cadena.replace(new RegExp('\\' + specialChars[i], 'gi'), '');
    }

    // Lo queremos devolver limpio en minusculas
    cadena = cadena.toLowerCase();

    // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
    cadena = cadena.replace(/á/gi,'a');
    cadena = cadena.replace(/é/gi,'e');
    cadena = cadena.replace(/í/gi,'i');
    cadena = cadena.replace(/ó/gi,'o');
    cadena = cadena.replace(/ú/gi,'u');
    cadena = cadena.replace(/ñ/gi,'n');
    return cadena;
 }

  onItemDrop(e: any, target) {

    let origin = this.itemsIndex[e.dragData['asesor']]

    if( this.asesorAssign[target].indexOf(e.dragData) == -1 ){

      this.assign( e.dragData['asesor'], target,
        () => {
          this.toastr.success('Movimiento Guardado')
          let index = this.asesorAssign[origin].indexOf( e.dragData )
          this.asesorAssign[origin].splice(index,1)

          // add to target
          this.asesorAssign[target].push(e.dragData);
          this.itemsIndex[e.dragData['asesor']] = target
      })

    }

  }

  assign(id, sup, callback){

    this.loading['assign'] = true

    let params = {
      Fecha: this.selectedDate,
      asesor: id,
      supervisor: sup
    }

    this._api.restfulPut( params,'Config/ccSupAssign' )
              .subscribe( res => {

                this.loading['assign'] = false

                callback()

              }, err => {
                console.log('ERROR', err)

                this.loading['assign'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

                return false

              })

  }

}
