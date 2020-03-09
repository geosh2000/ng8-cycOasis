import { Component, OnInit, Input } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as Globals from '../../../globals';
import * as moment from 'moment-timezone';
import { element } from 'protractor';

@Component({
  selector: 'app-cielo-llegadas',
  templateUrl: './cielo-llegadas.component.html',
  styleUrls: ['./cielo-llegadas.component.css']
})
export class CieloLlegadasComponent implements OnInit {

  cieloList:any = []
  loading:Object = {}
  complejo:Object = {
    OLITE: 'CANCUN',
    GOC: 'CANCUN',
    PYR: 'CANCUN',
    OT: 'TULUM',
    SENS: 'SENS',
    SKGS: 'SENS',
    GOT: 'TULUM',
    OPB: 'PALM',
    GSC: 'PALM',
    GOP: 'PALM',
    SMART: 'SMART',
    OH: 'SMART',
    GOTSK: 'TULUM'
  }
  summary:Object = {
    total: 0,
    OLITE: { c:0,n:0,R:0,B:0,S:0 },
    GOC: { c:0,n:0,R:0,B:0,S:0 },
    PYR: { c:0,n:0,R:0,B:0,S:0 },
    OT: { c:0,n:0,R:0,B:0,S:0 },
    SENS: { c:0,n:0,R:0,B:0,S:0 },
    SKGS: { c:0,n:0,R:0,B:0,S:0 },
    GOT: { c:0,n:0,R:0,B:0,S:0 },
    OPB: { c:0,n:0,R:0,B:0,S:0 },
    GSC: { c:0,n:0,R:0,B:0,S:0 },
    GOP: { c:0,n:0,R:0,B:0,S:0 },
    SMART: { c:0,n:0,R:0,B:0,S:0 },
    OH: { c:0,n:0,R:0,B:0,S:0 },
    GOTSK: { c:0,n:0,R:0,B:0,S:0 }
  }

  constructor(public _api: ApiService,
              public _init:InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  buildVouchers( json ){

    this.loading['cielo'] = true

    this.summary = {
      total: 0,
      OLITE: { c:0,n:0,R:0,B:0,S:0 },
      GOC: { c:0,n:0,R:0,B:0,S:0 },
      PYR: { c:0,n:0,R:0,B:0,S:0 },
      OT: { c:0,n:0,R:0,B:0,S:0 },
      SENS: { c:0,n:0,R:0,B:0,S:0 },
      SKGS: { c:0,n:0,R:0,B:0,S:0 },
      GOT: { c:0,n:0,R:0,B:0,S:0 },
      OPB: { c:0,n:0,R:0,B:0,S:0 },
      GSC: { c:0,n:0,R:0,B:0,S:0 },
      GOP: { c:0,n:0,R:0,B:0,S:0 },
      SMART: { c:0,n:0,R:0,B:0,S:0 },
      OH: { c:0,n:0,R:0,B:0,S:0 },
      GOTSK: { c:0,n:0,R:0,B:0,S:0 }
    }

    this.cieloList = []
    let cielo = []

    for( let r of json ){
      let rsv = {
        rsva: r['RESERV'],
        hotel: r['SIGLA'],
        complejo: this.complejo['SIGLA'],
        mdo: r['MAYORIST'],
        agencia: r['AGENCIA'],
        grupo: r['GRUPO'],
        e: r['S'] != 'C' ? r['S'] : (r['UCANCELA'] == 'NOSHOWS' ? 'n' : 'c'),
        nombre: `${r['APELLIDO1']} ${r['NOMBRE1']}`,
        adultos: r['ADULTOS'],
        juniors: r['JUNIOR'],
        menores: r['MENORES'],
        llegada: this.ExcelDateToJSDate(r['LLEGADA']),
        noches: r['NOCHES'],
        salida: this.ExcelDateToJSDate(r['SALIDA']),
        notas: r['NOTAS'],
        voucher: r['VOUCHER'],
        total: r['IMPORTE'],
        mon: r['MON'],
        tipocambio: r['TIPOCAMBIO'],
        hab: r['HABI'],
        dtCreated: this.ExcelDateToJSDate(r['FECHACAP']),
        userCreated: r['USUARIOCAP'],
        rp_char01: r['TARIF'],
        pais: r['MX'],
        origen: r['GR'],
        dtCancel: r['S'] == 'C' ? this.ExcelDateToJSDate(r['FCANCELA']) : null,
        userCancel: r['UCANCELA'],
        userComision: r['JESSICA'],
        guest1_apellido: r['APELLIDO1'],
        guest1_nombre: r['NOMBRE1'],
        guest2_apellido: r['APELLIDO2'],
        guest2_nombre: r['NOMBRE2'],
        guest3_apellido: r['APELLIDO3'],
        guest3_nombre: r['NOMBRE3'],
        guest4_apellido: r['APELLIDO4'],
        guest4_nombre: r['NOMBRE4'],
        bedType: r['C'],
      }
      cielo.push(rsv)

      this.summary['total']++
      this.summary[r['SIGLA']][rsv['e']]++
    }

    this.cieloList = cielo
    this.loading['cielo'] = false

  }

  submitChanges( ){
    this.loading['uploading'] = true

    this._api.restfulPut( this.cieloList, 'Uploads/saveCielo')
            .subscribe( res => {

              this.toastr.success('Done!', res['msg'])
              this.loading['uploading'] = false
            },
            err => {
              this.loading['uploading'] = false
              const error = err.error;
              this.toastr.error( err, 'Error' )
              console.error(err.statusText, error.msg);
            });
  }

  ExcelDateToJSDate(serial) {
    let utc_days  = Math.floor(serial - 25569)
    let utc_value = utc_days * 86400
    let date_info = new Date(utc_value * 1000)

    return moment(`${date_info.getFullYear()}-${date_info.getMonth()}-${date_info.getDate()}`).format('YYYY-MM-DD')
 }

}
