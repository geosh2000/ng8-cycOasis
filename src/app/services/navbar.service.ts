import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as Globals from '../globals';
import { map, catchError } from "rxjs/operators"

@Injectable()
export class NavbarService {

  apiRestful:string = `${ Globals.APISERV }/api/${Globals.APIFOLDER}/index.php/`;

  constructor( private domSanitizer:DomSanitizer, private http:HttpClient ) { }

  transform( url: string): any {
    return this.domSanitizer.bypassSecurityTrustUrl( url );
  }

  getMenu( token ){

    let url = `${ this.apiRestful }/Navbar/getMenu`
    let urlOK = this.transform( url )

    let headers = new HttpHeaders({
      'Content-Type':'application/json'
    });

    return this.http.get( urlOK.changingThisBreaksApplicationSecurity, { headers } )
          .pipe(
             map( res => { return res } )
          )


  }

}
