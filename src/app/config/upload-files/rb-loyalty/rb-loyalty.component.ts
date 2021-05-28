import { Component, OnInit, Input } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as Globals from '../../../globals';
import * as moment from 'moment-timezone';
import { element } from 'protractor';

@Component({
  selector: 'app-rb-loyalty',
  templateUrl: './rb-loyalty.component.html',
  styleUrls: ['./rb-loyalty.component.css']
})
export class RbLoyaltyComponent implements OnInit {

  rbList:any = []
  loading:Object = {}

  summary:Object = {}
  allRegs = 0

  // Suggested 5000
  maxRegs = 5000
  progress = []
  uploadArr = []

  constructor(public _api: ApiService,
              public _init:InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  buildVouchers( json ){
    console.log('build loyalty start')
    this.progress = []
    this.loading['roiback'] = true

    this.summary = { 
        total: 0,
        mail_subsriber_true: 0,
        mail_subsriber_false: 0
       }

    this.allRegs = 0

    this.rbList = []
    let cielo = [[]]
    let index = 0
    let i = 0
    let reg = 0

    for( let r of json ){

      // SKIP NULL MAILS
      if( r['Correo electrónico'] == '' ){
        continue
      }

      // SPLIT BATCH TO UPLOAD
      if( i == this.maxRegs ){
        cielo.push([])
        index++
        i = 0
      }

      // // STOP READING
      // if( i == this.maxRegs ){
      //   this.summary = cielo
      //   this.rbList = cielo
      //   this.loading['roiback'] = false
      //   return true
      // }

      let fnacimiento = typeof r['Fecha de nacimiento (YYYY-MM-DD)'] != 'number' ? String(r['Fecha de nacimiento (YYYY-MM-DD)']).split('/') : []
      let lastStay = typeof r['Última estancia'] != 'number' ? String(r['Última estancia']).split('/') : []
      let dtCreated = typeof r['Alta'] != 'number' ? String(r['Alta']).split('/') : []

      if( dtCreated ){
        let dtTime = (String(dtCreated[2]).substring(5,100).split(':') )
        dtCreated[2] = String(dtCreated[2]).substring(0,4)
        dtCreated.push(dtTime[0])
        dtCreated.push(dtTime[1])
        dtCreated.push(dtTime[2])
      }

      let registry = {
        id: r['Id'],
        nombre: r['Nombre'],
        apellido: r['Apellidos'],
        dni: r['DNI'],
        correo: r['Correo electrónico'],
        contrasena: r['Contraseña'],
        telefono: r['Teléfono'],
        direccion: r['Dirección'],
        ciudad: r['Ciudad'],
        provincia: r['Provincia'],
        cp: r['Cod Postal'],
        pais: r['País'],
        alta: typeof(r['Alta']) == 'number' ? this.excelDate(r['Alta']) : moment(`${dtCreated[2]}-${parseInt(dtCreated[1])}-${dtCreated[0]} ${dtCreated[3]}:${dtCreated[4]}:${dtCreated[5]}`).format('YYYY-MM-DD HH:mm:ss'),
        idioma: r['Idioma alta'],
        origen: r['Origen alta'],
        proyecto: r['Proyecto alta'],
        url_alta: r['URL alta'],
        codigo: r['Código del nivel'],
        nombre_del_nivel: r['Nombre del nivel'],
        fecha_nacimiento: r['Fecha de nacimiento (YYYY-MM-DD)'] == "" || r['Fecha de nacimiento (YYYY-MM-DD)'] == null ? null : (typeof(r['Fecha de nacimiento (YYYY-MM-DD)']) == 'number' ? this.excelDate(r['Fecha de nacimiento (YYYY-MM-DD)']) : moment(`${fnacimiento[2]}-${parseInt(fnacimiento[1])}-${fnacimiento[0]}`).format('YYYY-MM-DD')),
        loyalty_id: r['Loyalty ID'],
        tarjeta: r['Tarjeta'],
        idioma_2: r['idioma'],
        mail_subscriber: r['Quiero recibir información comercial'] == false ? 0 : 1,
        no_rsvas: r['Núm. Reservas'],
        no_rsvas_disfrutadas: r['Núm. reservas disfrutadas'],
        no_noches: r['Núm. noches'],
        no_noches_disfrutadas: r['Núm. noches disfrutadas'],
        ttv: r['TTV'],
        ttv_gastado: r['TTV gastado'],
        ultima_estancia: r['Última estancia'] == "" || r['Última estancia'] == null ? null : (typeof(r['Última estancia']) == 'number' ? this.excelDate(r['Última estancia']) : moment(`${lastStay[2]}-${parseInt(lastStay[1])}-${lastStay[0]}`).format('YYYY-MM-DD')),
      }
      cielo[index].push(registry)
      i++

      // console.log(i, r['Id'])
      this.summary['total']++
      this.summary['mail_subsriber_true'] += registry['mail_subscriber'] == 1 ? 1 : 0
      this.summary['mail_subsriber_false'] += registry['mail_subscriber'] == 1 ? 0 : 1

      this.allRegs++
    }

    this.rbList = cielo
    this.loading['roiback'] = false

  }

  validateText( t, trim, nt){
    return t ? (trim ? String(t).trim() : (t == ' ' ? null : t)) : nt
  }

  submitChanges( ){
    this.progress = []
    let arr = this.rbList
    // console.log(arr)

    for( let d of arr ){
      this.progress.push({s:0,l:0})
    }

    this.uploadArr = arr
    this.submit(arr, 0)

  }

  submit( d, i ){
    this.loading['uploading'] = true
    this.progress[i]['s'] = 1

    this._api.restfulPut( d[i], 'Uploads/saveRbLoyalty')
            .subscribe( res => {

              this.toastr.success('Done!', res['msg'])
              this.loading['uploading'] = false

              this.progress[i]['s'] = 2
              this.progress[i]['l'] = res['data'].length
              i++
              if( i < d.length ){
                this.submit( d, i )
              }
            },
            err => {
              this.loading['uploading'] = false
              const error = err.error;
              this.toastr.error( err, 'Error' )
              this.progress[i]['s'] = 3

              for(let x = i;i<d.length;i++){
                this.progress[i]['s'] = 3
              }

              console.error(err.statusText, error.msg);
            });

  }

  excelDate( excelDate, dtime = false ) {

    if( excelDate == null || excelDate == '' ){
      return null
    }

    if( dtime ){
      return moment(new Date((Math.round(excelDate) - (25567 + 1))*86400*1000).toLocaleDateString('en-US'), 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    }else{
      return moment(new Date((Math.round(excelDate) - (25567 + 1))*86400*1000).toLocaleDateString('en-US'), 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
  }

}
