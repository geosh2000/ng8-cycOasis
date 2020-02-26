import {Component, ViewContainerRef, ViewChild} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ApiService, GlobalServicesService, InitService, TokenCheckService } from './services/service.index';
import { NavbarComponent } from './shared/navbar/navbar.component';

import * as Globals from './globals';
import { LogoutComponent } from './shared/logout/logout.component';
// import { AvisosGlobalesComponent } from './shared/avisos-globales/avisos-globales.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  display = {
    navbar  : true
  };

  @ViewChild(NavbarComponent,{static:false}) _nav:NavbarComponent
  @ViewChild(LogoutComponent,{static:false}) private _logout:LogoutComponent
  // @ViewChild(AvisosGlobalesComponent,{static:false}) public _adv:AvisosGlobalesComponent


  private viewContainerRef: ViewContainerRef;

  opened = false;
  advOpened = false;
  token = false;
  version: any;
  reloadVer = false;
  actualVersion: any;
  myVersion: any;

  currentUser: any;
  showContents = false;

  public constructor(
          private router: Router, private titleService: Title,
          private _api:ApiService,
          private _global: GlobalServicesService,
          private _init: InitService,
          private _tokenCheck: TokenCheckService,
          public toastr: ToastrService
          ) {
             this.version = `${Globals.CYCTITLE} ${Globals.CYCYEAR} ${Globals.VER}`;

             this.currentUser = this._init.getUserInfo();
             this.myVersion = Globals.VER;

             this._tokenCheck.getTokenStatus()
                 .subscribe( res => {
                  console.log('token', res)
                   if ( res.status ) {
                     this.showContents = true;
                   } else {
                     this.showContents = false;
                   }
                 });

             this.getVer()
             this.timerCheck()
          }

   getVer(){
    //  this._api.restfulGet( '', `Lists/cycVersion` )
    //          .subscribe( res => {
    //            let version = res['data']
    //            this.actualVersion = version['LastVer']
    //            if(Globals.VER != version['LastVer']){
    //              this.reloadVer = true
    //            }else{
    //              this.reloadVer = false
    //            }
    //            this.timerCheck()
    //         }, err => {
    //            console.log('ERROR', err)
    //            let error = err.error
    //            this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
    //            console.error(err.statusText, error.msg)
    //            this.timerCheck()
    //          })
   }

   timerCheck(){
     setTimeout( () => this.getVer(), 10000)
   }

  openSideBar( flag ) {
    this.opened = flag;
  }

  openAdv( flag ) {
    this.advOpened = flag;
  }

  logout( id ) {
    this._logout.logout( id );
  }

  confirmLO(h) {
    this._nav.confirmLO(h);
  }

  refreshAdv() {
    // this._adv.timerCount = 0;
  }

  onActivate(event) {
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
  }

}
