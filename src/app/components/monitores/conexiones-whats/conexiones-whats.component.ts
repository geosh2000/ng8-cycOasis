import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { WsService } from '../../../services/ws.service';
import { OrderPipe } from 'ngx-order-pipe';

@Component({
  selector: 'app-conexiones-whats',
  templateUrl: './conexiones-whats.component.html',
  styleUrls: ['./conexiones-whats.component.css']
})
export class ConexionesWhatsComponent implements OnInit, OnDestroy {

  // usuariosActivosObs: Observable<any>;
  usuariosActivosObs: Subscription;
  activeUsers = []
  totalUsers = {
    cyc: 0,
    wp: 0
  }

  constructor(
    public chatService: ChatService,
    public wsService: WsService,
    private orderPipe: OrderPipe
  ) { }

  ngOnInit() {
    this.usuariosActivosObs = this.chatService.getUsuariosActivos().subscribe(
      (res: []) => {
        console.log(res)

        let arr = []
        let obj = {}
        let totals = {
          cyc: 0,
          wp: 0
        }

        for( let r of res ){
          let name = String(r['nombre']).toLowerCase()
          if( obj[ name ] ){
            if( this.isWhats( r['urlRef'] ) ){
              obj[ name ]['sesionesWhats'] ++
              totals['wp']++
            }else{
              obj[ name ]['sesiones'] ++
              totals['cyc']++
            }
            obj[ name ]['details'].push(r)

          }else{
            obj[ name ] = {
              nombre: name,
              sesiones: 0,
              sesionesWhats: 0,
              details: [r]
            }

            if( this.isWhats( r['urlRef'] ) ){
              obj[ name ]['sesionesWhats'] ++
              totals['wp']++
            }else{
              obj[ name ]['sesiones'] ++
              totals['cyc']++
            }
          }
        }

        for( let u in obj ){
          if( obj.hasOwnProperty(u) ){
            arr.push(obj[u])
          }
        }

        arr = this.orderPipe.transform(arr, ['nombre'])
        this.activeUsers = arr
        this.totalUsers = totals
      }
    )
  }

  ngOnDestroy() {
    this.usuariosActivosObs.unsubscribe()
  }

  urlRefine( t, url = true ){
    if ( url ) {
      t = t.replace('https://cyc-oasishoteles.com/', '')
      t = t.replace('http://localhost:4200/', '')

      if ( t.indexOf('--') > 0 ) {
        t = t.substring(1, t.indexOf('--') - 1)
      }

      return t
    } else {
      if ( t.indexOf('--') > 0 ) {
        return t.substring(t.indexOf('--'), 10000)
      }else{
        return ''
      }
    }
 
  }

  isWhats( t ){
    if( t.match(/wp/g) ){
      return true
    }

    return false
  }

}
