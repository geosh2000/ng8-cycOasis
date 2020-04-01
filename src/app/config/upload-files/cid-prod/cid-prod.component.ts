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
  allChanges = []
  progress = []

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
              console.log('building comparatives')
              let vList:Object = {}
              let list = []

              for( let r of res['data'] ){
                vList[r['voucher']] = {cielo: r}
              }

              for( let r of json ){
                if( !vList[r['PID']] ){
                  continue
                }
                let jTmp = r

                if( vList[r['PID']]['cielo']['hotel'] == 'PYR' ){
                  jTmp['notas'] = `${r['PROXIMITY REQUESTS'] ? r['PROXIMITY REQUESTS'].toUpperCase().replace('PROXIMITY GROUP','').trim() : ''} // ${r['BED TYPE']} ${r['BED TYPE REQUEST'] ? r['BED TYPE REQUEST'] : ''}`
                }else{
                  if( vList[r['PID']]['cielo']['notas'] && vList[r['PID']]['cielo']['notas'].indexOf('GRUPO DEJA') < 0 ){
                    let notes = (vList[r['PID']]['cielo']['notas'] ? vList[r['PID']]['cielo']['notas'] : '// //').split('//')
                    jTmp['notas'] = `${notes[0] ? notes[0].trim() : ''} //${r['PROXIMITY REQUESTS'] ? ' ' + r['PROXIMITY REQUESTS'].toUpperCase().replace('PROXIMITY GROUP','').trim() : ''} // ${r['BED TYPE']} ${r['BED TYPE REQUEST'] ? r['BED TYPE REQUEST'].replace(/\r\n/g,' ') : ''}`
                  }else{
                    jTmp['notas'] = `${vList[r['PID']]['cielo']['notas'] ? vList[r['PID']]['cielo']['notas'].toUpperCase().replace('GRUPO DEJA VOOM 2020 // ','').trim() : ''} // ${r['PROXIMITY REQUESTS'] ? r['PROXIMITY REQUESTS'].toUpperCase().replace('PROXIMITY GROUP','').trim() : ''} // ${r['BED TYPE']} ${r['BED TYPE REQUEST'] ? r['BED TYPE REQUEST'] : ''}`
                  }
                }


                if( vList[r['PID']] ){
                  vList[r['PID']]['cid'] = jTmp
                }else{
                  vList[r['voucher']] = {cielo:{}, cid: jTmp}
                }

                let px = parseInt(r['ADULTS'] != vList[r['PID']]['cielo']['adultos'] ? r['ADULTS'] : vList[r['PID']]['cielo']['adultos'])

                vList[r['PID']]['result'] = {
                  rsva: vList[r['PID']]['cielo']['rsva'],
                  PID: r['PID'],
                  notas: jTmp['notas'].trim(),
                  guest1_nombre: (r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : (1 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest1_nombre'] ? vList[r['PID']]['cielo']['guest1_nombre'].toUpperCase().trim().substring(0,15) : (1 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (1 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest1_nombre'] ? vList[r['PID']]['cielo']['guest1_nombre'].toUpperCase().trim().substring(0,15) : (1 <= px ? 'TBA' : ' '))})` :  (r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (1 <= px ? 'TBA' : ' ')) ,
                  guest1_apellido: (r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : (1 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest1_apellido'] ? vList[r['PID']]['cielo']['guest1_apellido'].toUpperCase().trim().substring(0,20) : (1 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (1 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest1_apellido'] ? vList[r['PID']]['cielo']['guest1_apellido'].toUpperCase().trim().substring(0,20) : (1 <= px ? 'TBA' : ' '))})` :  (r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (1 <= px ? 'TBA' : ' ')) ,
                  guest2_nombre: (r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : (2 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest2_nombre'] ? vList[r['PID']]['cielo']['guest2_nombre'].toUpperCase().trim().substring(0,15) : (2 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (2 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest2_nombre'] ? vList[r['PID']]['cielo']['guest2_nombre'].toUpperCase().trim().substring(0,15) : (2 <= px ? 'TBA' : ' '))})` :  (r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (2 <= px ? 'TBA' : ' ')) ,
                  guest2_apellido: (r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : (2 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest2_apellido'] ? vList[r['PID']]['cielo']['guest2_apellido'].toUpperCase().trim().substring(0,20) : (2 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (2 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest2_apellido'] ? vList[r['PID']]['cielo']['guest2_apellido'].toUpperCase().trim().substring(0,20) : (2 <= px ? 'TBA' : ' '))})` :  (r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (2 <= px ? 'TBA' : ' ')) ,
                  guest3_nombre: (r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : (3 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest3_nombre'] ? vList[r['PID']]['cielo']['guest3_nombre'].toUpperCase().trim().substring(0,15) : (3 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (3 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest3_nombre'] ? vList[r['PID']]['cielo']['guest3_nombre'].toUpperCase().trim().substring(0,15) : (3 <= px ? 'TBA' : ' '))})` :  (r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (3 <= px ? 'TBA' : ' ')) ,
                  guest3_apellido: (r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : (3 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest3_apellido'] ? vList[r['PID']]['cielo']['guest3_apellido'].toUpperCase().trim().substring(0,20) : (3 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (3 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest3_apellido'] ? vList[r['PID']]['cielo']['guest3_apellido'].toUpperCase().trim().substring(0,20) : (3 <= px ? 'TBA' : ' '))})` :  (r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (3 <= px ? 'TBA' : ' ')) ,
                  guest4_nombre: (r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : (4 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest4_nombre'] ? vList[r['PID']]['cielo']['guest4_nombre'].toUpperCase().trim().substring(0,15) : (4 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (4 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest4_nombre'] ? vList[r['PID']]['cielo']['guest4_nombre'].toUpperCase().trim().substring(0,15) : (4 <= px ? 'TBA' : ' '))})` :  (r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (4 <= px ? 'TBA' : ' ')) ,
                  guest4_apellido: (r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : (4 <= px ? 'TBA' : ' ')) != (vList[r['PID']]['cielo']['guest4_apellido'] ? vList[r['PID']]['cielo']['guest4_apellido'].toUpperCase().trim().substring(0,20) : (4 <= px ? 'TBA' : ' ')) ? `${(r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (4 <= px ? 'TBA' : ' '))} (${(vList[r['PID']]['cielo']['guest4_apellido'] ? vList[r['PID']]['cielo']['guest4_apellido'].toUpperCase().trim().substring(0,20) : (4 <= px ? 'TBA' : ' '))})` :  (r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (4 <= px ? 'TBA' : ' ')) ,
                  adultos: r['ADULTS'] != vList[r['PID']]['cielo']['adultos'] ? r['ADULTS'] : vList[r['PID']]['cielo']['adultos'],
                  llegada: moment(r['CHECK IN DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') != vList[r['PID']]['cielo']['llegada'] ? moment(r['CHECK IN DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') + ` (${vList[r['PID']]['cielo']['llegada']})` : vList[r['PID']]['cielo']['llegada'],
                  salida: moment(r['CHECK OUT DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') != vList[r['PID']]['cielo']['salida'] ? moment(r['CHECK OUT DATE'], 'MM/DD/YYYY').format('YYYY-MM-DD') + ` (${vList[r['PID']]['cielo']['salida']})` : vList[r['PID']]['cielo']['salida']
                }

                vList[r['PID']]['flags'] = {
                  rsva: false,
                  PID: false,
                  notas: jTmp['notas'].trim() == (vList[r['PID']]['cielo']['notas'] ? vList[r['PID']]['cielo']['notas'].trim() : '') ? false : true,
                  guest1_nombre: (r['GUEST 1\r\n(FIRST NAME)'] ? r['GUEST 1\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : null) != (vList[r['PID']]['cielo']['guest1_nombre'] ? vList[r['PID']]['cielo']['guest1_nombre'].toUpperCase().trim().substring(0,15) : null),
                  guest1_apellido: (r['GUEST 1\r\n(LAST NAME)'] ? r['GUEST 1\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : null) != (vList[r['PID']]['cielo']['guest1_apellido'] ? vList[r['PID']]['cielo']['guest1_apellido'].toUpperCase().trim().substring(0,20) : null),
                  guest2_nombre: (r['GUEST 2\r\n(FIRST NAME)'] ? r['GUEST 2\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : null) != (vList[r['PID']]['cielo']['guest2_nombre'] ? vList[r['PID']]['cielo']['guest2_nombre'].toUpperCase().trim().substring(0,15) : null),
                  guest2_apellido: (r['GUEST 2\r\n(LAST NAME)'] ? r['GUEST 2\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : null) != (vList[r['PID']]['cielo']['guest2_apellido'] ? vList[r['PID']]['cielo']['guest2_apellido'].toUpperCase().trim().substring(0,20) : null),
                  guest3_nombre: (r['GUEST 3\r\n(FIRST NAME)'] ? r['GUEST 3\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,15) : null) != (vList[r['PID']]['cielo']['guest3_nombre'] ? vList[r['PID']]['cielo']['guest3_nombre'].toUpperCase().trim().substring(0,15) : null),
                  guest3_apellido: (r['GUEST 3\r\n(LAST NAME)'] ? r['GUEST 3\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : null) != (vList[r['PID']]['cielo']['guest3_apellido'] ? vList[r['PID']]['cielo']['guest3_apellido'].toUpperCase().trim().substring(0,20) : null),
                  guest4_nombre: (r['GUEST 4\r\n(FIRST NAME)'] ? r['GUEST 4\r\n(FIRST NAME)'].toUpperCase().trim().substring(0,20) : null) != (vList[r['PID']]['cielo']['guest4_nombre'] ? vList[r['PID']]['cielo']['guest4_nombre'].toUpperCase().trim().substring(0,15) : null),
                  guest4_apellido: (r['GUEST 4\r\n(LAST NAME)'] ? r['GUEST 4\r\n(LAST NAME)'].toUpperCase().trim().substring(0,20) : null) != (vList[r['PID']]['cielo']['guest4_apellido'] ? vList[r['PID']]['cielo']['guest4_apellido'].toUpperCase().trim().substring(0,20) : null),
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

    let px = parseInt(r['cid']['ADULTS'])

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
          nombre1 : r['cid']['GUEST 1\r\n(FIRST NAME)'] ? r['cid']['GUEST 1\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (1 <= px ? 'TBA' : ' '),
          apellido1 : r['cid']['GUEST 1\r\n(LAST NAME)'] ? r['cid']['GUEST 1\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (1 <= px ? 'TBA' : ' '),
          nombre2 : r['cid']['GUEST 2\r\n(FIRST NAME)'] ? r['cid']['GUEST 2\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (2 <= px ? 'TBA' : ' '),
          apellido2 : r['cid']['GUEST 2\r\n(LAST NAME)'] ? r['cid']['GUEST 2\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (2 <= px ? 'TBA' : ' '),
          nombre3 : r['cid']['GUEST 3\r\n(FIRST NAME)'] ? r['cid']['GUEST 3\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (3 <= px ? 'TBA' : ' '),
          apellido3 : r['cid']['GUEST 3\r\n(LAST NAME)'] ? r['cid']['GUEST 3\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (3 <= px ? 'TBA' : ' '),
          nombre4 : r['cid']['GUEST 4\r\n(FIRST NAME)'] ? r['cid']['GUEST 4\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (4 <= px ? 'TBA' : ' '),
          apellido4 : r['cid']['GUEST 4\r\n(LAST NAME)'] ? r['cid']['GUEST 4\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (4 <= px ? 'TBA' : ' '),
          nombre5 : r['cid']['GUEST 5\r\n(FIRST NAME)'] ? r['cid']['GUEST 5\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (5 <= px ? 'TBA' : ' '),
          apellido5 : r['cid']['GUEST 5\r\n(LAST NAME)'] ? r['cid']['GUEST 5\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (5 <= px ? 'TBA' : ' '),
          nombre6 : r['cid']['GUEST 6\r\n(FIRST NAME)'] ? r['cid']['GUEST 6\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15) : (6 <= px ? 'TBA' : ' '),
          apellido6 : r['cid']['GUEST 6\r\n(LAST NAME)'] ? r['cid']['GUEST 6\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20) : (6 <= px ? 'TBA' : ' ')
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

    let i = 0
    let index = 0
    this.allChanges = [[]]

    let params = []
    this.progress = []

    for( let r of this.cieloList ){

      if( i == 15 ){
        this.allChanges.push([])
        index++
        i = 0
      }

      let px = parseInt(r['cid']['ADULTS'])

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
          nombre1 : r['cid']['GUEST 1\r\n(FIRST NAME)'] ? (r['cid']['GUEST 1\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (1 <= px ? 'TBA' : ' ') : r['cid']['GUEST 1\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15)) : (1 <= px ? 'TBA' : ' '),
          apellido1 : r['cid']['GUEST 1\r\n(LAST NAME)'] ? (r['cid']['GUEST 1\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (1 <= px ? 'TBA' : ' ') : r['cid']['GUEST 1\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20)) : (1 <= px ? 'TBA' : ' '),
          nombre2 : r['cid']['GUEST 2\r\n(FIRST NAME)'] ? (r['cid']['GUEST 2\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (2 <= px ? 'TBA' : ' ') : r['cid']['GUEST 2\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15)) : (2 <= px ? 'TBA' : ' '),
          apellido2 : r['cid']['GUEST 2\r\n(LAST NAME)'] ? (r['cid']['GUEST 2\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (2 <= px ? 'TBA' : ' ') : r['cid']['GUEST 2\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20)) : (2 <= px ? 'TBA' : ' '),
          nombre3 : r['cid']['GUEST 3\r\n(FIRST NAME)'] ? (r['cid']['GUEST 3\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (3 <= px ? 'TBA' : ' ') : r['cid']['GUEST 3\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15)) : (3 <= px ? 'TBA' : ' '),
          apellido3 : r['cid']['GUEST 3\r\n(LAST NAME)'] ? (r['cid']['GUEST 3\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (3 <= px ? 'TBA' : ' ') : r['cid']['GUEST 3\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20)) : (3 <= px ? 'TBA' : ' '),
          nombre4 : r['cid']['GUEST 4\r\n(FIRST NAME)'] ? (r['cid']['GUEST 4\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (4 <= px ? 'TBA' : ' ') : r['cid']['GUEST 4\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15)) : (4 <= px ? 'TBA' : ' '),
          apellido4 : r['cid']['GUEST 4\r\n(LAST NAME)'] ? (r['cid']['GUEST 4\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (4 <= px ? 'TBA' : ' ') : r['cid']['GUEST 4\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20)) : (4 <= px ? 'TBA' : ' '),
          nombre5 : r['cid']['GUEST 5\r\n(FIRST NAME)'] ? (r['cid']['GUEST 5\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (5 <= px ? 'TBA' : ' ') : r['cid']['GUEST 5\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15)) : (5 <= px ? 'TBA' : ' '),
          apellido5 : r['cid']['GUEST 5\r\n(LAST NAME)'] ? (r['cid']['GUEST 5\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (5 <= px ? 'TBA' : ' ') : r['cid']['GUEST 5\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20)) : (5 <= px ? 'TBA' : ' '),
          nombre6 : r['cid']['GUEST 6\r\n(FIRST NAME)'] ? (r['cid']['GUEST 6\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (6 <= px ? 'TBA' : ' ') : r['cid']['GUEST 6\r\n(FIRST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,15)) : (6 <= px ? 'TBA' : ' '),
          apellido6 : r['cid']['GUEST 6\r\n(LAST NAME)'] ? (r['cid']['GUEST 6\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim() == '' ? (6 <= px ? 'TBA' : ' ') : r['cid']['GUEST 6\r\n(LAST NAME)'].replace(/\(/g,'').replace(/\)/g,'').toUpperCase().trim().substring(0,20)) : (6 <= px ? 'TBA' : ' ')
      }

      this.allChanges[index].push(ob)
      i++

    }

    for( let d of this.allChanges ){
      this.progress.push({s:0,l:0})
    }

    this.loading['allChanges'] = false
    this.sendCid( this.allChanges, 0 )

  }

  retry(i){
    this.sendCid( this.allChanges, i, false )
  }

  sendCid( arr, i, next = true ){
    this.progress[i]['s'] = 1
    this._api.restfulPost( arr[i], 'http://189.206.2.193:85/api/grupos/cambios', true, 'Token 13ee40f7e3c618ed6cb77f5f40cff760d19e44e6' )
            .subscribe( res => {

              this.toastr.success('Done!', res['msg'])
              this.loading['uploading'] = false

              this.progress[i]['s'] = 2
              // this.progress[i]['l'] = res['data'].length
              if( next ){
                i++
                if( i < arr.length ){
                  this.sendCid( arr, i )
                }
              }
            },
            err => {
              this.loading['allChanges'] = false
              const error = err.error;
              this.toastr.error( error.msg, err.status );
              this.progress[i]['s'] = 3
              if( next ){
                i++
                if( i < arr.length ){
                  this.sendCid( arr, i )
                }
              }
              console.error(err.statusText, error.msg);
            });
  }

}
