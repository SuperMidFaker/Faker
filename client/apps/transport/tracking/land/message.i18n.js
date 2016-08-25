import { defineMessages } from 'react-intl';

export default defineMessages({
  shipNo: {
    id: 'transport.tracking.shipmt.no',
    defaultMessage: '运单号',
  },
  refCustomerNo: {
    id: 'transport.tracking.ref.customer.no',
    defaultMessage: '客户单号',
  },
  searchShipmtPH: {
    id: 'transport.tracking.shipmt.search.placeholder',
    defaultMessage: '搜索运单号',
  },
  shipmtStatus: {
    id: 'transport.tracking.shipmt.status',
    defaultMessage: '当前状态',
  },
  shipmtPrevTrack: {
    id: 'transport.tracking.shipmt.prev.track',
    defaultMessage: '上一节点时间',
  },
  podTime: {
    id: 'transport.tracking.shipmt.pod.time',
    defaultMessage: '回单时间',
  },
  podStatus: {
    id: 'transport.tracking.shipmt.pod.status',
    defaultMessage: '回单状态',
  },
  shipmtNextUpdate: {
    id: 'transport.tracking.shipmt.next.update',
    defaultMessage: '操作',
  },
  carrierUpdate: {
    id: 'transport.tracking.carrier.update',
    defaultMessage: '由承运商更新',
  },
  driverUpdate: {
    id: 'transport.tracking.driver.update',
    defaultMessage: '由司机更新',
  },
  notifyAccept: {
    id: 'transport.tracking.notify.accept',
    defaultMessage: '催促接单',
  },
  notifyDispatch: {
    id: 'transport.tracking.notify.dispatch',
    defaultMessage: '催促调度',
  },
  notifyPOD: {
    id: 'transport.tracking.notify.pod',
    defaultMessage: '催促回单',
  },
  updateEvents: {
    id: 'transport.tracking.update.events',
    defaultMessage: '记录异常',
  },
  updateVehicleDriver: {
    id: 'transport.tracking.update.drivervehicle',
    defaultMessage: '上报车辆信息',
  },
  updatePickup: {
    id: 'transport.tracking.update.pickup',
    defaultMessage: '更新提货',
  },
  updateDelivery: {
    id: 'transport.tracking.update.delivery',
    defaultMessage: '更新交货',
  },
  reportTransitLoc: {
    id: 'transport.tracking.report.transit.loc',
    defaultMessage: '上报位置',
  },
  reportTime: {
    id: 'transport.tracking.report.transit.time',
    defaultMessage: '上报时间',
  },
  reportTimeMust: {
    id: 'transport.tracking.report.transit.time.must',
    defaultMessage: '上报时间必填',
  },
  reportPosition: {
    id: 'transport.tracking.report.transit.position',
    defaultMessage: '位置',
  },
  reportLocAddr: {
    id: 'transport.tracking.report.transit.addr',
    defaultMessage: '详细地址',
  },
  noReportTooltipTitle: {
    id: 'transport.tracking.report.tooltip.title.none',
    defaultMessage: '暂未更新',
  },
  reportTooltipTitle: {
    id: 'transport.tracking.report.tooltip.title',
    defaultMessage: '上次更新时间:{lastTime}',
  },
  submitPod: {
    id: 'transport.tracking.submit.pod',
    defaultMessage: '提交回单',
  },
  shipmtException: {
    id: 'transport.tracking.shipmt.exception',
    defaultMessage: '异常',
  },
  exceptionLevel: {
    id: 'transport.tracking.shipmt.exception.exceptionLevel',
    defaultMessage: '异常等级',
  },
  exceptionResolved: {
    id: 'transport.tracking.shipmt.exception.exceptionResolved',
    defaultMessage: '异常状态',
  },
  exceptionType: {
    id: 'transport.tracking.shipmt.exception.exceptionType',
    defaultMessage: '类型与描述',
  },
  submitter: {
    id: 'transport.tracking.shipmt.exception.submitter',
    defaultMessage: '提交人',
  },
  submitDate: {
    id: 'transport.tracking.shipmt.exception.submitDate',
    defaultMessage: '时间',
  },
  operation: {
    id: 'transport.tracking.shipmt.exception.operation',
    defaultMessage: '操作',
  },
  shipmtCarrier: {
    id: 'transport.tracking.shipmt.carrier',
    defaultMessage: '承运商',
  },
  shipmtVehicle: {
    id: 'transport.tracking.shipmt.vehicle',
    defaultMessage: '车辆/司机',
  },
  packageNum: {
    id: 'transport.tracking.shipment.packageNum',
    defaultMessage: '件数',
  },
  shipWeight: {
    id: 'transport.tracking.shipment.weight',
    defaultMessage: '重量',
  },
  shipVolume: {
    id: 'transport.tracking.shipment.volume',
    defaultMessage: '体积',
  },
  shipmtCustomer: {
    id: 'transport.tracking.shipmt.customer',
    defaultMessage: '托运客户',
  },
  departurePlace: {
    id: 'transport.tracking.departure.place',
    defaultMessage: '出发地',
  },
  arrivalPlace: {
    id: 'transport.tracking.arrival.place',
    defaultMessage: '到达地',
  },
  shipmtMode: {
    id: 'transport.tracking.shipment.mode',
    defaultMessage: '运输模式',
  },
  shipmtEstPickupDate: {
    id: 'transport.tracking.est.pickup.date',
    defaultMessage: '预计提货',
  },
  shipmtActPickupDate: {
    id: 'transport.tracking.act.pickup.date',
    defaultMessage: '实际提货',
  },
  shipmtEstDeliveryDate: {
    id: 'transport.tracking.est.delivery.date',
    defaultMessage: '预计到达',
  },
  shipmtActDeliveryDate: {
    id: 'transport.tracking.act.delivery.date',
    defaultMessage: '实际到达',
  },
  searchPlaceholder: {
    id: 'transport.tracking.search.placeholder',
    defaultMessage: '搜索运单号',
  },
  allShipmt: {
    id: 'transport.tracking.all.shipment',
    defaultMessage: '所有',
  },
  pendingShipmt: {
    id: 'transport.tracking.pending.shipment',
    defaultMessage: '待接单',
  },
  acceptedShipmt: {
    id: 'transport.tracking.accepted.shipment',
    defaultMessage: '待调度',
  },
  dispatchedShipmt: {
    id: 'transport.tracking.dispatched.shipment',
    defaultMessage: '待提货',
  },
  intransitShipmt: {
    id: 'transport.tracking.intransit.shipment',
    defaultMessage: '运输中',
  },
  deliveredShipmt: {
    id: 'transport.tracking.delivered.shipment',
    defaultMessage: '已交货',
  },
  proofOfDelivery: {
    id: 'transport.tracking.proof.delivery',
    defaultMessage: '回单',
  },
  uploadPOD: {
    id: 'transport.tracking.pod.upload',
    defaultMessage: '回单待处理',
  },
  auditPOD: {
    id: 'transport.tracking.pod.audit',
    defaultMessage: '回单待审核',
  },
  passedPOD: {
    id: 'transport.tracking.pod.passed',
    defaultMessage: '回单已接受',
  },
  waitingResubmitPOD: {
    id: 'transport.tracking.pod.warning.resubmit',
    defaultMessage: '待重新提交',
  },
  nonePOD: {
    id: 'transport.tracking.pod.none',
    defaultMessage: '不需回单',
  },
  finished: {
    id: 'transport.tracking.pod.finished',
    defaultMessage: '已完成',
  },
  exceptionWarn: {
    id: 'transport.tracking.exception.warning',
    defaultMessage: '警告',
  },
  exceptionErr: {
    id: 'transport.tracking.exception.error',
    defaultMessage: '异常',
  },
  exceptionLoss: {
    id: 'transport.tracking.exception.loss',
    defaultMessage: '损差',
  },
  sendAction: {
    id: 'transport.tracking.action.send',
    defaultMessage: '发送',
  },
  acceptAction: {
    id: 'transport.tracking.action.accept',
    defaultMessage: '接单',
  },
  dispatchAction: {
    id: 'transport.tracking.action.dispatch',
    defaultMessage: '分配',
  },
  pickupAction: {
    id: 'transport.tracking.action.pickup',
    defaultMessage: '提货',
  },
  deliverAction: {
    id: 'transport.tracking.action.deliver',
    defaultMessage: '交货',
  },
  podUploadAction: {
    id: 'transport.tracking.action.pod.upload',
    defaultMessage: '上传',
  },
  ownFleet: {
    id: 'transport.tracking.own.fleet',
    defaultMessage: '我的车队',
  },
  vehicleModalTitle: {
    id: 'transport.tracking.modal.vehicle.title',
    defaultMessage: '上报车辆信息',
  },
  vehiclePlate: {
    id: 'transport.tracking.modal.vehicle.plate',
    defaultMessage: '车牌号',
  },
  unknownPlate: {
    id: 'transport.tracking.modal.vehicle.unknown.plate',
    defaultMessage: '未知车牌号',
  },
  driverName: {
    id: 'transport.tracking.modal.driver.name',
    defaultMessage: '司机姓名',
  },
  unknownDriver: {
    id: 'transport.tracking.modal.unknown.driver',
    defaultMessage: '未知司机',
  },
  taskRemark: {
    id: 'transport.tracking.modal.task.remark',
    defaultMessage: '备注',
  },
  remarkPlaceholder: {
    id: 'transport.tracking.modal.remark.placeholder',
    defaultMessage: '司机联系方式等',
  },
  trackingEventsModalTitle: {
    id: 'transport.tracking.modal.events.title',
    defaultMessage: '追踪事件记录',
  },
  pickupModalTitle: {
    id: 'transport.tracking.modal.pickup.title',
    defaultMessage: '更新提货',
  },
  deliverModalTitle: {
    id: 'transport.tracking.modal.deliver.title',
    defaultMessage: '更新交货',
  },
  pickupActDate: {
    id: 'transport.tracking.pickup.act.date',
    defaultMessage: '实际提货日期',
  },
  deliverActDate: {
    id: 'transport.tracking.delivery.act.date',
    defaultMessage: '实际交货日期',
  },
  chooseActualTime: {
    id: 'transport.tracking.act.date',
    defaultMessage: '选择实际日期',
  },
  pickupTimeMust: {
    id: 'transport.tracking.modal.pickup.time.must',
    defaultMessage: '提货时间必选',
  },
  deliverTimeMust: {
    id: 'transport.tracking.modal.deliver.time.must',
    defaultMessage: '交货时间必选',
  },
  podModalTitle: {
    id: 'transport.tracking.modal.pod.title',
    defaultMessage: '上传回单',
  },
  signStatus: {
    id: 'transport.tracking.modal.pod.signstatus',
    defaultMessage: '签收状态',
  },
  normalSign: {
    id: 'transport.tracking.modal.pod.sign.normal',
    defaultMessage: '正常签收',
  },
  abnormalSign: {
    id: 'transport.tracking.modal.pod.sign.abnormal',
    defaultMessage: '异常签收',
  },
  refusedSign: {
    id: 'transport.tracking.modal.pod.sign.refused',
    defaultMessage: '拒绝签收',
  },
  signRemark: {
    id: 'transport.tracking.modal.pod.sign.remark',
    defaultMessage: '签收备注',
  },
  signRemarkPlaceholder: {
    id: 'transport.tracking.modal.pod.signremark.placeholder',
    defaultMessage: '货差/货损/拒签原因',
  },
  podPhoto: {
    id: 'transport.tracking.modal.pod.photo',
    defaultMessage: '回单照片',
  },
  photoSubmit: {
    id: 'transport.tracking.modal.pod.click.submit',
    defaultMessage: '上传照片',
  },
  auditPod: {
    id: 'transport.tracking.table.pod.audit',
    defaultMessage: '审核回单',
  },
  rejectByUs: {
    id: 'transport.tracking.table.pod.rejectby.us',
    defaultMessage: '我方退回',
  },
  submitToUpper: {
    id: 'transport.tracking.table.pod.submit.to',
    defaultMessage: '待客户审核',
  },
  resubmitPod: {
    id: 'transport.tracking.table.pod.resubmit',
    defaultMessage: '重新提交',
  },
  acceptByUpper: {
    id: 'transport.tracking.table.pod.accept.by.upper',
    defaultMessage: '客户接受',
  },
  auditPass: {
    id: 'transport.tracking.pod.modal.audit.paas',
    defaultMessage: '通过',
  },
  auditReturn: {
    id: 'transport.tracking.pod.modal.audit.return',
    defaultMessage: '退回',
  },
  export: {
    id: 'transport.tracking.pod.modal.export.export',
    defaultMessage: '导出',
  },
  exportExcel: {
    id: 'transport.tracking.pod.modal.export.exportExcel',
    defaultMessage: '导出Excel',
  },
  exportPDF: {
    id: 'transport.tracking.pod.modal.export.exportPDF',
    defaultMessage: '导出PDF',
  },
});
