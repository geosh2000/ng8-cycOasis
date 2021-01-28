import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { environment } from '../environments/environment';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.wsUrl, options: {} };

// Services
import { NavbarService, AsesoresService, LoginService, CredentialsService, TokenCheckService, ApiService, InitService, GlobalServicesService, RrobinService } from './services/service.index';


// Components
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { HomeComponent } from './components/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgDragDropModule } from 'ng-drag-drop';
import { TableModule } from 'ngx-easy-table';

import { UiSwitchModule } from 'ngx-ui-switch';
import { OrderModule } from 'ngx-order-pipe';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { RouterModule } from '@angular/router';
import { Ng2CompleterModule } from 'ng2-completer';
import { CommonModule } from '@angular/common';

// Pipes
import { KeysPipe } from './pipes/keys.pipe';
import { CapitalizadoPipe } from './pipes/capitalizado.pipe';
import { DomseguroPipe } from './pipes/domseguro.pipe';
import { NoAcentosPipe } from './pipes/no-acentos.pipe';

// Components
import { AsistenciaBadgeComponent } from './shared/buttons/asistencia-badge/asistencia-badge.component';
import { BonoApproveComponent } from './shared/buttons/bono-approve/bono-approve.component';
import { ExtraSwitchComponent } from './shared/buttons/extra-switch/extra-switch.component';
import { PuntualidadBadgeComponent } from './shared/buttons/puntualidad-badge/puntualidad-badge.component';
import { SaBadgeComponent } from './shared/buttons/sa-badge/sa-badge.component';
import { LoginComponent } from './shared/login/login.component';
import { LogoutComponent } from './shared/logout/logout.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { PbxStatusComponent } from './shared/pbx-status/pbx-status.component';
import { SearchAsesorComponent } from './shared/search-asesor/search-asesor.component';
import { TableTemplateComponent } from './shared/table-template/table-template.component';
import { CsvComponent } from './shared/upload/csv/csv.component';
import { CumplimientoComponent } from './shared/progress/cumplimiento/cumplimiento.component';
import { AsesorFilterComponent } from './shared/filters/asesor-filter/asesor-filter.component';
import { UserPreferencesComponent } from './shared/user-preferences/user-preferences.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { PdvBadgeComponent } from './shared/buttons/pdv-badge/pdv-badge.component';
import { DetalleAsesoresComponent } from './components/hc/detalle-asesores/detalle-asesores.component';
import { DetVacacionesComponent } from './components/hc/detalle-asesores/det-vacaciones/det-vacaciones.component';
import { DetDiasPendientesComponent } from './components/hc/detalle-asesores/det-dias-pendientes/det-dias-pendientes.component';
import { DetDetalleComponent } from './components/hc/detalle-asesores/det-detalle/det-detalle.component';
import { DetContratoComponent } from './components/hc/detalle-asesores/det-contrato/det-contrato.component';
import { DetSalarioComponent } from './components/hc/detalle-asesores/det-salario/det-salario.component';
import { DetHistorialComponent } from './components/hc/detalle-asesores/det-historial/det-historial.component';
import { DetHorarioComponent } from './components/hc/detalle-asesores/det-horario/det-horario.component';
import { UploadImageComponent } from './components/formularios/upload-image.component';
import { AddAusentismoComponent } from './components/formularios/add-ausentismo.component';
import { PyaExceptionComponent } from './components/formularios/pya-exception.component';
import { EditDetailsComponent } from './components/formularios/edit-details.component';
import { SetBajaComponent } from './components/formularios/set-baja.component';
import { AddContratoComponent } from './components/formularios/add-contrato.component';
import { ReingresoAsesorComponent } from './components/formularios/reingreso-asesor.component';
import { CambioPuestoComponent } from './components/formularios/cambio-puesto.component';
import { JornadasComponent } from './components/asistencia/jornadas.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PopoverModule } from 'ngx-popover';
import { AddNewAgentComponent } from './components/formularios/add-new-agent/add-new-agent.component';
import { AltasBatchComponent } from './components/hc/altas-batch/altas-batch.component';
import { BatchAsesorFormComponent } from './components/hc/altas-batch/batch-asesor-form/batch-asesor-form.component';
import { CargaHorariosComponent } from './components/asistencia/carga-horarios/carga-horarios.component';
import { ContextMenuModule } from 'ngx-contextmenu';
import { Select2Module } from 'ng2-select2';
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { SearchHotelModuleComponent } from './components/cotizador/search-hotel-module/search-hotel-module.component';
import { FillPipe } from './pipes/fill.pipe';
import { HorariosSemanaComponent } from './components/home/horarios-semana/horarios-semana.component';
import { PersonalDataComponent } from './components/home/personal-data.component';
import { CotizadorV2Component } from './components/cotizador/cotizador-v2.component';
import { CreateRsvComponent } from './components/cotizador/create-rsv/create-rsv.component';
import { SearchZdUserComponent } from './shared/search-zd-user/search-zd-user.component';
import { CcSuperAssignComponent } from './components/config/cc-super-assign/cc-super-assign.component';
import { CotHabDetailComponent } from './components/cotizador/cot-hab-detail/cot-hab-detail.component';
import { SearchLocComponent } from './shared/search-loc/search-loc.component';
import { RsvManageComponent } from './components/rsv/rsv-manage/rsv-manage.component';
import { RsvAddPaymentComponent } from './components/rsv/rsv-add-payment/rsv-add-payment.component';
import { AddExternalUserComponent } from './components/config/add-external-user/add-external-user.component';
import { PrintVoucherComponent } from './components/pagos/print-voucher/print-voucher.component';
import { RsvPaymentAdminComponent } from './components/rsv/rsv-payment-admin/rsv-payment-admin.component';
import { RsvLinkPaymentComponent } from './components/rsv/rsv-link-payment/rsv-link-payment.component';
import { RsvListComponent } from './components/rsv/rsv-list/rsv-list.component';
import { RsvPaymentListComponent } from './components/rsv/rsv-payment-list/rsv-payment-list.component';
import { RsvPaymentRegistryComponent } from './components/rsv/rsv-payment-registry/rsv-payment-registry.component';
import { RsvLinkAnyPaymentComponent } from './components/rsv/rsv-link-any-payment/rsv-link-any-payment.component';
import { SearchPaymentComponent } from './shared/search-payment/search-payment.component';
import { CieloListComponent } from './components/cielo/cielo-list/cielo-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DasboardVentaAlDiaComponent } from './components/dashboard/dasboard-venta-al-dia/dasboard-venta-al-dia.component';
import { DasboardVentaFcComponent } from './components/dashboard/dasboard-venta-fc/dasboard-venta-fc.component';
import { DasboardVentaShareComponent } from './components/dashboard/dasboard-venta-share/dasboard-venta-share.component';
import { DasboardVentaPerMonthComponent } from './components/dashboard/dasboard-venta-per-month/dasboard-venta-per-month.component';
import { DasboardVentaPrepagoPorDiaComponent } from './components/dashboard/dasboard-venta-prepago-por-dia/dasboard-venta-prepago-por-dia.component';
import { DasboardVentaPrepagoPorAsesorComponent } from './components/dashboard/dasboard-venta-prepago-por-asesor/dasboard-venta-prepago-por-asesor.component';
import { XlsDownloadComponent } from './shared/xls-download/xls-download.component';
import { DasboardComisionesComponent } from './components/dashboard/dasboard-comisiones/dasboard-comisiones.component';
import { RsvDayPassListComponent } from './components/rsv/rsv-day-pass-list/rsv-day-pass-list.component';
import { RrobinComponent } from './shared/rrobin/rrobin.component';
import { ChatMonitorComponent } from './components/chat/chat-monitor.component';
import { TelefoniaComponent } from './components/monitores/telefonia/telefonia.component';
import { TelAgentComponent } from './components/monitores/telefonia/tel-agent/tel-agent.component';
import { CallStatisticsComponent } from './components/monitores/calls/call-statistics.component';
import { GraphCallStatsComponent } from './components/monitores/calls/statistics/graph-call-stats/graph-call-stats.component';
import { TestComponent } from './components/test/test.component';
import { HotelSearchComponent } from './components/cotizador/search-hotel-module/hotel-search.component';
import { HotelResultsComponent } from './components/cotizador/search-hotel-module/hotel-results.component';
import { MainCotizadorComponent } from './components/cotizador/main-cotizador.component';
import { CotizaDayPassComponent } from './components/cotizador/cotiza-day-pass/cotiza-day-pass.component';
import { SearchBarCotizadorComponent } from './components/cotizador/search-bar-cotizador/search-bar-cotizador.component';
import { CotCreateRsvComponent } from './components/cotizador/cot-create-rsv/cot-create-rsv.component';
import { RsvDetailComponent } from './components/cotizador/rsv-detail/rsv-detail.component';
import { Rsv2ManageComponent } from './components/rsv2/rsv2-manage/rsv2-manage.component';
import { CotizaXferComponent } from './components/cotizador/cotiza-xfer/cotiza-xfer.component';
import { PagosAdminComponent } from './components/pagos/pagos-admin/pagos-admin.component';
import { DoPaymentComponent } from './components/rsv2/do-payment/do-payment.component';
import { EditMontoParcialComponent } from './components/rsv2/rsv2-manage/edit-monto-parcial/edit-monto-parcial.component';
import { ExtranetComponent } from './components/extranet/extranet.component';
import { ExtPapeletaComponent } from './components/extranet/ext-papeleta.component';
import { CotizaTourComponent } from './components/cotizador/cotiza-tour/cotiza-tour.component';
import { ExtranetListComponent } from './components/extranet/extranet-list/extranet-list.component';
import { CotizaAutoComponent } from './components/cotizador/cotiza-auto/cotiza-auto.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CotizaXtrasComponent } from './components/cotizador/cotiza-xtras/cotiza-xtras.component';
import { CotizaConcertComponent } from './components/cotizador/cotiza-concert/cotiza-concert.component';
import { RsvLinkPaymentDirectComponent } from './components/rsv/rsv-link-payment-direct/rsv-link-payment-direct.component';
import { EditPrepayComponent } from './components/rsv2/edit-prepay/edit-prepay.component';
import { WhatsappComponent } from './components/whatsapp/whatsapp.component';
import { ChatWindowComponent } from './components/whatsapp/chat-window/chat-window.component';
import { ConversationsComponent } from './components/whatsapp/conversations/conversations.component';
import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { GoToLocComponent } from './shared/go-to-loc/go-to-loc.component';
import { UploadFilesComponent } from './config/upload-files/upload-files.component';
import { CidProdComponent } from './config/upload-files/cid-prod/cid-prod.component';
import { CieloLlegadasComponent } from './config/upload-files/cielo-llegadas/cielo-llegadas.component';
import { RsvOpenDatesComponent } from './components/rsv2/rsv-open-dates/rsv-open-dates.component';
import { RsvOpenDatesSetComponent } from './components/rsv2/rsv-open-dates-set/rsv-open-dates-set.component';
import { RsvUpdateContactComponent } from './components/rsv2/rsv-update-contact/rsv-update-contact.component';
import { PaymentLinkGenComponent } from './components/rsv2/payment-link-gen/payment-link-gen.component';
import { DataStudioComponent } from './components/data-studio/data-studio.component';
import { ClueComponent } from './components/games/clue/clue.component';
import { WhatsappTemplatesComponent } from './config/whatsapp-templates/whatsapp-templates.component';
import { RsvCancelItemComponent } from './components/rsv2/rsv-cancel-item/rsv-cancel-item.component';
import { DashboardV2Component } from './components/dashboard-v2/dashboard-v2.component';
import { DashVentaComponent } from './components/dashboard-v2/dash-venta/dash-venta.component';
import { DashTicketsComponent } from './components/dashboard-v2/dash-tickets/dash-tickets.component';
import { ChartComponent } from './components/dashboard-v2/chart/chart.component';
import { DashAgentsComponent } from './components/dashboard-v2/dash-agents/dash-agents.component';
import { ConexionesWhatsComponent } from './components/monitores/conexiones-whats/conexiones-whats.component';
import { SearchCertComponent } from './components/rsv2/search-cert/search-cert.component';
import { ValidateCertificateComponent } from './components/rsv2/validate-certificate/validate-certificate.component';
import { RsvChangesComponent } from './components/rsv2/rsv-changes/rsv-changes.component';
import { RobinQueuesComponent } from './config/robin-queues/robin-queues.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,

    // Pipes
    KeysPipe,
    CapitalizadoPipe,
    DomseguroPipe,
    NoAcentosPipe,

    // Components
    AsistenciaBadgeComponent,
    BonoApproveComponent,
    ExtraSwitchComponent,
    PuntualidadBadgeComponent,
    SaBadgeComponent,
    AsesorFilterComponent,
    LoginComponent,
    LogoutComponent,
    NavbarComponent,
    PbxStatusComponent,
    CumplimientoComponent,
    SearchAsesorComponent,
    TableTemplateComponent,
    CsvComponent,
    UserPreferencesComponent,
    SidebarComponent,
    PdvBadgeComponent,
    DetalleAsesoresComponent,
    DetVacacionesComponent,
    DetDiasPendientesComponent,
    DetDetalleComponent,
    DetContratoComponent,
    DetSalarioComponent,
    DetHistorialComponent,
    DetHorarioComponent,
    UploadImageComponent,
    AddAusentismoComponent,
    PyaExceptionComponent,
    EditDetailsComponent,
    SetBajaComponent,
    AddContratoComponent,
    ReingresoAsesorComponent,
    CambioPuestoComponent,
    JornadasComponent,
    AddNewAgentComponent,
    AltasBatchComponent,
    BatchAsesorFormComponent,
    CargaHorariosComponent,
    AsistenciaComponent,
    CotizadorComponent,
    SearchHotelModuleComponent,
    FillPipe,
    HorariosSemanaComponent,
    PersonalDataComponent,
    CotizadorV2Component,
    CreateRsvComponent,
    SearchZdUserComponent,
    CcSuperAssignComponent,
    CotHabDetailComponent,
    SearchLocComponent,
    RsvManageComponent,
    RsvAddPaymentComponent,
    AddExternalUserComponent,
    PrintVoucherComponent,
    RsvPaymentAdminComponent,
    RsvLinkPaymentComponent,
    RsvListComponent,
    RsvPaymentListComponent,
    RsvPaymentRegistryComponent,
    RsvLinkAnyPaymentComponent,
    SearchPaymentComponent,
    CieloListComponent,
    DashboardComponent,
    DasboardVentaAlDiaComponent,
    DasboardVentaFcComponent,
    DasboardVentaShareComponent,
    DasboardVentaPerMonthComponent,
    DasboardVentaPrepagoPorDiaComponent,
    DasboardVentaPrepagoPorAsesorComponent,
    XlsDownloadComponent,
    DasboardComisionesComponent,
    RsvDayPassListComponent,
    RrobinComponent,
    ChatMonitorComponent,
    TelefoniaComponent,
    TelAgentComponent,
    CallStatisticsComponent,
    GraphCallStatsComponent,
    TestComponent,
    HotelSearchComponent,
    HotelResultsComponent,
    MainCotizadorComponent,
    CotizaDayPassComponent,
    SearchBarCotizadorComponent,
    CotCreateRsvComponent,
    RsvDetailComponent,
    Rsv2ManageComponent,
    CotizaXferComponent,
    PagosAdminComponent,
    DoPaymentComponent,
    EditMontoParcialComponent,
    ExtranetComponent,
    ExtPapeletaComponent,
    CotizaTourComponent,
    ExtranetListComponent,
    CotizaAutoComponent,
    CotizaXtrasComponent,
    CotizaConcertComponent,
    RsvLinkPaymentDirectComponent,
    EditPrepayComponent,
    WhatsappComponent,
    ChatWindowComponent,
    ConversationsComponent,
    GoToLocComponent,
    UploadFilesComponent,
    CidProdComponent,
    CieloLlegadasComponent,
    RsvOpenDatesComponent,
    RsvOpenDatesSetComponent,
    RsvUpdateContactComponent,
    PaymentLinkGenComponent,
    DataStudioComponent,
    ClueComponent,
    WhatsappTemplatesComponent,
    RsvCancelItemComponent,
    DashboardV2Component,
    DashVentaComponent,
    DashTicketsComponent,
    ChartComponent,
    DashAgentsComponent,
    ConexionesWhatsComponent,
    SearchCertComponent,
    ValidateCertificateComponent,
    RsvChangesComponent,
    RobinQueuesComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    CommonModule,
    NgDragDropModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    Ng2CompleterModule,
    FormsModule,
    ReactiveFormsModule,
    UiSwitchModule.forRoot({
      size: 'small',
    }),
    NgbModule,
    ToastrModule.forRoot(),

    OrderModule,
    MultiselectDropdownModule,
    Daterangepicker,
    PopoverModule,
    ContextMenuModule.forRoot({
      useBootstrap4: true,
      autoFocus: true
    }),
    Select2Module,
    TableModule,

    MatButtonModule, MatCheckboxModule,

    // ==================================================
    // START ANGULAR MATERIAL
    // ==================================================
    CdkTableModule,
    CdkTreeModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    // ==================================================
    // END ANGULAR MATERIAL
    // ==================================================
    NgxMaterialTimepickerModule.setLocale('es-MX'),
    NgxAudioPlayerModule,
    SocketIoModule.forRoot(config),
  ],
  providers: [
    NavbarService,
    AsesoresService,
    LoginService,
    CredentialsService,
    TokenCheckService,
    ApiService,
    InitService,
    GlobalServicesService,
    RrobinService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
