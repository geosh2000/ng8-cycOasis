import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, QueryList, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

import { saveAs } from 'file-saver';
import { utils, write, WorkBook, readFile, read as readXlsx } from 'xlsx';
import { ToastrService } from 'ngx-toastr';

declare var jQuery:any;
import * as moment from 'moment-timezone';
import { BatchAsesorFormComponent } from './batch-asesor-form/batch-asesor-form.component';

@Component({
  selector: 'app-altas-batch',
  templateUrl: './altas-batch.component.html',
  styles: []
})
export class AltasBatchComponent implements OnInit, OnDestroy {

  @ViewChildren('batchCmp') _batch:QueryList<BatchAsesorFormComponent>

  currentUser: any
  showContents:boolean = false
  flag:boolean = false
  listFlag:boolean = false
  large:boolean = true
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

  resetFlag:any
  resetVac:any

  results:any = []
  summary:Object = {}
  timeout:any

  constructor(public _api: ApiService,
      public _init:InitService,
      private titleService: Title,
      private _tokenCheck:TokenCheckService,
      public toastr: ToastrService) {

    this.currentUser = this._init.getUserInfo()
    this.showContents = this._init.checkCredential( this.mainCredential, true )

    this._tokenCheck.getTokenStatus()
      .subscribe( res => {

      if( res['status'] ){
        this.showContents = this._init.checkCredential( this.mainCredential, true )
      }else{
        this.showContents = false
        jQuery('#loginModal').modal('show');
      }
    })

    this.imageForm = new FormGroup({
      fname:              new FormControl('', [ Validators.required,  ] ),
      dir:                new FormControl('', [ Validators.required,  ] ),
      imageFile:          new FormControl('', [ Validators.required,  ] ),
      ftype:              new FormControl('.xlsx', [ Validators.required,  ] )
    })

    this.populateProfiles()

  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Alta Asesores');
  }

  ngOnDestroy(){
    clearTimeout(this.timeout)
  }

  viewForms(){
    let items:any = []
    this.summary = {
      ingresos: 0,
      reingresos: 0,
      omited: 0,
      error: 0
    }

    this._batch.forEach(reg => {
      let item = {
        index: reg.i,
        name: `${reg.form.controls['Nombre_Separado'].value} ${reg.form.controls['Apellidos_Separado'].value}`,
        skip: (reg.form.controls['Nombre_Separado'].errors && reg.form.controls['Nombre_Separado'].errors.same) || reg.omitido ? true : false,
        valid: reg.form.valid,
        reingreso: reg.reingresoFlag,
        fields: reg.form.value
      }

      this.summary['regs']++
      if( item['skip'] ){ this.summary['omited']++ }
      if( item['reingreso'] ){ this.summary['reingresos']++ }
      if( !item['reingreso'] && !item['skip'] && item['valid'] ){ this.summary['ingresos']++ }
      if( !item['valid'] && !item['skip'] ){ this.summary['error']++ }

      items.push(item)
    });

    this.results = items
  }

  timerCheck(){
    this.timeout = setTimeout( () => {
      this.viewForms()
      this.timerCheck()
    },1500)

  }

  setImagePath(){
    this.readImg( this.image_File.nativeElement )
  }

  readImg( file ){

    if(file.files && file.files[0]){

      if( file.files[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ){
        console.error('Formato incorrecto')
        this.toastr.error('Formato de archivo incorrecto. Debe ser "xlsx"', 'Error')
        return false
      }

      console.log('Archivo cargado')
      this.imageForm.controls['fname'].setValue('batchNew')
      this.imageForm.controls['dir'].setValue('newAsesores')

      this.imageFileUp = file.files[0]

    }else{
      console.error('No existe ninguna imagen cargada')
    }
  }

  submit(){
    let Image = this.image_File.nativeElement

    if( Image.files && Image.files[0] ){
      this.imageFileUp = Image.files[0]
    }else{
      this.toastr.error('No se ha cargado ningun archivo correcto', 'ERROR')
      return true
    }

    let ImageFile: File = this.imageFileUp

    let formData: FormData = new FormData()
    formData.append( 'fname', this.imageForm.controls['fname'].value)
    formData.append( 'dir',   this.imageForm.controls['dir'].value)
    formData.append( 'ftype', this.imageForm.controls['ftype'].value)
    formData.append( 'image', ImageFile, ImageFile.name)

    this.loading['building'] = true
    this.loading['upload'] = true
    this._api.restfulImgPost( formData, 'UploadImage/uploadImage' )
            .subscribe( res => {
                this.loading['upload'] = false
                this.buildForms()

            }, err => {
                this.loading['upload'] = false
                this.loading['building'] = false
                console.log('ERROR', err)
                this.toastr.error( err, 'Error' )
              })

  }

  buildForms(){
    clearTimeout(this.timeout)
    let url = `img/${this.imageForm.controls['dir'].value}`
    let file = `${this.imageForm.controls['fname'].value + this.imageForm.controls['ftype'].value}`
    let test = false
    // let url = 'assets'
    // let file = 'test.xlsx'
    // let test = true

    this._api.getFile( file, url, test )
        .subscribe( f => {
          let data = new Uint8Array(f);
          let workbook = readXlsx(data, {type:'array'});
          let sheetName = workbook.SheetNames[0]
          this.xlsData = utils.sheet_to_json( workbook.Sheets[sheetName] )
          this.resetFlag = new Date()
          this.resetVac = new Date()
          this.getVacantes()
          this.timerCheck()
          this.loading['building'] = false

          console.log(this.xlsData)
          }, er => {
            this.loading['building'] = false
            console.log('ERROR', er)
            this.toastr.error( er, 'Error' )
        })
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
    if( first ){
      this.saving = true
    }
    if( dt['status'] ){
      let index = first ? dt['index'] : dt['index'] + 1
      let search = this._batch.filter( res => res.i === index )
      if( search.length > 0 ){
        console.log(first, index, search)
        search[0].submitInfo()
      }else{
        console.log(first, index, 'fin')
        this.saving = false
      }
    }
  }

}
