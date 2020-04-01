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
    total: { c:0,n:0,R:0,B:0,S:0,O:0 },
    OLITE: { c:0,n:0,R:0,B:0,S:0,O:0 },
    GOC: { c:0,n:0,R:0,B:0,S:0,O:0 },
    PYR: { c:0,n:0,R:0,B:0,S:0,O:0 },
    OT: { c:0,n:0,R:0,B:0,S:0,O:0 },
    SENS: { c:0,n:0,R:0,B:0,S:0,O:0 },
    SKGS: { c:0,n:0,R:0,B:0,S:0,O:0 },
    GOT: { c:0,n:0,R:0,B:0,S:0,O:0 },
    OPB: { c:0,n:0,R:0,B:0,S:0,O:0 },
    GSC: { c:0,n:0,R:0,B:0,S:0,O:0 },
    GOP: { c:0,n:0,R:0,B:0,S:0,O:0 },
    SMART: { c:0,n:0,R:0,B:0,S:0,O:0 },
    OH: { c:0,n:0,R:0,B:0,S:0,O:0 },
    GOTSK: { c:0,n:0,R:0,B:0,S:0,O:0 }
  }
  allRegs = 0
  maxRegs = 5000
  progress = []

  constructor(public _api: ApiService,
              public _init:InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  buildVouchers( json ){
    console.log('build cielo start')
    this.progress = []
    this.loading['cielo'] = true

    this.summary = {
      total: { c:0,n:0,R:0,B:0,S:0,O:0 },
      OLITE: { c:0,n:0,R:0,B:0,S:0,O:0 },
      GOC: { c:0,n:0,R:0,B:0,S:0,O:0 },
      PYR: { c:0,n:0,R:0,B:0,S:0,O:0 },
      OT: { c:0,n:0,R:0,B:0,S:0,O:0 },
      SENS: { c:0,n:0,R:0,B:0,S:0,O:0 },
      SKGS: { c:0,n:0,R:0,B:0,S:0,O:0 },
      GOT: { c:0,n:0,R:0,B:0,S:0,O:0 },
      OPB: { c:0,n:0,R:0,B:0,S:0,O:0 },
      GSC: { c:0,n:0,R:0,B:0,S:0,O:0 },
      GOP: { c:0,n:0,R:0,B:0,S:0,O:0 },
      SMART: { c:0,n:0,R:0,B:0,S:0,O:0 },
      OH: { c:0,n:0,R:0,B:0,S:0,O:0 },
      GOTSK: { c:0,n:0,R:0,B:0,S:0,O:0 }
    }

    this.allRegs = 0

    this.cieloList = []
    let cielo = [[]]
    let index = 0
    let i = 0
    let reg = 0

    for( let r of json ){

      if( r['SIGLA'] == 'SIGLA' ){
        continue
      }

      // if( reg < 2735 || reg > 2755 ){
      //   reg++
      //   continue
      // }

      // reg++

      if( i == this.maxRegs ){
        cielo.push([])
        index++
        i = 0
      }

      let llegada = typeof r['LLEGADA'] != 'number' ? r['LLEGADA'].split('/') : []
      let salida = typeof r['SALIDA'] != 'number' ? r['SALIDA'].split('/') : []
      let dtCreated = typeof r['FECHACAP'] != 'number' ? r['FECHACAP'].split('/') : []
      let dtCancel = []

      if( r['S'] == 'C' ){
        dtCancel = typeof r['FCANCELA'] != 'number' ? r['FCANCELA'].split('/') : []
      }

      let rsv = {
        rsva: r['RESERV'],
        hotel: r['SIGLA'],
        complejo: this.complejo[r['SIGLA']],
        mdo: r['MAYORIST'],
        agencia: r['AGENCIA'],
        grupo: r['GRUPO'],
        e: r['S'] != 'C' ? r['S'] : (r['UCANCELA'] == 'NOSHOWS' ? 'n' : 'c'),
        nombre: `${r['APELLIDO1']} ${r['NOMBRE1']}`,
        adultos: r['ADULTOS'],
        juniors: r['JUNIOR'],
        menores: r['MENORES'],
        // llegada: moment(`20${llegada[2]}-${parseInt(llegada[1])}-${llegada[0]}`).format('YYYY-MM-DD'),
        // salida: moment(`20${salida[2]}-${parseInt(salida[1])}-${salida[0]}`).format('YYYY-MM-DD'),
        // dtCreated: moment(`20${dtCreated[2]}-${parseInt(dtCreated[1])}-${dtCreated[0]}`).format('YYYY-MM-DD'),
        // dtCancel: r['S'] == 'C' ? moment(`20${dtCancel[2]}-${parseInt(dtCancel[1])}-${dtCancel[0]}`).format('YYYY-MM-DD') : null,
        llegada: typeof(r['LLEGADA']) == 'number' ? this.excelDate(r['LLEGADA']) : moment(`20${llegada[2]}-${parseInt(llegada[1])}-${llegada[0]}`).format('YYYY-MM-DD'),
        salida: typeof(r['SALIDA']) == 'number' ? this.excelDate(r['SALIDA']) : moment(`20${salida[2]}-${parseInt(salida[1])}-${salida[0]}`).format('YYYY-MM-DD'),
        dtCreated: typeof(r['FECHACAP']) == 'number' ? this.excelDate(r['FECHACAP']) : moment(`20${dtCreated[2]}-${parseInt(dtCreated[1])}-${dtCreated[0]}`).format('YYYY-MM-DD'),
        dtCancel: r['S'] == 'C' ? (typeof(r['FCANCELA']) == 'number' ? this.excelDate(r['FCANCELA']) : moment(`20${dtCancel[2]}-${parseInt(dtCancel[1])}-${dtCancel[0]}`).format('YYYY-MM-DD')) : null,
        noches: r['NOCHES'],
        notas: this.validateText(r['NOTAS'], false, null),
        voucher: this.validateText(r['VOUCHER'], false, null),
        total: r['IMPORTE'],
        mon: r['MON'],
        tipocambio: this.validateText(r['TIPOCAMBIO'], false, null),
        hab: this.validateText(r['HABI'], false, null),
        userCreated: r['USUARIOCAP'],
        rp_char01: r['TARIF'],
        pais: r['PAI'],
        origen: r['ORIGE'],
        userCancel: r['UCANCELA'],
        userComision: r['UVENDIO'],
        guest1_apellido: this.validateText(r['APELLIDO1'], false, null),
        guest1_nombre: this.validateText(r['NOMBRE1'], false, null),
        guest2_apellido: this.validateText(r['APELLIDO2'], false, null),
        guest2_nombre: this.validateText(r['NOMBRE2'], false, null),
        guest3_apellido: this.validateText(r['APELLIDO3'], false, null),
        guest3_nombre: this.validateText(r['NOMBRE3'], false, null),
        guest4_apellido: this.validateText(r['APELLIDO4'], false, null),
        guest4_nombre: this.validateText(r['NOMBRE4'], false, null),
        bedType: this.validateText(r['C'], false, null)
      }
      cielo[index].push(rsv)
      i++

      this.summary[r['SIGLA']][rsv['e']]++
      this.summary['total'][rsv['e']]++
      this.allRegs++
    }

    this.cieloList = cielo
    this.loading['cielo'] = false

  }

  validateText( t, trim, nt){
    return t ? (trim ? t.trim() : (t == ' ' ? null : t)) : nt
  }

  submitChanges( ){
    this.progress = []
    let arr = this.cieloList
    // console.log(arr)

    for( let d of arr ){
      this.progress.push({s:0,l:0})
    }

    this.submit(arr, 0)

  }

  submit( d, i ){
    this.loading['uploading'] = true
    this.progress[i]['s'] = 1

    this._api.restfulPut( d[i], 'Uploads/saveCielo')
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

  excelDate( excelDate ) {
    return moment(new Date((Math.round(excelDate) - (25567 + 1))*86400*1000).toLocaleDateString('en-US'), 'DD/MM/YYYY').format('YYYY-MM-DD');
  }

}
