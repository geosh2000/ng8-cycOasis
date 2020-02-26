import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

declare var jQuery:any;

import { ApiService } from '../../../services/service.index';

@Component({
  selector: 'app-csv',
  templateUrl: './csv.component.html',
  styles: []
})
export class CsvComponent implements OnInit {

  @Output() loadResult = new EventEmitter<any>()

  @Input() title:any
  @Input() name:any
  @Input() dir:any
  @Input() btnClass:any = 'btn-success'

  loading:Object = {}

  invalidForm:boolean = true

  previewSrc:boolean = false

  imageForm: FormGroup
  imageFileUp: File
  @ViewChild('imageFile',{static:false}) image_File

  constructor(
                private fb:FormBuilder,
                private _api:ApiService) {

    this.imageForm = new FormGroup({
      fname:              new FormControl('', [ Validators.required,  ] ),
      dir:                new FormControl('', [ Validators.required,  ] ),
      imageFile:          new FormControl('', [ Validators.required,  ] ),
      ftype:              new FormControl('.csv', [ Validators.required,  ] )
    })
  }

  ngOnInit() {
  }

  build( ){
    jQuery("#formUploadImageComponent"+this.name).modal('show')
    jQuery("#formUploadImage"+this.name).val('')
    jQuery("#formUploadImagePreview"+this.name).attr('src','')
    this.imageForm.controls['fname'].setValue(this.name)
    this.imageForm.controls['dir'].setValue(this.dir)
  }

  submit(){
    this.loading['submit'] = true
    let Image = this.image_File.nativeElement

    if( Image.files && Image.files[0] ){
      this.imageFileUp = Image.files[0]
    }

    let ImageFile: File = this.imageFileUp

    let formData: FormData = new FormData()
    formData.append( 'fname', this.imageForm.controls['fname'].value)
    formData.append( 'dir',   this.imageForm.controls['dir'].value)
    formData.append( 'ftype', this.imageForm.controls['ftype'].value)
    formData.append( 'image', ImageFile, ImageFile.name)

    this._api.restfulImgPost( formData, 'UploadImage/uploadImage' )
              .subscribe( res => {

                  jQuery("#formUploadImageComponent"+this.name).modal('hide')
                  this.loading['submit'] = false
                  this.loadResult.emit( {status: true, name: this.name, fname: ImageFile.name} )
              }, err => {
                  this.loading['submit'] = false
                  console.log("ERROR", err)
                  this.loadResult.emit( {status: false, name: this.name, msg: err} )
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
      console.log("Imagen cargada")

      let reader = new FileReader();
      reader.onload = (e) => {
        jQuery("#formUploadImagePreview"+this.name).attr('src', e.target['result'])
      }
      this.previewSrc = true
      reader.readAsDataURL(file.files[0])
    }else{
      this.previewSrc = false
      console.error("No existe ninguna imagen cargada")
    }
  }

  imageExists( dir, fname, ext ){
    this._api.restfulGet( `${ dir }/${ fname }/jpg`, 'UploadImage/fileExists')
            .subscribe( res => {
              return res
            })
  }

  deleteFile( dir, fname, ext ){
    this._api.restfulDelete( `${ dir }/${ fname }/jpg`, 'UploadImage/imageDel')
            .subscribe( res => {
              return res
            })
  }

}
