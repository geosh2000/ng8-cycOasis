import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { ApiService, InitService } from '../../services/service.index';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: [`
    .pad-0 > div{
      padding:0 important!
    }
  `]
})
export class SidebarComponent implements OnChanges {

  @Input() showContents:boolean = false

  @Output() sideBar = new EventEmitter

  loading:Object = {}
  closed:Object = {}
  openedTab:any
  menuData:any = []

  constructor( private _api:ApiService, private toastr: ToastrService, public _init:InitService ) { }

  ngOnChanges() {
    if( this.showContents ){
      this.getMenu()
    }else{
      this.menuData = []
    }
  }

  buildLevel( array ){
    let arr = {
      '1': [],
      '2': [],
      '0': []
    }

    for( let item of array ){
      item['titulo'] = item['titulo'].replace(/\<br\>/g, ' ')
      this.closed[item['id']] = true
      // item['titulo'] = '<small>'+item['titulo']+'</small>'
      arr[item['level']].push(item)
    }

    return arr
  }

  getMenu(){
    this.loading['menu'] = true

    this._api.restfulGet( '', 'Navbar/menuRAW')
        .subscribe( res => {

          this.loading['menu'] = false

          let menu =  this.buildLevel( res['data'] )

          for( let item of menu['1'] ){
            item['sub'] = []
            for( let sub of menu['2'] ){
              if( sub['parent'] == item['id'] ){
                item['sub'].push(sub)
              }
            }
          }

          for( let item of menu['0'] ){
            item['sub'] = []
            for( let sub of menu['1'] ){
              if( sub['parent'] == item['id'] ){
                item['sub'].push(sub)
              }
            }
          }

          this.menuData = menu['0']
          // console.log(menu['0'])

        }, err => {
          console.log('ERROR', err)
          this.loading['menu'] = false
          let error = err.error
          this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
          console.error(err.statusText, error.msg)
        })
  }

  openMenu( id ){
    jQuery(id).openMenu()
  }

  goTo( liga ){
    this.sideBar.emit( false )
    location.href=liga
  }

  closeMenu( event, id ){
    if( this.openedTab ){
      this.openedTab.close()
    }

    this.openedTab = event
    event.open()

  }

}
