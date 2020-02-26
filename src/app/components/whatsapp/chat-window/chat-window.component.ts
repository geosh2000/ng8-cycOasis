import { Component, OnInit, Input, ViewChild, Inject, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';
import { ToastrService } from 'ngx-toastr';
import { OrderPipe } from 'ngx-order-pipe';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

declare var jQuery: any;
declare var autosize: any;
import * as moment from 'moment-timezone';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy {

  @Input() ticket:any
  @Input() agentId:any
  @Output() reload = new EventEmitter<any>()
  @ViewChild('convWindow', {static:false}) _conv
  chatData:any = []
  loading:Object = {}
  msgSend:any = ''
  file: File
  previewSrc = false
  tktData:Object = {}
  loaded = false
  imageForm: FormGroup
  timeout:any
  requester:any = 'Nombre Cliente'
  phone:any = ''
  rqId = 0

  constructor(public _api: ApiService,
              public _init: InitService,
              private _tokenCheck: TokenCheckService,
              private route: Router,
              private orderPipe: OrderPipe,
              private activatedRoute: ActivatedRoute,
              @Inject(DOCUMENT) private document: any,
              public toastr: ToastrService) {

    this.activatedRoute.params.subscribe( params => {
      if ( params.ticket ){
        this.ticket = params.ticket
        this.agentId = params.agentId
        this.getConv( this.ticket )
      }
    });

    this.imageForm = new FormGroup({
      fname:              new FormControl('', [ Validators.required,  ] ),
      dir:                new FormControl('', [ Validators.required,  ] ),
      imageFile:          new FormControl('', [ Validators.required,  ] )
    })

  }

  ngOnInit() {

  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  getConv( loc = this.ticket, to = false, rl = true  ){

    clearTimeout(this.timeout)

    // dummy element
    let dummyEl = document.getElementById('note');

    // check for focus
    let isFocused = (document.activeElement === dummyEl);

    this.loading['reading'] = true;

    this._api.restfulGet( loc, 'Whatsapp/getChat' )
                .subscribe( res => {

                  console.log(res)
                  this.loading['reading'] = false;
                  this.loaded = true
                  this.requester = res['data'][0]['reqName']
                  this.phone = res['data'][0]['reqPhone']
                  this.rqId = res['data'][0]['zdId']
                  let url = 'https://material.angular.io/assets/img/examples/shiba1.jpg'
                  jQuery('.client-image').css('background-image', 'url(' + url + ')');


                  let items = res['data']
                  let result:Object = {}
                  items = this.orderPipe.transform(items, 'date')

                  for( let i of items ){
                    i['dt'] = moment(i['date']).tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss')
                    let dt = moment(i['date']).tz('America/Bogota').format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') ? 'HOY' : moment(i['date']).tz('America/Bogota').format('YYYY-MM-DD')
                    if( result[dt] ){
                      result[dt].push(i)
                    }else{
                      result[dt] = [i]
                    }

                    i['attachments'] = JSON.parse(i['attachments'])
                  }

                  this.chatData = result

                  if(isFocused){
                    jQuery('#note').focus()
                  }

                  if( to ){
                    setTimeout( () => {
                      this.scrollBtm()
                      if(isFocused){
                        jQuery('#note').focus()
                      }
                    },500)
                  }

                  if( rl ){
                    this.timeout = setTimeout( () => {
                      this.getConv()
                    },60000)
                  }

                }, err => {
                  if( rl ){
                    this.timeout = setTimeout( () => {
                      this.getConv()
                    },10000)
                  }

                  this.loading['reading'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  scrollBtm(){
    document.getElementById('link').click();
  }

  formatTime(t,f){
    return moment(t).format(f)
  }

  auto_grow(el) {
    let txt = el.value
    this.msgSend = txt
    let arr = txt.split('\n')
    let r = 0;
    for(let l of arr){
      r++
      let c = 0
      if( l != '' ){
        let line = l.split(' ')
        for( let col of line ){
          c++
          if( col.length + c > 60 ){
            r++
            c = col.length
          }else{
            c += col.length
          }
        }
      }

    }

    if( r > 5 ){
      r = 5
      jQuery('#note').css('overflow','auto')
    }else{
      jQuery('#note').css('overflow','hidden')
    }
    jQuery('#note').attr('rows',r)

  }

  addImageOpenModal(){
    jQuery('#formUploadImageComponent').modal('show')
  }

  readImg( file ){

    if(file.files && file.files[0]){
      console.log('Imagen cargada')

      let reader = new FileReader();
      reader.onload = (e) => {
        console.log(e)
        jQuery('#previewImg').attr('src', e.target['result'])
      }
      this.previewSrc = true
      reader.readAsDataURL(file.files[0])
    }else{
      this.previewSrc = false
      console.error('No existe ninguna imagen cargada')
    }
  }

  getFile( f ){
    console.log('recieved file', f)
    let Image = f

    if( Image.files && Image.files[0] ){
      this.file = Image.files[0]
    }

    let ImageFile: File = this.file
    this.readImg(Image)
  }

  deleteAttach(){
    this.previewSrc = false
    this.file = null
  }

  uploadFile(i = this.file){
    let formData: FormData = new FormData()
    formData.append( 'fname', 'attch'+moment().format('u'))
    formData.append( 'dir',   'img')
    formData.append( 'image', i, i.name)

    this._api.restfulImgPost( formData, 'UploadImage/uploadZd' )
            .subscribe( res => {

              console.log(res)

              if( !res['ERR'] ){
                this.file = null
                this.previewSrc = false
                return true
              }else{
                return false
              }

            })
  }

  submit(){
    clearTimeout(this.timeout)
    this.loaded = false
    this.loading['reading'] = true;

    let params = {
      ticket: this.ticket,
      msg: jQuery('#note').val(),
      author: this.agentId
    }
    this._api.restfulPut( params, 'Whatsapp/sendMsg' )
                .subscribe( res => {

                  this.timeout = setTimeout( () => {
                    this.loading['reading'] = false;
                    jQuery('#note').val('')
                    jQuery('#note').attr('rows',1)
                    this.loaded = true
                    this.reload.emit(true)
                    this.getConv(this.ticket, true, true)

                  },500)

                }, err => {

                  this.loading['reading'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }


}