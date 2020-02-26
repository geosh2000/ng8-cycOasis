import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as Globals from '../globals';
import { Observable } from 'rxjs';
import { map, catchError } from "rxjs/operators"

@Injectable()
export class AsesoresService {

  detailAsesoresUrl:string = `${ Globals.APISERV }/ng2/json/detalle.json.php`;
  getCredUrl:string = `${ Globals.APISERV }/api/getCredential.php`;
  progHorariosGetAsesoresUrl:string = `${ Globals.APISERV }/ng2/json/progHorarios.php`;

  constructor( private http:HttpClient ) {

  }

  getDetailsAsesor( id ){

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${this.detailAsesoresUrl}?token=${currentUser.token}&usn=${currentUser.username}`

    let params={
      id: id
    }

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({ });

    return this.http.post( url, body, { headers } )
        .pipe(
           map( res => { return res } )
        )

  }

  getCredentials( credential ){
    let params = {
      cred: credential
    }

    let body = JSON.stringify( params );
    let headers = new HttpHeaders({ });
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let url = `${this.getCredUrl}?token=${currentUser.token}&usn=${currentUser.username}`


    return this.http.post( url, body, { headers } )
        .pipe(
           map( res => { return res } )
        )

  }

  progHorariosGetAsesores(){

    let body = "";
    let headers = new HttpHeaders({ });

    return this.http.post( this.progHorariosGetAsesoresUrl, body, { headers } )
        .pipe(
           map( res => { return res } )
        )
  }



}
