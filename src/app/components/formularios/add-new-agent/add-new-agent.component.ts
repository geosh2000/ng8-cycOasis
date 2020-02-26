import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { BatchAsesorFormComponent } from '../../hc/altas-batch/batch-asesor-form/batch-asesor-form.component';

@Component({
  selector: 'app-add-new-agent',
  templateUrl: './add-new-agent.component.html',
  styles: []
})
export class AddNewAgentComponent implements OnInit, OnDestroy {

  @ViewChildren('batchCmp') _batch:QueryList<BatchAsesorFormComponent>
  @Output() goTo = new EventEmitter

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  listFlag:boolean = false
  large:boolean = true
  showSave:boolean = true
  mainCredential:string = 'hc_agregar_asesore'

  imageForm: FormGroup
  imageFileUp: File
  jsonFile:any
  @ViewChild('imageFile',{static:false}) image_File

  loading:Object = {}
  saving:boolean = false
  vacantesList:any
  listProfiles:any
  selectedVac:any []
  selectVacIndex:Object = {}
  xlsData:any = []
  newId:any

  resetFlag:any
  resetVac:any

  results:any = []
  summary:Object = {}
  timeout:any

  pais = {Pais: 'MX'}

  constructor(public _api: ApiService,
      public _init:InitService,
      private titleService: Title,
      private _tokenCheck:TokenCheckService,
      public toastr: ToastrService) {

    this.populateProfiles()
    this.build('MX')

  }

  ngOnInit(){
    this.titleService.setTitle('CyC - Alta Asesores');
  }

  build( pais ){
    this.getVacantes()
    this.pais.Pais= pais
    this.resetFlag = new Date()
    this.selectedVac = []
    this.selectVacIndex = {}
    this.showSave = true
  }

  ngOnDestroy(){
  }

  getVacantes(){
    this.loading['vacantes'] = true

    this._api.restfulGet( '','Headcount/hcVacantesList' )
              .subscribe( res => {

                this.loading['vacantes'] = false

                this.selectedVac = []
                this.selectVacIndex = {}

                this.vacantesList = res['data']
                this.resetVac = new Date()

              }, err => {
                console.log('ERROR', err)

                this.loading['vacantes'] = false

                let error = err.error
                this.toastr.error( error.error ? error.error.message : error.msg, error.error ? error.msg : 'Error' )
                console.error(err.statusText, error.msg)

              })
  }

  onVacSelect( val, i ){
    this.selectVacIndex[i] = val

    this.selectedVac = []

    // tslint:disable-next-line:forin
    for( let index in this.selectVacIndex ){
      this.selectedVac.push( this.selectVacIndex[index] )
    }
  }

  ucwords( st, accents = true, trim = true ) {
    let str = st.toLowerCase()
    let result = str.replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g,
      function(s){
        return s.toUpperCase()
    })

    if( trim ){
      result = result.trim()
      result = result.replace(/[\s]+/g, ' ')
    }

    if( !accents ){
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    return result
  }

  deleteReg( flag, index ){
    if( flag ){
      this.xlsData.splice(index, 1);
    }
  }

  dwlFormat(){
    jQuery('#dwlFrame').attr( 'src', 'assets/formats/altasBatch.xlsx')
  }

  populateProfiles(){
    let params = {}
    this._api.restfulGet( '', 'Lists/listProfiles' )
            .subscribe( res => {
              this.listProfiles = res['data']
            })

  }

  nextRegSubmit( dt, first = false ){
    let index = first ? dt['index'] : dt['index'] + 1
    let search = this._batch.filter( res => res.i === index )

    if( first ){
      if( search[0]['form'].invalid ){
        this.toastr.error('El formulario tiene errores. Revísalo nuevamente', 'Error')
        return false
      }
      this.saving = true
    }

    if( dt['status'] ){
      if( search.length > 0 ){
        search[0].submitInfo()
      }else{
        this.saving = false
        this.showSave = false
        this.newId = dt['newId']

      }
    }
  }

  goToNew(){
    jQuery('#addAsesor').modal('hide')
    setTimeout( () => this.goTo.emit( {asesor: this.newId} ), 1000)
  }

}
