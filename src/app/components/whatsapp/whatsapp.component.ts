import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { InitService, TokenCheckService, ApiService } from 'src/app/services/service.index';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderPipe } from 'ngx-order-pipe';
import { ToastrService } from 'ngx-toastr';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ConversationsComponent } from './conversations/conversations.component';


declare var jQuery: any;

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.css']
})
export class WhatsappComponent implements OnInit, OnDestroy {

  @ViewChild(ChatWindowComponent, {static: true}) _chat:ChatWindowComponent
  @ViewChild(ConversationsComponent, {static: false}) _conv:ConversationsComponent

  ticket:any
  agentId:any
  loading:Object = {}
  agent:Object = {}
  timeout:any
  userInfo = {}
  originalUserInfo = {}
  rsvHistory = []
  seeChat = false

  constructor(public _api: ApiService,
              public _init: InitService,
              private _tokenCheck: TokenCheckService,
              private route: Router,
              private orderPipe: OrderPipe,
              private activatedRoute: ActivatedRoute,
              public toastr: ToastrService) {

    this.agentId = this._init.currentUser.hcInfo.zdId

    this.activatedRoute.params.subscribe( params => {

      if ( params.ticket ){
        this.ticket = params.ticket
        this._chat.getConv( this.ticket )
      }else{
        this.getAgent( this.agentId )
      }
    });

  }

  ngOnInit() {
    console.log(this._chat)
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  test(){
    console.log(this._chat.tktData)
    console.log(this._chat.tktData['requester']['photo']['content_url'])
  }

  getAgent( agentId  ){
    this.loading['user'] = true;

    this._api.restfulGet( agentId, 'Calls/showUser' )
                .subscribe( res => {

                  this.loading['user'] = false;
                  console.log(res['data'])
                  this.agent = res['data']['data']['user']

                  jQuery('.agent-name').text(this.agent['name'])
                  let url = 'https://material.angular.io/assets/img/examples/shiba1.jpg'
                  if( this.agent['photo'] ){
                    url = this.agent['photo']['content_url'] ? this.agent['photo']['content_url'] : 'https://material.angular.io/assets/img/examples/shiba1.jpg'
                  }
                  jQuery('.user-image').css('background-image', 'url(' + url + ')');

                }, err => {
                  this.loading['user'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  closeTkt( tkt = this.ticket  ){
    this._chat.loading['reading'] = true;
    this.loading['closing'] = true;

    this._api.restfulGet( tkt, 'Whatsapp/solve' )
                .subscribe( res => {

                  this._chat.loading['reading'] = false;
                  this.loading['closing'] = false;
                  this._conv.getTickets()


                }, err => {
                  this._chat.loading['reading'] = false;
                  this.loading['closing'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  chgConv( id ){
    this.seeChat = true
    this.ticket = id
    // clearTimeout(this._chat.timeout)
    this._chat.getConv(id, true)
  }

  reloadConv(){
    console.log('reload')
    clearTimeout(this._conv.timeout)
    this._conv.getTickets()
  }

  reloadChat(tkt){
    this.ticket = tkt
    clearTimeout(this._chat.timeout)
    this._chat.getConv(tkt)
  }

  getUserInfo( zdId = this._chat.rqId ){
    this.loading['userInfo'] = true;
    this.userInfo = {}
    this.originalUserInfo = {}

    this._api.restfulGet( zdId, 'Calls/showUser' )
                .subscribe( res => {

                  this.loading['userInfo'] = false;
                  this.userInfo['name'] = res['data']['data']['user']['name']
                  this.userInfo['email'] = res['data']['data']['user']['email']
                  this.userInfo['phone'] = res['data']['data']['user']['phone']
                  this.userInfo['rqId'] = zdId

                  if( res['data']['data']['user']['user_fields'] && res['data']['data']['user']['user_fields'] ){
                    this.userInfo['whatsapp'] = res['data']['data']['user']['user_fields']['whatsapp'] ? res['data']['data']['user']['user_fields']['whatsapp'] : ''
                  }else{
                    this.userInfo['whatsapp'] = ''
                  }

                  this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo))
                  this.getRsvHistory()


                }, err => {
                  this._chat.loading['reading'] = false;
                  this.loading['userInfo'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  saveUserInfo(f){
    this.loading['savingUI'] = true;

    this._api.restfulPut( {values: this.userInfo, field: f}, 'Calls/updateUserV2' )
                .subscribe( res => {

                  this.loading['savingUI'] = false;
                  this.getUserInfo()

                }, err => {
                  this._chat.loading['reading'] = false;
                  this.loading['savingUI'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  tabSelected( e ){
    console.log(e.tab.textLabel)
    if( e.tab.textLabel == 'Reservas' ){
      this.getRsvHistory()
    }
  }

  getRsvHistory( zdClientId = this._chat.rqId ){

    this.loading['rsvHistory'] = true
    this.rsvHistory = []

    this._api.restfulGet( zdClientId, 'Rsv/getRsvHistory' )
                .subscribe( res => {

                  this.loading['rsvHistory'] = false;
                  this.rsvHistory = res['data']

                }, err => {
                  this.loading['rsvHistory'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

}