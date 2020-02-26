import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  message: Subject<any>

  constructor( private wsService: WebsocketService ) {
    // this.message = wsService
    //   .connect(environment.CHAT_URL)
    //   .map((response: MessageEvent): any => {
    //     let data = JSON.parse(response.data)
    //     return {
    //       author: data.author,
    //       message: data.message
    //     }
    //   }) as Subject<any>
   }
}
