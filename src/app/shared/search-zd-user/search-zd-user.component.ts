import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-zd-user',
  templateUrl: './search-zd-user.component.html',
  styleUrls: ['./search-zd-user.component.css']
})
export class SearchZdUserComponent implements OnInit {

// tslint:disable-next-line: new-parens
  @Output() selected = new EventEmitter

  orderChosen:any = 'name'

  mail:any = ''
  loading:Object = {
  }
  data:any = []
  newClientForm:FormGroup
  noResults:boolean = false

  constructor(public _api: ApiService,
                private orderPipe: OrderPipe,
                public toastr: ToastrService) { 
                  this.newClientForm =  new FormGroup({
                    ['name']:    new FormControl('', [ Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚ]{1}[a-záéíóúA-ZÁÉÍÓÚ\\sñ]*$')]),
                    ['email']:   new FormControl('', [ Validators.required, Validators.pattern('^(.)+@(.)+\\.(.)+$')]),
                    ['phone']:   new FormControl('', [ Validators.pattern('^(\\+){1}[1-9]\\d{10,14}$')]),
                    ['wa']:   new FormControl('', [ ]),
                  })
                }

  ngOnInit() {
  }

  search(){

    this.loading['search'] = true;
    this.newClientForm.reset()
    this.newClientForm.controls['email'].setValue(this.mail)
    this.noResults = false


    this._api.restfulPut( {mail: this.mail}, 'Calls/searchUser' )
                .subscribe( res => {

                  this.loading['search'] = false;
                  let result = res['data']
                  result = this.orderPipe.transform(result, this.orderChosen)

                  this.data = result
                  if( this.data.length == 0 ){
                    this.noResults = true
                  }

                }, err => {
                  this.loading['search'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  select( i ){
    this.selected.emit( i )
    this.newClientForm.reset()
    this.mail = ''
    this.data= []
  }

  reset(){
    this.newClientForm.reset()
    this.mail = ''
    this.data= []
  }

  edit( i ){
    this.newClientForm.controls['name'].setValue(i['name'])
    this.newClientForm.controls['phone'].setValue(i['phone'])
    this.newClientForm.controls['wa'].setValue(i['user_fields']['whatsapp'])
    this.newClientForm.controls['email'].setValue(i['email'])
  }

  newClient(){

    let item

    this._api.restfulPut( this.newClientForm.value, 'Calls/createUpdateUser' )
                .subscribe( res => {

                  this.loading['create'] = false;
                  item = res['data']['data']['user']
                  this.select(item)

                }, err => {
                  this.loading['create'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });


  }

  orderBy( e ){
    this.orderChosen = e.value
    this.data = this.orderPipe.transform(this.data, e.value)
  }

}
