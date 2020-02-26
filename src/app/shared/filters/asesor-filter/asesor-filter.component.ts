import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'angular-2-dropdown-multiselect';

import { ApiService } from '../../../services/service.index';

@Component({
  selector: 'app-asesor-filter',
  templateUrl: './asesor-filter.component.html',
  styles: []
})
export class AsesorFilterComponent implements OnInit {

  @Input() currentUser:any
  @Input() selection:any = []
  @Output() result:EventEmitter<any> = new EventEmitter()
  @Output() close:EventEmitter<any> = new EventEmitter()

  // Filters
  @Input() active:number  = 2
  @Input() udn:any
  @Input() area:any
  @Input() dep:any
  @Input() puesto:any

  credentials:Object = {
    viewAll:  0,
    udn:      0,
    area:     0,
    dep:      0,
    puesto:   0
  }

  // Settings configuration
  selectorSettings: IMultiSelectSettings = {
      enableSearch: true,
      checkedStyle: 'checkboxes',
      buttonClasses: 'btn btn-secondary btn-block',
      dynamicTitleMaxItems: 3,
      displayAllSelectedText: true,
      showCheckAll: true,
      showUncheckAll: true,
      maxHeight:  '200px'
  };

  // Text configuration
  textSups: IMultiSelectTexts = {
      checkAll: 'Select all',
      uncheckAll: 'Unselect all',
      checked: 'asesor seleccionado',
      checkedPlural: 'asesores seleccionados',
      searchPlaceholder: 'Find',
      searchEmptyResult: 'Sin coincidencias...',
      searchNoRenderText: 'Escribe para encontrar resultados...',
      defaultTitle: 'Selecciona Supervisor',
      allSelected: 'Todo Seleccionado'
  };

  textAsesores: IMultiSelectTexts = {
      checkAll: 'Select all',
      uncheckAll: 'Unselect all',
      checked: 'asesor seleccionado',
      checkedPlural: 'asesores seleccionados',
      searchPlaceholder: 'Find',
      searchEmptyResult: 'Sin coincidencias...',
      searchNoRenderText: 'Escribe para encontrar resultados...',
      defaultTitle: 'Selecciona Asesor',
      allSelected: 'Todo Seleccionado',
  };

  asesores:any = []
  selectionSup:any = []
  supervisores:any = []
  selectionOK:any = []
  showList:any
  nameAsesores:any = {}
  supers:any = {}

  bySup:boolean = false

  loading:Object = {}

  constructor(private _api:ApiService) {

  }

  getAsesores(){
    this.loading['asesores'] = true

    this._api.restfulPut( this.credentials,'Headcount/asesoresList' )
            .subscribe( res => {
              let tmpSups = []
              this.loading['asesores'] = false
              this.asesores = res['data']
              for( let item of res['data'] ){

                // Name Asesores
                this.nameAsesores[item['id']]=item['name']

                // Options Supers
                if(item['supId'] != '' && item['supId'] != null ){
                  if( tmpSups.indexOf(item['supId']) < 0 ){
                    tmpSups.push(item['supId'])
                    this.supervisores.push({ id: item['supId'], name: item['sup']} )
                  }
                }

                // List Supervisores
                if( this.supers[item['supId']] ){
                  this.supers[item['supId']].push(item['id'])
                }else{
                  this.supers[item['supId']]= [item['id']]
                }

              }

              this.changeList( this.bySup )
              // console.log(this.asesores)
              // console.log(this.supervisores)

            }, err => {
              console.log('ERROR', err)

              this.loading['asesores'] = false

              let error = err.error
              console.error(err.statusText, error.msg)

            })
  }

  ngOnInit() {
    this.build()
  }

  filterBuild( cur, cred, input ){
    if( input && !Array.isArray(input) ){
      if( input == 'self' ){
        if( cur['credentials']['view_all_agents'] == 1 ){
          this.credentials[ cred ] = 0
        }else{
          this.credentials[ cred ] = cur['hcInfo'][`hc_${ cred }`]
        }
      }else{
        this.credentials[ cred ] = 0
      }
    }else{
      if( input ){
        if( Array.isArray(input) ){
          this.credentials[ cred ] = input
        }else{
          this.credentials[ cred ] = [input]
        }
      }else{
        this.credentials[ cred ] = 0
      }
    }


  }

  build(){
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if( this.currentUser != null ){

      this.filterBuild( this.currentUser, 'udn'    , this.udn    )
      this.filterBuild( this.currentUser, 'area'   , this.area   )
      this.filterBuild( this.currentUser, 'dep'    , this.dep    )
      this.filterBuild( this.currentUser, 'puesto' , this.puesto )

    }

    this.getAsesores()

  }

  selectorChange( event, type ){
    switch(type){
      case 'asesor':
        this.result.emit( event )
        break
      case 'sup':
        let selection = []
        for( let item of event ){
          if( event != null ){
            selection = selection.concat( this.supers[item] )
          }
        }
        this.selection = []
        for( let item of selection ){
          if( item != null ){
            this.selection.push(item)
          }
        }

        this.selectionOK = this.selection
        this.result.emit( this.selection )
        break
    }
    // if( type == 'asesor' ){
    //   this.selectionOK = this.selectionOK.concat( event )
    //   this.selection = this.selectionOK
    //   this.result.emit( this.selectionOK )
    // }else{
    //
    // }
  }

  changeList( event ){
    if( event ){
      this.showList = this.supervisores
    }else{
      this.showList = this.asesores
    }
  }

  closeFilter(){
    this.close.emit(true)
  }

}
