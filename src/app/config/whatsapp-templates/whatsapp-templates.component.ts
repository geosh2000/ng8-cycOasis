import { Component, OnInit } from '@angular/core';
import { ApiService, InitService, TokenCheckService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { EasyTableServiceService } from '../../services/easy-table-service.service';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-whatsapp-templates',
  templateUrl: './whatsapp-templates.component.html',
  styleUrls: ['./whatsapp-templates.component.css']
})
export class WhatsappTemplatesComponent implements OnInit {

  loading:Object = {}

  config:EasyTableServiceService
  columns:any = [
    { type: 'default', key: 'id', title: 'ID' },
    { type: 'edit', key: 'idioma', title: 'Idioma' },
    { type: 'edit', key: 'categoria', title: 'Categoria' },
    { type: 'edit', key: 'titulo', title: 'Titulo' },
    { type: 'edit', key: 'texto', title: 'Template' },
    { type: 'activate', key: 'activo', title: '(Des)activar' },
    { type: 'delete', key: 'activo', title: 'Borrar' },
    { type: 'date', key: 'dtCreated', title: 'Creado' },
    { type: 'default', key: 'creador', title: 'Creado Por' },
    { type: 'date', key: 'Last_Update', title: 'Actualizado' },
  ]

  templates = []
  original = []
  newTemplateForm:FormGroup

  constructor(public _api: ApiService,
              public _init: InitService,
              private titleService: Title,
              private _tokenCheck: TokenCheckService,
              public toastr: ToastrService) {
                this.newTemplateForm =  new FormGroup({
                  ['idioma']:    new FormControl('', [ Validators.required]),
                  ['categoria']:   new FormControl('', [ Validators.required]),
                  ['titulo']:   new FormControl('', [ Validators.required]),
                  ['texto']:   new FormControl('', [ Validators.required])
                })
              }

  ngOnInit() {
    this.titleService.setTitle('CyC - Templates Manager');

    this.config = EasyTableServiceService.config
    this.config['paginationEnabled'] = true
    this.config['rows'] = 20
    this.config['paginationRangeEnabled'] = true
    this.config['tableLayout']['style'] = 'tiny'
    this.config['searchEnabled'] = true

    this.getTemplates()
  }

  getTemplates(){
    this.loading['templates'] = true;

    this._api.restfulPut( '', 'Lists/waTemplates' )
                .subscribe( res => {

                  this.loading['templates'] = false;

                  this.templates = res['data']
                  this.original = JSON.parse(JSON.stringify(this.templates))

                }, err => {

                  this.loading['templates'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  formatDate( d, f ){
    return moment(d).format(f)
  }

  activateTmpl( i, f){

    let ind = 0
    for(let x of this.original){
      if( x['id'] == i['id']){
        break
      }
      ind++
    }

    i['load_activate'] = true;

    this._api.restfulPut( {id: i['id'], flag: f}, 'Whatsapp/activateTemplate' )
                .subscribe( res => {

                  i['load_activate'] = false;
                  i['activo'] = f ? 1 : 0
                  this.original[ind]['activo'] = f ? 1 : 0
                  i['Last_Update'] = moment().format('YYYY-MM-DD')
                  this.original[ind]['Last_Update'] = i['Last_Update']

                }, err => {

                  i['load_activate'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  deleteTmpl( i ){
    i['load_delete'] = true;

    this._api.restfulPut( {id: i['id']}, 'Whatsapp/deleteTemplate' )
                .subscribe( res => {

                  i['load_delete'] = false;
                  this.getTemplates()

                }, err => {

                  i['load_delete'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  editTmpl( i, f, jqi ){

    i[f + '_edit'] = true;
    let ind = 0
    for(let x of this.original){
      if( x['id'] == i['id']){
        break
      }
      ind++
    }

    let val = jQuery('#'+jqi).val()

    this._api.restfulPut( {id: i['id'], val, field: f}, 'Whatsapp/editTemplate' )
                .subscribe( res => {

                  i[f + '_edit'] = false;
                  i[f + '_editFlag'] = false
                  i[f] = val
                  this.original[ind][f] = i[f]
                  i['Last_Update'] = moment().format('YYYY-MM-DD')
                  this.original[ind]['Last_Update'] = i['Last_Update']

                }, err => {

                  i[f + '_edit'] = false;
                  i[f + '_editFlag'] = false

                  i[f] = this.original[ind][f]

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  cxlEdit(r, f){
    let i = 0
    for(let x of this.original){
      if( x['id'] == i['id']){
        break
      }
      i++
    }
    r[f] = this.original[i][f]
  }

  newLine( t ){
    return t.replace(/[\n]/gm,'<br>')
  }

  openAddTemplate(){
    this.newTemplateForm.reset()
    jQuery('#addTemplate').modal('show')
  }

  addTemplate(){
    this.loading['addTemplate'] = true;
    this.loading['templates'] = true;

    this._api.restfulPut( this.newTemplateForm.value, 'Whatsapp/createTemplate' )
                .subscribe( res => {

                  this.loading['addTemplate'] = false
                  this.templates.push(res['data'])
                  this.original.push(res['data'])

                  this.loading['templates'] = false;
                  jQuery('#addTemplate').modal('hide')
                }, err => {

                  this.loading['addTemplate'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }




}
