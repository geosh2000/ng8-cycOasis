import { Component, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Input, SimpleChanges, HostListener, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CompleterService, CompleterData } from 'ng2-completer';
import { Title } from '@angular/platform-browser';

import { Router, ActivatedRoute } from '@angular/router';

import { ApiService, InitService, TokenCheckService } from '../../../services/service.index';

declare var jQuery: any;
import * as moment from 'moment-timezone';
import * as Globals from '../../../globals';
// import { AddNewAgentComponent } from '../../formularios/add-new-agent/add-new-agent.component';

@Component({
  selector: 'app-detalle-asesores',
  templateUrl: './detalle-asesores.component.html',
  styles: []
})
export class DetalleAsesoresComponent implements OnInit {

  // @ViewChild(AddNewAgentComponent) addNew:AddNewAgentComponent

  currentUser: any;
  showContents = false;
  flag = false;
  listFlag = false;
  large = true;
  mainCredential = 'hc_detalle_asesores';

  evalModal: Object = {};

  now: any = moment();

  loading: Object = {};
  selected: Object = {};

  creds: Object = {
    det_detail      : false,
    det_historic    : false,
    det_contratacion: false,
    det_asistencia  : false,
    det_contrato    : false,
    det_sueldo      : false,
    det_cxc         : false,
    det_sanciones   : false
  };

  constructor(public _api: ApiService,
                public _init: InitService,
                private titleService: Title,
                private _tokenCheck: TokenCheckService,
                private route: Router,
                private activatedRoute: ActivatedRoute,
                public toastr: ToastrService) {

    this.currentUser = this._init.getUserInfo();
    this.showContents = this._init.checkCredential( this.mainCredential, true );

    this._tokenCheck.getTokenStatus()
        .subscribe( res => {

          if ( res['status'] ){
            this.showContents = this._init.checkCredential( this.mainCredential, true );
          }else{
            this.showContents = false;
            jQuery('#loginModal').modal('show');
          }
        });

    this.activatedRoute.params.subscribe( params => {
      if ( params.id ){
        this.selected['id']     = params.id;

      }
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CyC - Detalle Asesores');
  }

  onSelected(item){
      if (item){
        this.route.navigateByUrl(`/detalle-asesores/${item.asesor}/1`);
      }
  }

  reload(){
    this.sendNow();
  }

  sendNow(){
    this.now = moment();
  }

  addNewAgent( pais ){
   jQuery('#addAsesor').modal('show');
  //  this.addNew.build( pais );
  }

  saved( data ){
    if ( data.status ){
      this.toastr.success( data.msg, data.title );
    }else{
      this.toastr.error( data.msg, data.title );
    }
  }

  showEval( info ){
    this.evalModal = info;
    jQuery('#desempeno').modal('show');
    jQuery('#desempeno').addClass('modal-open-important');
  }

}
