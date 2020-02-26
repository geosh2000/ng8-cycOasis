import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiService, InitService } from 'src/app/services/service.index';
import { ToastrService } from 'ngx-toastr';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook, readFile, read as readXlsx } from 'xlsx';

declare var jQuery:any;
import * as Globals from '../../globals';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styles: []
})
export class TestComponent implements OnInit {

  imageForm: FormGroup
  imageFileUp: File
  data:any

  constructor( public _api: ApiService,
               public _init: InitService,
               public toastr: ToastrService ) { }

  ngOnInit() {
  }

  readXls(){
    let url = `formatos`
    let file = `trasladoVcm.xlsx`
    let test = Globals.PRODENV == 1 ? false : false

    this._api.getFile( file, url, test )
        .subscribe( f => {
          let data = new Uint8Array(f);
          let workbook = readXlsx(data, {type:'array'});
          let sheetName = workbook.SheetNames[0]
          let jsonFile = utils.sheet_to_json( workbook.Sheets[sheetName], {raw: true, defval:null} )

          workbook.Sheets[sheetName]['G13'] = {
                                                t: 's',
                                                v: '2',
                                                r: '<t>2</t>',
                                                h: '2',
                                                w: '2'
                                              }
          workbook.Sheets[sheetName]['G14'] = {
                                                t: 's',
                                                v: '1',
                                                r: '<t>1</t>',
                                                h: '1',
                                                w: '1'
                                              }
          workbook.Sheets[sheetName]['G15'] = {
                                                t: 's',
                                                v: '0',
                                                r: '<t>0</t>',
                                                h: '0',
                                                w: '0'
                                              }

          this.data = workbook.Sheets[sheetName]

          this.download( workbook, 'Solicitud de TrasladoVCM' )
        }, er => {
            console.log('ERROR', er)
            this.toastr.error( er, 'Error' )
        })
  }

  download( wb, bkName ){
    // let wb:any

    // wb = { SheetNames: ['Solicitud Traslado VCM'], Sheets: {sh} };

    let wbout = write(wb, { bookType: 'xlsx', bookSST: true, type:
'binary' });

    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/vnd.ms-excel' }), `${bkName}.xlsx`)
  }

  s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    // tslint:disable-next-line:no-bitwise
    for (let i=0; i!=s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
    return buf;
  }


}
