import { Injectable } from '@angular/core';
// tslint:disable-next-line: import-blacklist
import * as Rx from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private subject: Rx.Subject<MessageEvent>

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject){
      this.subject = this.create(url)
      console.log('Succesfully connect: ' + url )
    }
    return this.subject
  }

  private create(url): Rx.Subject<MessageEvent>{
    let ws = new WebSocket(url, ['37de200657fa5b5cfaa2ee33b7b8b8d067a983a8a95e0c1364291bff9ed1cf07'])

    // tslint:disable-next-line: deprecation
    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs)
        ws.onerror = obs.error.bind(obs)
        ws.onclose = obs.complete.bind(obs)
        return ws.close.bind(ws)
      }
    )

    let observer = {
      next: (data: Object) => {
        if( ws.readyState === WebSocket.OPEN){
          ws.send(JSON.stringify(data))
        }
      }
    }

    // tslint:disable-next-line: deprecation
    return Rx.Subject.create(observer, observable)
  }
}
