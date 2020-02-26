import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styles: []
})
export class TableTemplateComponent implements OnInit {

  confTable:any
  dataTable:any
  dataRules:any
  windowInHeight:any

  searchStr:string

  built:boolean = false

  constructor() {

    this.windowInHeight = (Math.floor(window.innerHeight*0.8)) + 'px'

  }

  ngOnInit() {
  }

  build( config, data, rules ){
    this.confTable = config
    this.dataTable = data
    this.dataRules = rules

    this.built = true
  }

  printField( field, item, element ){

    let result:any

    if(this.confTable[field]){
      result = this.confTable[field]
    }else{

      result = {
        title:  field,
        style:  '',
        cell:   item,
        show:   true,
        type:   'span',
        faShow: false,
        faOnly: false,
        faClass: ''
      }
    }

    if(this.dataRules[field]){
      if(this.dataRules[field][item]){
        result.style  = this.dataRules[field][item].style
        result.cell   = this.dataRules[field][item].cell
        result.faClass   = this.dataRules[field][item].faClass
      }else{
        result.style  = this.dataRules[field]['default'].style
        result.cell   = this.dataRules[field]['default'].cell
        result.faClass   = this.dataRules[field]['default'].faClass
      }
    }else{
      result.cell = item
    }

    // tslint:disable-next-line:typeof-compare
    if( typeof this.confTable[field].custom != 'undefined' ){
      result.cell = this.confTable[field].custom(item)
    }

    return result[element]
  }

  filter( row, string ){
    if( string != '' && string != null ){
      let flag:boolean = false

      for( let item in row ){
        // console.log( item, row[item].toString() )
        if( row[item] != null && row[item].toString().toLowerCase().includes( string.toLowerCase() ) ){
          flag = true
        }

      }

      return flag


    }else{
      return true
    }
  }

}
