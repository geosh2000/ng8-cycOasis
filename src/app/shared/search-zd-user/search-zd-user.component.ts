import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-zd-user',
  templateUrl: './search-zd-user.component.html',
  styleUrls: ['./search-zd-user.component.css'],
  encapsulation: ViewEncapsulation.None
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
  noResults = false
  selectedClient:any
  idiomas:Object = [
    {idioma: 'español', lang: 'idioma_es'},
    {idioma: 'inglés', lang: 'idioma_en'},
    {idioma: 'francés', lang: 'idioma_fr'},
    {idioma: 'portugués', lang: 'idioma_pt'}
  ]

  noEditable = false

  constructor(public _api: ApiService,
              private orderPipe: OrderPipe,
              public toastr: ToastrService) {
                  this.newClientForm =  new FormGroup({
                    ['name']:    new FormControl('', [ Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚ]{1}[a-záéíóúA-ZÁÉÍÓÚ\\sñ]*$')]),
                    ['email']:   new FormControl('', [ Validators.required, Validators.pattern('^(.)+@(.)+\\.(.)+$')]),
                    ['phone']:   new FormControl('', [ Validators.pattern('^(\\+){1}[1-9]\\d{10,14}$')]),
                    ['wa']:   new FormControl('', [ ]),
                    ['lang']:   new FormControl('', [ Validators.required ]),
                  })
                }

  ngOnInit() {
  }

  selectedLang(e){
    this.newClientForm.controls['lang'].setValue(e.value)
  }

  search(){

    this.loading['search'] = true;
    this.newClientForm.reset()
    this.newClientForm.controls['email'].setValue(this.mail)
    this.noResults = false
    this.selectedClient = null
    this.noEditable = false


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

    console.log(i)
    console.log( i['user_fields']['idioma_cliente'] )
    console.log(this.newClientForm )
    console.log( this.newClientForm.status == 'VALID' )

    this.edit(i, false)

    if( !i['user_fields']['idioma_cliente'] || this.newClientForm.status == 'INVALID' ){
      this.edit(i)
    }else{
      this.selectedClient = null
      this.selected.emit( i )
      this.newClientForm.reset()
      this.mail = ''
      this.data= []
    }
  }

  reset(){
    this.newClientForm.reset()
    this.mail = ''
    this.data= []
  }

  edit( i, selFlag = true ){

    if( selFlag ){
      this.selectedClient = i
    }

    this.newClientForm.controls['name'].setValue(i['name'])
    this.newClientForm.controls['phone'].setValue(i['phone'])
    this.newClientForm.controls['email'].setValue(i['email'])
    this.newClientForm.controls['wa'].setValue(i['user_fields']['whatsapp'])
    this.newClientForm.controls['lang'].setValue(i['user_fields']['idioma_cliente'])
    this.newClientForm.markAllAsTouched()
  }

  printForm(){
    console.log(this.newClientForm.controls)
  }

  newClient(){

    this.loading['create'] = true

    let item

    let params = {
      name: this.newClientForm.controls['name'].value,
      email: this.newClientForm.controls['email'].value,
      phone: this.newClientForm.controls['phone'].value,
      user_fields: {}
    }

    params['user_fields']['idioma_cliente'] = this.newClientForm.controls['lang'].value
    params['user_fields']['whatsapp'] = this.newClientForm.controls['wa'].value

    this._api.restfulPut( params, 'Calls/createUpdateUser' )
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

  isTicket( t ){
    if( t.length > 0 ){
      return t.match(/^\d{5,}$/gm) ? true : false
    }

    return false
  }

  searchFromTicket(){
    this.loading['search'] = true;
    this.newClientForm.reset()
    this.newClientForm.controls['email'].setValue(this.mail)
    this.noResults = false
    this.selectedClient = null
    this.noEditable = false


    this._api.restfulGet( this.mail, 'Calls/viewTicketSide' )
                .subscribe( res => {

                  this.loading['search'] = false;
                  let r = res['data']['data']
                  let rqId = r['ticket']['requester_id']
                  let result = []
                  for( let u of r['users'] ){
                    if( u['id'] == rqId ){
                      if( u['tags'].indexOf('noedit') >= 0 ){
                        this.noEditable = true
                      }
                      result.push(u)
                    }
                  }

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

}
