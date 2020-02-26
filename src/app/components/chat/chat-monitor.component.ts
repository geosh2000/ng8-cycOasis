import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-monitor',
  templateUrl: './chat-monitor.component.html',
  styles: []
})
export class ChatMonitorComponent implements OnInit {

  constructor( private chatService: ChatService ) { 
    chatService.message.subscribe( msg => {
      console.log('Response from server: ', msg)
    } )
  }

  private message = {
    author: 'Jorge Sanchez',
    message: 'Esta vivo!'
  }

  sendMsg(){
    console.log('Nuevo mensaje enviado por el cliente')
    this.chatService.message.next(this.message)
  }

  ngOnInit() {
  }

}
