import { Component, OnInit, Input } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as Globals from '../../../globals';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-cid-prod',
  templateUrl: './cid-prod.component.html',
  styleUrls: ['./cid-prod.component.css']
})
export class CidProdComponent implements OnInit {

  cieloList:any = []
  loading:Object = {}

  constructor(public _api: ApiService,
              public _init:InitService,
              public toastr: ToastrService) { }

  ngOnInit() {
  }

  buildVouchers( json ){

    this.loading['cielo'] = true

    let vouchers = []

    for( let r of json ){
      vouchers.push(r['PID'])
    }

    this._api.restfulPut( {voucher: vouchers, agencia: ['CIDPRESN']}, 'Rsv/getLocsCielo' )
            .subscribe( res => {

              let vList:Object = {}
              let list = []

              for( let r of res['data'] ){
                vList[r['voucher']] = {cielo: r}
              }

              for( let r of json ){
                let jTmp = r
                // jTmp['notas'] = `${vList[r['PID']]['cielo']['notas'] ? vList[r['PID']]['cielo']['notas'].toUpperCase().replace('GRUPO DEJA VOOM 2020 // ','').trim() : ''} // ${r['PROXIMITY REQUESTS'] ? r['PROXIMITY REQUESTS'].toUpperCase().replace('PROXIMITY GROUP','').trim() : ''} // ${r['BED TYPE REQUEST'] ? r['BED TYPE REQUEST'] : ''}`
                let notes = (vList[r['PID']]['cielo']['notas'] ? vList[r['PID']]['cielo']['notas'] : '// //').split('//')
                jTmp['notas'] = `${notes[0] ? notes[0].trim() : ''} //${r['PROXIMITY REQUESTS'] ? ' ' + r['PROXIMITY REQUESTS'].toUpperCase().replace('PROXIMITY GROUP','').trim() : ''} // ${r['BED TYPE REQUEST'] ? r['BED TYPE REQUEST'].replace(/\r\n/g,' ') : ''}`

                if( vList[r['PID']] ){
                  vList[r['PID']]['cid'] = jTmp
                }else{
                  vList[r['voucher']] = {cielo:{}, cid: jTmp}
                }

                vList[r['PID']]['result'] = {
                  rsva: vList[r['PID']]['cielo']['rsva'],
                  PID: r['PID'],
                  notas: jTmp['notas'].trim(),
                  guest1_nombre: (r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest1_nombre'] ? vList[r['PID']]['cielo']['guest1_nombre'].toUpperCase().trim() : null) ? `${(r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest1_nombre'] ? vList[r['PID']]['cielo']['guest1_nombre'].toUpperCase().trim() : null)})` :  (r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim() : null) ,
                  guest1_apellido: (r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest1_apellido'] ? vList[r['PID']]['cielo']['guest1_apellido'].toUpperCase().trim() : null) ? `${(r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest1_apellido'] ? vList[r['PID']]['cielo']['guest1_apellido'].toUpperCase().trim() : null)})` :  (r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim() : null) ,
                  guest2_nombre: (r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest2_nombre'] ? vList[r['PID']]['cielo']['guest2_nombre'].toUpperCase().trim() : null) ? `${(r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest2_nombre'] ? vList[r['PID']]['cielo']['guest2_nombre'].toUpperCase().trim() : null)})` :  (r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim() : null) ,
                  guest2_apellido: (r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest2_apellido'] ? vList[r['PID']]['cielo']['guest2_apellido'].toUpperCase().trim() : null) ? `${(r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest2_apellido'] ? vList[r['PID']]['cielo']['guest2_apellido'].toUpperCase().trim() : null)})` :  (r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim() : null) ,
                  guest3_nombre: (r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest3_nombre'] ? vList[r['PID']]['cielo']['guest3_nombre'].toUpperCase().trim() : null) ? `${(r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest3_nombre'] ? vList[r['PID']]['cielo']['guest3_nombre'].toUpperCase().trim() : null)})` :  (r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim() : null) ,
                  guest3_apellido: (r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest3_apellido'] ? vList[r['PID']]['cielo']['guest3_apellido'].toUpperCase().trim() : null) ? `${(r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest3_apellido'] ? vList[r['PID']]['cielo']['guest3_apellido'].toUpperCase().trim() : null)})` :  (r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim() : null) ,
                  guest4_nombre: (r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest4_nombre'] ? vList[r['PID']]['cielo']['guest4_nombre'].toUpperCase().trim() : null) ? `${(r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest4_nombre'] ? vList[r['PID']]['cielo']['guest4_nombre'].toUpperCase().trim() : null)})` :  (r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim() : null) ,
                  guest4_apellido: (r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest4_apellido'] ? vList[r['PID']]['cielo']['guest4_apellido'].toUpperCase().trim() : null) ? `${(r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim() : null)} (${(vList[r['PID']]['cielo']['guest4_apellido'] ? vList[r['PID']]['cielo']['guest4_apellido'].toUpperCase().trim() : null)})` :  (r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim() : null) ,
                  adultos: r['ADULTS'] != vList[r['PID']]['cielo']['adultos'] ? r['ADULTS'] : vList[r['PID']]['cielo']['adultos'],
                  llegada: moment(r['CHECK IN DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') != vList[r['PID']]['cielo']['llegada'] ? moment(r['CHECK IN DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') + ` (${vList[r['PID']]['cielo']['llegada']})` : vList[r['PID']]['cielo']['llegada'],
                  salida: moment(r['CHECK OUT DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') != vList[r['PID']]['cielo']['salida'] ? moment(r['CHECK OUT DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') + ` (${vList[r['PID']]['cielo']['salida']})` : vList[r['PID']]['cielo']['salida']
                }

                vList[r['PID']]['flags'] = {
                  rsva: false,
                  PID: false,
                  notas: jTmp['notas'].trim() == (vList[r['PID']]['cielo']['notas'] ? vList[r['PID']]['cielo']['notas'].trim() : '') ? false : true,
                  guest1_nombre: (r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest1_nombre'] ? vList[r['PID']]['cielo']['guest1_nombre'].toUpperCase().trim() : null),
                  guest1_apellido: (r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest1_apellido'] ? vList[r['PID']]['cielo']['guest1_apellido'].toUpperCase().trim() : null),
                  guest2_nombre: (r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest2_nombre'] ? vList[r['PID']]['cielo']['guest2_nombre'].toUpperCase().trim() : null),
                  guest2_apellido: (r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest2_apellido'] ? vList[r['PID']]['cielo']['guest2_apellido'].toUpperCase().trim() : null),
                  guest3_nombre: (r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest3_nombre'] ? vList[r['PID']]['cielo']['guest3_nombre'].toUpperCase().trim() : null),
                  guest3_apellido: (r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest3_apellido'] ? vList[r['PID']]['cielo']['guest3_apellido'].toUpperCase().trim() : null),
                  guest4_nombre: (r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest4_nombre'] ? vList[r['PID']]['cielo']['guest4_nombre'].toUpperCase().trim() : null),
                  guest4_apellido: (r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim() : null) != (vList[r['PID']]['cielo']['guest4_apellido'] ? vList[r['PID']]['cielo']['guest4_apellido'].toUpperCase().trim() : null),
                  adultos: r['ADULTS'] != vList[r['PID']]['cielo']['adultos'],
                  llegada: moment(r['CHECK IN DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') != vList[r['PID']]['cielo']['llegada'],
                  salida: moment(r['CHECK OUT DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') != vList[r['PID']]['cielo']['salida']
                }

                let flag = false
                for( let k in vList[r['PID']]['flags'] ){
                  if( vList[r['PID']]['flags'][k] ){
                    flag = true
                    break
                  }
                }

                if( flag ){
                  list.push(vList[r['PID']])
                }
              }

              this.cieloList = list


              this.loading['cielo'] = false
            },
            err => {
              this.loading['cielo'] = false
              const error = err.error;
              this.toastr.error( error.msg, err.status );
              console.error(err.statusText, error.msg);
            });
  }

  submitChanges( r, i ){
    this.loading[i] = true

    let hoteles = {
      GOC : 2,
      PYR : 7,
      GOP : 12,
      OPB : 9,
      GSC : 14,
      SMART : 6,
      OH : 5
    }

    let params = [
      {
          hotel : `${hoteles[r['cielo']['hotel']]}`,
          reserva : r['cielo']['rsva'].length < 6 ? `0${r['cielo']['rsva']}` : r['cielo']['rsva'],
          agencia : r['cielo']['agencia'],
          mayorista : r['cielo']['mdo'],
          tarifa : r['cielo']['rp_char01'],
          grupo : r['cielo']['grupo'],
          evento : 'GDEJAV',
          llegada : moment(r['cid']['CHECK IN DATE'], 'MM/DD/YYYY').format('DD/MM/YY'),
          salida : moment(r['cid']['CHECK OUT DATE'], 'MM/DD/YYYY').format('DD/MM/YY'),
          noches : r['cid']['# OF NIGHTS'],
          adulto : r['cid']['ADULTS'],
          junior : 0,
          menor : 0,
          bebe : 0,
          notas : r['result']['notas'],
          nombre1 : r['cid']['GUEST 1\r\n(FIRST NAME)'] ? r['cid']['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido1 : r['cid']['GUEST 1\r\n(LAST NAME)'] ? r['cid']['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre2 : r['cid']['GUEST 2\r\n(FIRST NAME)'] ? r['cid']['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido2 : r['cid']['GUEST 2\r\n(LAST NAME)'] ? r['cid']['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre3 : r['cid']['GUEST 3\r\n(FIRST NAME)'] ? r['cid']['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido3 : r['cid']['GUEST 3\r\n(LAST NAME)'] ? r['cid']['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre4 : r['cid']['GUEST 4\r\n(FIRST NAME)'] ? r['cid']['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido4 : r['cid']['GUEST 4\r\n(LAST NAME)'] ? r['cid']['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre5 : r['cid']['GUEST 5\r\n(FIRST NAME)'] ? r['cid']['GUEST 5\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido5 : r['cid']['GUEST 5\r\n(LAST NAME)'] ? r['cid']['GUEST 5\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre6 : r['cid']['GUEST 6\r\n(FIRST NAME)'] ? r['cid']['GUEST 6\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido6 : r['cid']['GUEST 6\r\n(LAST NAME)'] ? r['cid']['GUEST 6\r\n(LAST NAME)'].toUpperCase().trim() : ''
      }
  ]

    this._api.restfulPost( params, 'http://189.206.2.193:85/api/grupos/cambios', true, 'Token 13ee40f7e3c618ed6cb77f5f40cff760d19e44e6' )
            .subscribe( res => {

              this.toastr.success('Guardado', 'Guardado')
              console.log(res)

              this.loading[i] = false
            },
            err => {
              this.loading[i] = false
              const error = err.error;
              this.toastr.error( error.msg, err.status );
              console.error(err.statusText, error.msg);
            });
  }

  submitAllChanges(){
    this.loading['allChanges'] = true

    let hoteles = {
      GOC : 2,
      PYR : 7,
      GOP : 12,
      OPB : 9,
      GSC : 14,
      SMART : 6,
      OH : 5
    }

    let params = []

    for( let r of this.cieloList ){
      let ob = {
          hotel : `${hoteles[r['cielo']['hotel']]}`,
          reserva : r['cielo']['rsva'].length < 6 ? `0${r['cielo']['rsva']}` : r['cielo']['rsva'],
          agencia : r['cielo']['agencia'],
          mayorista : r['cielo']['mdo'],
          tarifa : r['cielo']['rp_char01'],
          grupo : r['cielo']['grupo'],
          evento : 'GDEJAV',
          llegada : moment(r['cid']['CHECK IN DATE'], 'MM/DD/YYYY').format('DD/MM/YY'),
          salida : moment(r['cid']['CHECK OUT DATE'], 'MM/DD/YYYY').format('DD/MM/YY'),
          noches : r['cid']['# OF NIGHTS'],
          adulto : r['cid']['ADULTS'],
          junior : 0,
          menor : 0,
          bebe : 0,
          notas : r['result']['notas'],
          nombre1 : r['cid']['GUEST 1\r\n(FIRST NAME)'] ? r['cid']['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido1 : r['cid']['GUEST 1\r\n(LAST NAME)'] ? r['cid']['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre2 : r['cid']['GUEST 2\r\n(FIRST NAME)'] ? r['cid']['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido2 : r['cid']['GUEST 2\r\n(LAST NAME)'] ? r['cid']['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre3 : r['cid']['GUEST 3\r\n(FIRST NAME)'] ? r['cid']['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido3 : r['cid']['GUEST 3\r\n(LAST NAME)'] ? r['cid']['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre4 : r['cid']['GUEST 4\r\n(FIRST NAME)'] ? r['cid']['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido4 : r['cid']['GUEST 4\r\n(LAST NAME)'] ? r['cid']['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre5 : r['cid']['GUEST 5\r\n(FIRST NAME)'] ? r['cid']['GUEST 5\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido5 : r['cid']['GUEST 5\r\n(LAST NAME)'] ? r['cid']['GUEST 5\r\n(LAST NAME)'].toUpperCase().trim() : '',
          nombre6 : r['cid']['GUEST 6\r\n(FIRST NAME)'] ? r['cid']['GUEST 6\r\n(FIRST NAME)'].toUpperCase().trim() : '',
          apellido6 : r['cid']['GUEST 6\r\n(LAST NAME)'] ? r['cid']['GUEST 6\r\n(LAST NAME)'].toUpperCase().trim() : ''
      }

      params.push(ob)

    }

    this._api.restfulPost( params, 'http://189.206.2.193:85/api/grupos/cambios', true, 'Token 13ee40f7e3c618ed6cb77f5f40cff760d19e44e6' )
            .subscribe( res => {

              this.toastr.success('Guardado', 'Guardado')
              console.log(res)

              this.loading['allChanges'] = false
            },
            err => {
              this.loading['allChanges'] = false
              const error = err.error;
              this.toastr.error( error.msg, err.status );
              console.error(err.statusText, error.msg);
            });
  }

}
