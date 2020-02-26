import { Component, OnInit, Input } from '@angular/core';

import { ApiService } from '../../services/service.index';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-pbx-status',
  templateUrl: './pbx-status.component.html',
  styles: []
})
export class PbxStatusComponent implements OnInit {

  @Input() asesor:string = ''

  timerFlag:boolean = false
  timerCount:number = 5

  data:any
  agents:any
  loading:Object = {}
  pauses:Object = {}

  constructor( private _api:ApiService ) {
    this.getStatus()
    this.timerLoad()
  }

  getAgents(){

    this.loading['agents'] = true

    this._api.restfulPost( ['Agents'], 'Queuemetrics/rtMonitor' )
            .subscribe( res => {

              this.loading['agents'] = false
              let data = res['data']

              let json = data[0].json.replace( /(?:u')+/gmu, "'" ).replace( /(?:&nbsp;)+/gmu, "" )
              let result = JSON.parse( JSON.stringify(eval("(" + json + ")")) )

              let agents = {}
              for( let agent of result ){
                let info = { name: agent.descr_agente.replace( /(?: \([0-9]*\))+/g, "" ).trim(), ext: agent.nome_agente.replace( /(?:^agent\/)+/g, "" ) }
                agents[agent.nome_agente] = info
              }

              this.agents = agents

            }, err => {
              console.log("ERROR", err)
              this.loading['agents'] = false

            })

  }

  getStatus(){
      this.timerFlag = false
      this.loading['status'] = true

      let params = {
        block: 'RealtimeDO.RTAgentsLoggedIn'
      }

      this._api.restfulPut( params, 'Queuemetrics/pbxStatus' )
              .subscribe( res => {

                let data = res['data']
                let info
                let result = {}
                this.loading['status'] = false
                this.pauses = res['pausas']

                for(let item in data){
                  this.data = this.parseJson( data[item]['json'] )
                }

                for(let item in data){
                  info = this.parseJson( data[item]['json'] )
                }

                for( let agent in info ){
                  let aname = info[agent]['Agent']
                  let match
                  if( match = aname.match(/^[a-zA-Z]+ [a-zA-Z]+/gm) ){
                    if( match[0].replace(/\([0-9]+\)/gm,'').trim().replace(' ','.').toLowerCase() == this.asesor ){
                      result = info[agent]
                    }
                  }
                }

                this.data = result




                this.timerFlag = true

              }, err => {
                console.log("ERROR", err)
                this.loading['status'] = false

                let error = err.error
                console.error(err.statusText, error.msg)
              })
  }

  parseJson( data ){
    let json = data.replace( /(?![{\[ ])u(?=['])/gmu, "" ).replace( /(?:&nbsp;)+/gmu, "" )
    let result = JSON.parse( JSON.stringify(eval("(" + json + ")")) )
    delete result.result

    let final
    for( let item in result ){
      final = result[item]
    }

    let titles = {}
    for( let index in final[0] ){
      let titulo = final[0][index].replace( /(?: $)+/g, "" ).replace( /(?:^RT_)+/g, "" )
      if( titulo == "" ){
        titulo = 0
      }
      titles[index] = titulo
    }

    let resultado = {}
    for( let row in final ){
      resultado[row] = {}
      for( let index in final ){
        resultado[row][titles[index]] = final[row][index]
      }
    }

    delete resultado[0]

    return resultado
  }

  timerLoad(){

    if( this.timerCount <= 0 ){
      if( this.timerCount == 0 ){
        this.getStatus()
      }

      this.timerCount = 5
      this.timerFlag = false
    }

    if( this.timerFlag ){
      this.timerCount --
    }

    setTimeout( () => { this.timerLoad() }, 1000 )
  }

  ngOnInit() {
  }

  printT( time ){
    let min = Math.floor(time)
    let sec = Math.floor( (time - min)*60 );
    return `${min}:${ sec < 10 ? "0" + sec : sec }`

  }

}
