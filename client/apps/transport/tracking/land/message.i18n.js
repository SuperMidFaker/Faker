import { defineMessages } from 'react-intl';

export default defineMessages({
  shipNo: {
    id: 'transport.tracking.shipmt.no',
    defaultMessage: '运单号'
  },
  shipmtStatus: {
    id: 'transport.tracking.shipmt.status',
    defaultMessage: '当前状态'
  },
  shipmtPrevTrack: {
    id: 'transport.tracking.shipmt.prev.track',
    defaultMessage: '上一节点时间'
  },
  shipmtNextUpdate: {
    id: 'transport.tracking.shipmt.next.update',
    defaultMessage: '下一节点更新'
  },
  carrierUpdate: {
    id: 'transport.tracking.carrier.update',
    defaultMessage: '承运商更新'
  },
  driverUpdate: {
    id: 'transport.tracking.driver.update',
    defaultMessage: '司机更新'
  },
  updateVehicleDriver: {
    id: 'transport.tracking.update.drivervehicle',
    defaultMessage: '更新车辆司机'
  },
  updatePickup: {
    id: 'transport.tracking.update.pickup',
    defaultMessage: '更新提货'
  },
  updateDelivery: {
    id: 'transport.tracking.update.delivery',
    defaultMessage: '更新交货'
  },
  submitPod: {
    id: 'transport.tracking.submit.pod',
    defaultMessage: '提交回单'
  },
  shipmtException: {
    id: 'transport.tracking.shipmt.exception',
    defaultMessage: '异常'
  },
  shipmtCarrier: {
    id: 'transport.tracking.shipmt.carrier',
    defaultMessage: '承运商'
  },
  shipmtVehicle: {
    id: 'transport.tracking.shipmt.vehicle',
    defaultMessage: '车辆/司机'
  },
  packageNum: {
    id: 'transport.acceptance.shipment.packageNum',
    defaultMessage: '件数'
  },
  shipWeight: {
    id: 'transport.acceptance.shipment.weight',
    defaultMessage: '重量'
  },
  shipVolume: {
    id: 'transport.acceptance.shipment.volume',
    defaultMessage: '体积'
  },
  shipmtCustomer: {
    id: 'transport.tracking.shipmt.customer',
    defaultMessage: '托运客户'
  },
  departurePlace: {
    id: 'transport.tracking.departure.place',
    defaultMessage: '出发地'
  },
  arrivalPlace: {
    id: 'transport.tracking.arrival.place',
    defaultMessage: '到达地'
  },
  shipmtMode: {
    id: 'transport.tracking.shipment.mode',
    defaultMessage: '运输模式'
  },
  shipmtEstPickupDate: {
    id: 'transport.tracking.est.pickup.date',
    defaultMessage: '预计提货'
  },
  shipmtActPickupDate: {
    id: 'transport.tracking.act.pickup.date',
    defaultMessage: '实际提货'
  },
  shipmtEstDeliveryDate: {
    id: 'transport.tracking.est.delivery.date',
    defaultMessage: '预计交货'
  },
  shipmtActDeliveryDate: {
    id: 'transport.tracking.act.delivery.date',
    defaultMessage: '实际交货'
  },
  allShipmt: {
    id: 'transport.tracking.all.shipment',
    defaultMessage: '所有'
  },
  pendingShipmt: {
    id: 'transport.tracking.pending.shipment',
    defaultMessage: '待接单'
  },
  acceptedShipmt: {
    id: 'transport.tracking.accepted.shipment',
    defaultMessage: '待分配'
  },
  dispatchedShipmt: {
    id: 'transport.tracking.dispatched.shipment',
    defaultMessage: '待提货'
  },
  intransitShipmt: {
    id: 'transport.tracking.intransit.shipment',
    defaultMessage: '运输中'
  },
  deliveredShipmt: {
    id: 'transport.tracking.delivered.shipment',
    defaultMessage: '已交货'
  },
  proofOfDelivery: {
    id: 'transport.tracking.proof.delivery',
    defaultMessage: '回单'
  },
  uploadedPOD: {
    id: 'transport.tracking.uploaded.pod',
    defaultMessage: '待审核回单'
  },
  submittedPOD: {
    id: 'transport.tracking.submitted.pod',
    defaultMessage: '已提交回单'
  },
  passedPOD: {
    id: 'transport.tracking.passed.pod',
    defaultMessage: '已接受回单'
  },
  exceptionWarn: {
    id: 'transport.tracking.exception.warning',
    defaultMessage: '预警'
  },
  exceptionErr: {
    id: 'transport.tracking.exception.error',
    defaultMessage: '异常'
  },
  exceptionLoss: {
    id: 'transport.tracking.exception.loss',
    defaultMessage: '损差'
  },
  sendAction: {
    id: 'transport.tracking.action.send',
    defaultMessage: '发送'
  },
  acceptAction: {
    id: 'transport.tracking.action.accept',
    defaultMessage: '接单'
  },
  dispatchAction: {
    id: 'transport.tracking.action.dispatch',
    defaultMessage: '分配'
  },
  pickupAction: {
    id: 'transport.tracking.action.pickup',
    defaultMessage: '提货'
  },
  deliverAction: {
    id: 'transport.tracking.action.deliver',
    defaultMessage: '交货'
  },
  podUploadAction: {
    id: 'transport.tracking.action.pod.upload',
    defaultMessage: '上传'
  },
  ownFleet: {
    id: 'transport.tracking.own.fleet',
    defaultMessage: '我的车队'
  },
  vehicleModalTitle: {
    id: 'transport.tracking.modal.vehicle.title',
    defaultMessage: '更新车辆司机'
  },
  vehiclePlate: {
    id: 'transport.tracking.modal.vehicle.plate',
    defaultMessage: '车牌'
  },
  driverName: {
    id: 'transport.tracking.modal.driver.name',
    defaultMessage: '司机名称'
  },
  taskRemark: {
    id: 'transport.tracking.modal.task.remark',
    defaultMessage: '备注'
  },
  remarkPlaceholder: {
    id: 'transport.tracking.modal.remark.placeholder',
    defaultMessage: '司机联系方式等信息'
  },
  pickupModalTitle: {
    id: 'transport.tracking.modal.pickup.title',
    defaultMessage: '更新提货时间'
  },
  deliverModalTitle: {
    id: 'transport.tracking.modal.deliver.title',
    defaultMessage: '更新交货时间'
  },
  chooseActualTime: {
    id: 'transport.tracking.modal.choose.actual.time',
    defaultMessage: '选择实际时间'
  },
  podModalTitle: {
    id: 'transport.tracking.modal.pod.title',
    defaultMessage: '上传回单'
  },
  signStatus: {
    id: 'transport.tracking.modal.pod.signstatus',
    defaultMessage: '签收状态'
  },
  normalSign: {
    id: 'transport.tracking.modal.pod.sign.normal',
    defaultMessage: '正常签收'
  },
  abnormalSign: {
    id: 'transport.tracking.modal.pod.sign.abnormal',
    defaultMessage: '异常签收'
  },
  refusedSign: {
    id: 'transport.tracking.modal.pod.sign.refused',
    defaultMessage: '拒绝签收'
  },
  signRemark: {
    id: 'transport.tracking.modal.pod.sign.remark',
    defaultMessage: '签收备注'
  },
  signRemarkPlaceholder: {
    id: 'transport.tracking.modal.pod.signremark.placeholder',
    defaultMessage: '货差/货损/拒签原因'
  },
  podPhoto: {
    id: 'transport.tracking.modal.pod.photo',
    defaultMessage: '回单照片'
  },
  photoSubmit: {
    id: 'transport.tracking.modal.pod.click.submit',
    defaultMessage: '上传照片'
  },
  auditPod: {
    id: 'transport.tracking.table.pod.audit',
    defaultMessage: '审核'
  },
  rejectByUs: {
    id: 'transport.tracking.table.pod.rejectby.us',
    defaultMessage: '我方退回'
  },
  submitToUpper: {
    id: 'transport.tracking.table.pod.submit.to',
    defaultMessage: '已提交'
  },
  resubmitPod: {
    id: 'transport.tracking.table.pod.resubmit',
    defaultMessage: '重新提交'
  },
  acceptByUpper: {
    id: 'transport.tracking.table.pod.accept.by.upper',
    defaultMessage: '客户接受'
  },
  auditPass: {
    id: 'transport.tracking.pod.modal.audit.paas',
    defaultMessage: '通过'
  },
  auditReturn: {
    id: 'transport.tracking.pod.modal.audit.return',
    defaultMessage: '退回'
  },
});
