import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { InitService, ApiService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery: any;
import * as Globals from '../../globals';
import { Observable } from 'rxjs';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styles: []
})
export class UserPreferencesComponent implements OnInit {

  preferences:Object = {
    zonaHoraria: 0,
    colorProfile: 0
  }

  zhs:any
  show:boolean = false
  version:any = false
  loading:Object ={}

  pwdForm =  new FormGroup({
    ['usp']:                new FormControl('', [ Validators.required] ),
    ['new']:                new FormControl('', [ Validators.required, Validators.minLength(8)] ),
    ['control']:            new FormControl('', [ Validators.required ], this.isEqualPwd.bind(this) ),
  })

  matcher = new MyErrorStateMatcher();

  constructor( public _init: InitService, private _api: ApiService, private toastr: ToastrService) {
    this.version = `${Globals.CYCTITLE} ${Globals.CYCYEAR} ${Globals.VER}`
  }

  ngOnInit() {
    setTimeout( () => {
      this.init()
      this.show = true
    }, 5000)
  }

  init(){
    this.getZones()
    this.preferences['zonaHoraria'] = parseInt(this._init.preferences['zonaHoraria'])
    this.preferences['colorProfile'] = parseInt(this._init.preferences['colorProfile'])
  }

  getZones(){
    this._api.restfulGet( '', 'Preferences/listZonasHorarias')
        .subscribe( res => {
          this.zhs = res['data']
        })
  }

  chgPref( pref, event ){
    this._api.restfulPut( { [pref]: event.target.value }, 'Preferences/setPref' )
        .subscribe( res => {
          this.toastr.success( 'Cambio Guardado', 'Guardado' )
          this._init.getPreferences()
          setTimeout(() => this.init(),2000)
        }, err => {
          console.log('ERROR', err)
          this.init()
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)

        })
  }

  isEqualPwd( control: FormControl ): Promise<any>|Observable<any>{

    let thisData:any = this
    let flag:boolean = false
    let newp = thisData.pwdForm['controls']['new']['value']

    let promesa = new Promise(
      (resolve, reject) =>{

        if( newp != control.value ){
          resolve( {different: true})
          return promesa
        }else{
          resolve(null)
          return promesa
        }
      })
    return promesa
  }

  printConsole( f ){
    console.log(f)
  }

  chgPsw(){
    this.loading['pwd'] = true
    this._api.restfulPut( this.pwdForm.value, 'Login/chgPwd' )
        .subscribe( res => {
          this.loading['pwd'] = false
          this.toastr.success( 'Cambio Guardado', 'Guardado' )
          jQuery('#preferencesModal').modal('hide')
        }, err => {
          this.loading['pwd'] = false
          console.log('ERROR', err)
          this.init()
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)

        })
  }



}
