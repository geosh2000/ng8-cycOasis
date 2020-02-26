import { Injectable, Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { AsesoresService } from './asesores.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CompleterService, CompleterData } from 'ng2-completer';
import * as Globals from '../globals';
declare var jQuery:any;

@Injectable()
export class CredentialsService {

  asesor:any[];
  showContents:boolean = false;
  credentialStatus = 100;


  constructor( private _asesoresService:AsesoresService, private route:Router, private completerService:CompleterService  ) {

  }

  checkCredentialServ( credential, mainCred ){
      return this.check( credential, mainCred )
        .map( res => {
          if(res){
            return true
          }else{
            return true
          }
        })
      }

  check( credential, mainCred ){
    return this._asesoresService.getCredentials( credential )
          .map( respuesta =>{
            this.credentialStatus = respuesta['credential'];

            if(mainCred){
              switch( this.credentialStatus ){
                case 0:
                  this.route.navigate(['/home']);
                  this.showContents=false;
                  break;
                case 100:
                  jQuery("#loginModal").modal('show');
                  this.showContents=false;
                  break;
                case 1:
                  this.showContents=true;
                  this.credentialStatus = 500;
                  break;
              }
            }else{
              if( this.credentialStatus == 1 ){
                this.showContents=true;
              }else{
                this.showContents=false;
              }
            }


            if(respuesta){
              return true
            }
          })
  }

}
