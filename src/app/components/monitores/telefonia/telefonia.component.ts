import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment-timezone';
// import { CallStatisticsComponent } from '../calls/call-statistics.component';
import { Title } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';
// import { QueuesV3Component } from '../queues-v3/queues-v3.component';
import { read } from 'xlsx';

@Component({
  selector: 'app-telefonia',
  templateUrl: './telefonia.component.html',
  styles: [`

    .example-card {
      max-width: 400px;
    }

    .example-header-image {
      background-size: cover;
    }
    .mat-call {
      background-color: #8bc34a;
      color: 'black';
    }
    .mat-pause {
      background-color: #f1d449;
      color: 'black';
    }
    .mat-avail {
      background-color: #efefef;
      color: 'black';
    }
    .mat-unavail {
      background-color: #7e8184;
      color: #bfbcb8;
    }
    .mat-wrap {
      background-color: #71c4ff;
      color: 'black';
    }
  `]
})
export class TelefoniaComponent implements OnInit, OnDestroy {

  data = {
    status: [],
    agStatus: [],
    agOverview: [],
    stOverview: []
  }

  dataRAW = []

  dataOk = {
    agents: [],
    sum: []
  }
  loading = {}

  showOpt = 'detail'

  tps = {
    status: ['talkStatus','current_queue_activity'],
    agStatus: ['talkAgentStatus','agents_activity'],
    agOverview: ['talkAgentOverview','agents_overview'],
    stOverview: ['talkStatsOverview','account_overview']
  }

  constructor( private titleService: Title,
               public _api: ApiService,
               public toastr: ToastrService,
               private activatedRoute:ActivatedRoute ) {
    this.activatedRoute.params.subscribe( params => {
      this.showOpt = params.a ? params.a : 'detail'
    })

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Monitor Telefonía');
    // for( let t in this.tps ){
    //   if( this.tps.hasOwnProperty(t) ){
    //     this.getData(t)
    //   }
    // }
  }

  ngOnDestroy() {
    // clearTimeout(this.timeout)
  }

  getData( tp ) {

    this.loading['data'] = true;

    this._api.restfulGet( '', `Calls/${this.tps[tp][0]}` )
                .subscribe( res => {

                  this.loading['data'] = false;
                  this.data[tp[0]] = res['data']

                  this.dataRAW.push(res['data']['data'][this.tps[tp][1]])
                  for( let f in res['data']['data'][this.tps[tp][1]]){
                    if( res['data']['data'][this.tps[tp][1]].hasOwnProperty(f)){
                      if( this.tps[tp][1] == 'agents_activity'){
                        this.dataOk['agents'].push(res['data']['data'][this.tps[tp][1]][f])
                      }else{
                        this.dataOk['sum'].push([f, res['data']['data'][this.tps[tp][1]][f]])
                      }
                    }
                  }

                  console.log(this.dataOk)

                }, err => {
                  this.loading['data'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  timePrint( s ){
    let duration = moment.duration(s, 'seconds');
    return duration.format('HH:mm:ss');
  }

  printVal( f, g ){

    if( typeof g === 'object' ){
      return JSON.stringify(g)
    }

    if( f.match(/time/g) || f.match(/duration/g) ){
      let r = moment.duration(g, 'seconds')
      let hours:any = Math.floor(r.asHours())
      let minutes:any = Math.floor(r.asMinutes()) - ( hours * 60 )
      let seconds:any = Math.floor(r.asSeconds()) - ( Math.floor(r.asMinutes()) * 60 )

      if( hours < 10 ){ hours = `0${ hours }` }
      if( minutes < 10 ){ minutes = `0${ minutes }` }
      if( seconds < 10 ){ seconds = `0${ seconds }` }

      return `${ hours }:${ minutes }:${ seconds }`

    }else{
      return g
    }
  }

  bgStatus( s ){
    switch(s['agent_state']){
      case 'online':
        switch(s['call_status']){
          case null:
            return 'mat-avail'
          case 'on_call':
            return 'mat-call'
          case 'wrap_up':
            return 'mat-wrap'
        }
        break
      case 'offline':
        return 'mat-unavail'
      case 'away':
        return 'mat-pause'
    }
  }

}
