import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoginService, InitService } from '../../services/service.index';
declare var jQuery:any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  login = {
    usn: '',
    usp: '',
    remember: ''
  }
  loginError:boolean = false;
  loginMsg:string = '';
  loginLoad = false

  constructor( private _login:LoginService, private _route:Router, private _init:InitService ) { }

  ngOnInit() {

  }

  validate( item ){
    console.log(item);
  }

  logIn( ){
    this.loginLoad = true
    let sourceUrl = this._route.url

    // console.log(this.login)
    this._login.loginCyC( this.login )
      .subscribe( res =>{

          this.loginLoad = false

          if( res['ERR'] ){
            this.loginError=true;
            this.loginMsg=res.msg;
          }else{
            this.loginError=false;
            this.loginMsg='';
            jQuery('#loginModal').modal('hide');

            if( res['isAffiliate'] ){
              this._route.navigateByUrl('/afiliados')
            }else{
              this._route.navigateByUrl('/home')
              this._route.navigateByUrl(sourceUrl)
            }
            this._init.getPreferences()

        }
      }, err => {

        if(err){
          this.loginLoad = false
          let error = err.error
          this.loginError=true;
          this.loginMsg=error.msg;

          console.error(err.statusText, error.msg)

        }
      });
    // console.log(this.login);
  }


}
