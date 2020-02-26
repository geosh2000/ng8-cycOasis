import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { ApiService, InitService, TokenCheckService } from '../../services/service.index';

import { CompleterService, CompleterData } from 'ng2-completer';

declare var jQuery:any;
import * as Globals from '../../globals';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment-timezone';
import { DasboardVentaFcComponent } from '../dashboard/dasboard-venta-fc/dasboard-venta-fc.component';
import { DasboardComisionesComponent } from '../dashboard/dasboard-comisiones/dasboard-comisiones.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnChanges {

  currentUser:any
  showContents:boolean = false
  mainCredential:string = 'default'
  birthday:any = false

  @Input() tokenStatus:boolean
  @ViewChild(DasboardVentaFcComponent, {static: false}) _gphVenta:DasboardVentaFcComponent
  @ViewChild(DasboardComisionesComponent, {static: false}) _comision:DasboardComisionesComponent

  token:boolean
  asesorShow:any
  depAsesorShow:Object = {
    dep: '',
    puesto: '',
    name: '',
    zona: ''
  }
  nameShow:any = 'Yo'
  dataGraph:Object = {}
  dataParams:Object = {
    mes: moment().format('MM'),
    anio: moment().format('YYYY')
  }

  loading:Object = {}
  graphIndex:any = 'normal'

  protected searchStrName:string;

  protected onSelected( item ){
    this.asesorShow = item.asesor
    this.depAsesorShow = {
      dep: item.depDep,
      puesto: item.depPuesto,
      name: item.Nombre,
      zona: ''
    }
    this.nameShow = item.nCorto
    this.getBD( item.asesor )
    this.changeHome()
    this._gphVenta.getData( false, item.asesor)
    this._comision.getData( item.asesor)
  }

  constructor( private _api:ApiService,
                public _init:InitService,
                private _tokenCheck:TokenCheckService,
                private toastr:ToastrService
              ) {

    this.currentUser = this._init.getUserInfo()

    this.showContents = this._init.checkCredential( this.mainCredential, true )


    // console.log(this.currentUser)

    this.asesorShow = this.currentUser.hcInfo.id
    this.nameShow = this.currentUser.hcInfo['Nombre_Corto']
    this.depAsesorShow = {
      dep: this.currentUser.hcInfo.dep,
      puesto: this.currentUser.hcInfo.puesto,
      name: this.currentUser.hcInfo.Nombre,
      zona: ''
    }

    this.token = this.tokenStatus

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {
          this.token = res.status

          if( res.status ){
            this.showContents = this._init.checkCredential( this.mainCredential, true )
          }else{
            this.showContents = false
            jQuery('#loginModal').modal('show');
          }
        })

      this.getBD()
      console.log(this.currentUser)

  }

  ngOnInit() {
    this.changeHome()
  }

  changeHome(){
    if( this.depAsesorShow['dep'] == 29 ){

      let index = ''
      switch( this.depAsesorShow['puesto'] ){
        case '11':
        case '45':
        case '48':
          this.graphIndex = 'supPdv'
          break;
        case '17':
          this.graphIndex = 'coordinador'
          this.getZone()
          break;
        default:
          this.graphIndex = 'asesor'
          break;
      }

      this.getGraphPdv()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.token = this.tokenStatus
  }

  getToken(){
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = currentUser
    console.log(this.currentUser)
  }

  userToName( user ){
    let name = user.replace( /[\.]/gmu, ' ')
    return name
  }

  getBD( asesor? ){
    this._api.restfulGet( asesor ? asesor : '','Asesores/bd' )
              .subscribe( res =>{
                this.birthday = res['data'] == '1' ? true : false
              },
                (err) => {
                  let error = err
                  console.error(`${ error }`);
              });
  }

  test(){

    let params = {
      'fields': {
         'project':
         {
            'key': 'HELP'
         },
         'summary': 'Cambio de Rol oscar.espinosa (prueba)',
         'issuetype': {
            'name': 'Cambio de puesto'
         },
         'customfield_12902' : { 'name':'oscar.espinosa'},  // Usuario Afectado
         'customfield_12900': 'Ventas In',  // Perfil Origen
         'customfield_12901': 'Ventas Out'  // Perfil Nuevo
     }
    }

    this._api.helpPost( params, '' )
        .subscribe( res =>{
          console.log(res)
        },
          (err) => {
            let error = err
            console.error(`${ error }`);
        });

  }


  getGraphPdv(){
    this.loading['pdvGraph'] = true

    this._api.restfulGet( `${moment().format('MM')}/${moment().format('YYYY')}`, 'Venta/avancePdvMes' )
            .subscribe( res => {

              this.loading['pdvGraph'] = false

              this.dataGraph = res['data']

            }, err => {
              console.log('ERROR', err)

              this.loading['pdvGraph'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })

  }

  getZone(){
    this.loading['zone'] = true

    this._api.restfulPut( {name: this.depAsesorShow }, 'Lists/individualZone' )
            .subscribe( res => {

              this.loading['zone'] = false

              this.depAsesorShow['zona'] = res['data']['nombreZona']

            }, err => {
              console.log('ERROR', err)

              this.loading['zone'] = false

              let error = err.error
              this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
              console.error(err.statusText, error.msg)

            })

  }

}
