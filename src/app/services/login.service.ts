import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { ApiService } from './api.service';
import { InitService } from './init.service';
import { WsService } from './ws.service';

@Injectable()
export class LoginService {

  constructor( private _api:ApiService, private _init:InitService, private ws: WsService ) { }

  loginCyC( logInfo ){

    let result
    console.log(logInfo)
    return this._api.restfulPut( logInfo, 'Login/login', false )
      .map( res => {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
                          token: res['token'],
                          tokenExpire: res['tokenExpire'],
                          username: res['username'],
                          hcInfo: res['hcInfo'],
                          creds: btoa( JSON.stringify(res['credentials'])),
                          credentials: res['credentials']
                        })
        );
        localStorage.setItem('token', res['token'])
        localStorage.setItem('nombre', res['hcInfo']['Nombre_Corto'])
        this.ws.cargarStorage()
        this._init.getPreferences()

        return { status: true, msg: 'Logueo Correcto', err: 'NA', isAffiliate: res['credentials']['viewOnlyAffiliates'] == '1' ? true : false}

        // CYC4
        // localStorage.setItem(
        //   'currentUser',
        //   JSON.stringify({
        //                   token: res['token'],
        //                   tokenExpire: res['tokenExpire'],
        //                   username: res['username'],
        //                   hcInfo: res['hcInfo'],
        //                   credentials: res['credentials']
        //                 })
        // );
        // this.ws.cargarStorage()
        // this._init.getPreferences()
        // return { status: true, msg: 'Logueo Correcto', err: 'NA', isAffiliate: res['credentials']['viewOnlyAffiliates'] == '1' ? true : false}
      }, err => {

        if(err){
          let error = err.error
          console.error(err.statusText, error.msg)

          return { status: false, msg: error.msg, err: err.statusText }
        }
      })

  }



}
