import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import { ToastrService } from 'ngx-toastr';
import { ApiService, InitService } from 'src/app/services/service.index';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-rsv-payment-registry',
  templateUrl: './rsv-payment-registry.component.html',
  styles: [`.mat-radio-button ~ .mat-radio-button {
    margin-left: 16px;
  }`]
})
export class RsvPaymentRegistryComponent implements OnInit, OnChanges {

  @ViewChild('stepper', {static: false}) private _stp: MatStepper;

  // tslint:disable-next-line: no-output-native
  @Output() close = new EventEmitter<any>()
  @Input() num:any
  @Input() isModal:boolean = true
  @Input() name:any
  @Input() dir:any
  @Output() loadResult = new EventEmitter<any>()
  @Input() modalMode:boolean = true

  type = 'img'

  title:string
  invalidForm = true

  previewSrc = false

  imageForm: FormGroup
  imageFileUp: File
  @ViewChild('imageFile',{static:false}) image_File: any


  item:Object = {}
  master:any = []

  newPayment:FormGroup

  params:Object = {
    complejo: null,
    proveedor: null,
    referencia: null,
    operacion: null,
    aut: null,
    monto: null,
    moneda: null
  }

  errors:Object = {}

  loading:Object = {}

  constructor( public _api: ApiService,
               public _init: InitService,
               public toastr: ToastrService,
               private fb:FormBuilder ) { 

    this.newPayment =  new FormGroup({
      ['complejo']:    new FormControl('', [ Validators.required ]),
      ['proveedor']:   new FormControl('', [ Validators.required ]),
      ['referencia']:  new FormControl('', [ Validators.required ]),
      ['operacion']:   new FormControl('', [ Validators.required ]),
      ['aut']:         new FormControl('', [ Validators.required ]),
      ['monto']:       new FormControl('', [ Validators.required ]),
      ['moneda']:      new FormControl('', [ Validators.required ]),
      ['tipo']:        new FormControl('', [ Validators.required ]),
      ['afiliacion']:  new FormControl('', [ Validators.required ]),
      ['tarjeta']:     new FormControl('Virtual', [ Validators.required ]),
      ['tipoTarjeta']: new FormControl('VIRTUAL', [ Validators.required ]),
      ['paymentNotes']: new FormControl('_')
    })

    this.imageForm = new FormGroup({
      fname:              new FormControl('', [ Validators.required,  ] ),
      dir:                new FormControl('', [ Validators.required,  ] ),
      imageFile:          new FormControl('', [ Validators.required,  ] )
    })
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.num && this.name && this.dir){
      this.build( this.title, this.dir, this.num )
    }
  }

  closeModal( reload = false ){
    this.close.emit( reload )
    jQuery('#rsvRegPayment').modal('hide')
    this.newPayment.reset()
    this.newPayment.controls['tarjeta'].setValue('Virtual')
    this.newPayment.controls['tipoTarjeta'].setValue('VIRTUAL')
    this.newPayment.controls['paymentNotes'].setValue('_')
    this._stp.reset();
  }

  openModal(){
    this.newPayment.reset()
    this.newPayment.controls['tarjeta'].setValue('Virtual')
    this.newPayment.controls['tipoTarjeta'].setValue('VIRTUAL')
    this.newPayment.controls['paymentNotes'].setValue('_')

    jQuery('#rsvRegPayment').modal('show')
  }

  chg(p, e){

    switch(p){
      case 'complejo':
        this.newPayment.controls['afiliacion'].setValue(`${this.newPayment.controls['proveedor'].value == 'Paypal' ? 'PP' : this.newPayment.controls['proveedor'].value == 'Tpv' ? 'TPV' : 'DP'}_${e.value}`)
        break
      case 'proveedor':
        this.newPayment.controls['tipo'].setValue(e.value)
        break
    }


  }

  savePayment(){
    this.sendPayment()
  }


  sendPayment(){

    this.loading['save'] = true;

    this._api.restfulPut( this.newPayment.value, 'Rsv/regPayment' )
                .subscribe( res => {

                  this.loading['save'] = false;

                  if( res['data'] ){
                    this.toastr.success( res['msg'], 'Guardado' )
                    this.closeModal( true )
                  }


                }, err => {
                  this.loading['save'] = false;

                  const error = err.error;
                  this.deleteFile( `payments/${this.imageForm.controls['dir'].value}`, this.imageForm.controls['fname'].value, 'pdf' )
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });
  }

  build( title, dir, name ){
    this.title = title
    this.imageForm.controls['fname'].setValue(name)
    this.imageForm.controls['dir'].setValue(dir)
    jQuery('#formUploadImage').val('')
    jQuery('#formUploadImagePreview').attr('src','')
    this.previewSrc = false
  }

  submit(){
    this.loading['save'] = true
    let Image = this.image_File.nativeElement

    if( Image.files && Image.files[0] ){
      this.imageFileUp = Image.files[0]
    }

    let ImageFile: File = this.imageFileUp

    let formData: FormData = new FormData()
    formData.append( 'fname', this.imageForm.controls['fname'].value)
    formData.append( 'dir',   this.imageForm.controls['dir'].value)
    formData.append( 'image', ImageFile, ImageFile.name)

    let url = 'payments'

    this._api.restfulImgPost( formData, 'UploadImage/payment' )
            .subscribe( res => {
              this.loading['save'] = false
              if( !res['ERR'] ){
                this.sendPayment()
              }else{
                this.deleteFile( `${url}/${this.imageForm.controls['dir'].value}`, this.imageForm.controls['fname'].value, 'pdf' )
              }

            })

  }

  setImagePath( event ){
    if( event.target.value != null ){
      this.invalidForm = false
    }

    this.readImg( this.image_File.nativeElement )
  }

  readImg( file ){

    if(file.files && file.files[0]){
    
      if(file.files[0]['type'] == 'application/pdf'){
        console.log('Imagen cargada', file.files[0])

        let reader = new FileReader();
        reader.onload = (e) => {
          jQuery('#formUploadImagePreview').attr('src', e.target['result'])
        }
        this.previewSrc = true
        reader.readAsDataURL(file.files[0])
      }else{
        this.previewSrc = false
        console.error('El archivo no es PDF')
        this.toastr.error('El archivo cargado no es PDF', 'ERROR')
      }
    }else{
      this.previewSrc = false
      console.error('No existe ninguna imagen cargada')
    }
  }

  imageExists( dir, fname, ext = 'jpg' ){
    this._api.restfulGet( `${ dir }/${ fname }/${ext}`, 'UploadImage/fileExists')
            .subscribe( res => {
              return res
            })
  }

  deleteFile( dir, fname, ext = 'jpg' ){
    this._api.restfulDelete( `${ dir }/${ fname }/${ext}`, 'UploadImage/imageDel')
            .subscribe( res => {
              return res
            })
  }

  opValidation(){

    this.loading['validateOp'] = true

    this._api.restfulPut( { operacion: this.newPayment.controls['operacion'].value}, 'Lists/opExists' )
                .subscribe( res => {

                  let data = res['data']

                  if( parseInt(data) == 0 ){
                    this.loading['validateOp'] = false;
                    this.build('Voucher '+ this.newPayment.controls['operacion'].value, this.newPayment.controls['operacion'].value, 'voucher_'+this.newPayment.controls['operacion'].value)
                  }else{
                    this.toastr.error('La operación ingresada ya existe con otro registro. Valida si la tu registro fue hecho con anterioridad o corrige el número de operación', 'Operación duplicada')
                    this._stp.previous();
                    this.loading['validateOp'] = false;
                  }

                }, err => {
                  this.loading['validateOp'] = false;

                  const error = err.error;
                  this.toastr.error( error.msg, err.status );
                  console.error(err.statusText, error.msg);

                });

  }


}
