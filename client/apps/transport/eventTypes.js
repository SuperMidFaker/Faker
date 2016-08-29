const TRANSPORT_EXCEPTIONS = [{
  key: 'SHIPMENT_EXCEPTION_SYS_CHANGE_CONSIGN',
  code: 11006,
  level: 'INFO',
  category: '内容变更',
  name: '发货信息变更',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_CHANGE_DELIVERY',
  code: 11007,
  level: 'INFO',
  category: '内容变更',
  name: '收货信息变更',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_CHANGE_TRANSFER',
  code: 11008,
  level: 'INFO',
  category: '内容变更',
  name: '增加中转信息',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_CHANGE_SCHEDULE',
  code: 11009,
  level: 'INFO',
  category: '内容变更',
  name: '时间计划变更',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_CHANGE_MODE',
  code: 11010,
  level: 'INFO',
  category: '内容变更',
  name: '运输模式变更',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_CHANGE_GOODS',
  code: 11011,
  level: 'INFO',
  category: '内容变更',
  name: '货物信息变更',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_RETURN',
  code: 11001,
  level: 'WARN',
  category: '分配异常',
  name: '退回',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_WITHDRAW',
  code: 11005,
  level: 'WARN',
  category: '分配异常',
  name: '撤回',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_TERMINATE',
  code: 11000,
  level: 'ERROR',
  category: '分配异常',
  name: '终止',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_PICKUP_OVERDUE',
  code: 11012,
  level: 'WARN',
  category: '提货异常',
  name: '提货延迟',
}, {
  key: 'SHIPMENT_EXCEPTION_MIS_GOODS',
  code: 12001,
  level: 'ERROR',
  category: '提货异常',
  name: '货物信息不符',
}, {
  key: 'SHIPMENT_EXCEPTION_MIS_VEHICLE',
  code: 12002,
  level: 'ERROR',
  category: '提货异常',
  name: '车辆要求不符',
}, {
  key: 'SHIPMENT_EXCEPTION_ROAD_CONDITION',
  code: 12003,
  level: 'WARN',
  category: '在途异常',
  name: '路况异常',
}, {
  key: 'SHIPMENT_EXCEPTION_VEHICLE_ACCIDENT',
  code: 12004,
  level: 'WARN',
  category: '在途异常',
  name: '车况异常',
}, {
  key: 'SHIPMENT_EXCEPTION_NULL_LOCATION',
  code: 12005,
  level: 'WARN',
  category: '在途异常',
  name: '位置未更新',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_DELIVER_OVERDUE',
  code: 11013,
  level: 'WARN',
  category: '交货异常',
  name: '交货延迟',
}, {
  key: 'SHIPMENT_EXCEPTION_MIS_DELIVER',
  code: 12006,
  level: 'ERROR',
  category: '交货异常',
  name: '送货错误',
}, {
  key: 'SHIPMENT_EXCEPTION_GOODS_DAMAGED',
  code: 12007,
  level: 'ERROR',
  category: '交货异常',
  name: '货物破损',
}, {
  key: 'SHIPMENT_EXCEPTION_GOODS_SHORTAGE',
  code: 12008,
  level: 'ERROR',
  category: '交货异常',
  name: '货物短少或丢失',
}, {
  key: 'SHIPMENT_EXCEPTION_DELIVER_REJECTED',
  code: 12009,
  level: 'ERROR',
  category: '交货异常',
  name: '货物拒收',
}, {
  key: 'SHIPMENT_EXCEPTION_POD_INFO_ERROR',
  code: 12010,
  level: 'WARN',
  category: '回单异常',
  name: '回单信息错误',
}, {
  key: 'SHIPMENT_EXCEPTION_POD_UNQUALIFIED',
  code: 12011,
  level: 'ERROR',
  category: '回单异常',
  name: '回单不合格',
}, {
  key: 'SHIPMENT_EXCEPTION_SPECIAL_COST',
  code: 12012,
  level: 'ERROR',
  category: '其它异常',
  name: '特殊费用',
}, {
  key: 'SHIPMENT_EXCEPTION_STATUS_UPDATE_ERROR',
  code: 12015,
  level: 'ERROR',
  category: '其它异常',
  name: '运单状态更新错误',
}, {
  key: 'SHIPMENT_EXCEPTION_COMPLAINT',
  code: 12013,
  level: 'ERROR',
  category: '其它异常',
  name: '投诉',
}, {
  key: 'SHIPMENT_EXCEPTION_OTHERS',
  code: 12014,
  level: 'ERROR',
  category: '其它异常',
  name: '其他',
}];
export {
  TRANSPORT_EXCEPTIONS,
};
