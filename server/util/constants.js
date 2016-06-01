const DELEGATE_STATUS = {
  normal: {
    id: 0,
    name: 'normal',
    text: '待处理'
  },
  blocked: {
    id: 3,
    name: 'blocked',
    text: '停用'
  },
  send: {
    id: 1,
    name: 'send',
    text: '未受理'
  },
  accept: {
    id: 2,
    name: 'accept',
    text: '已接单'
  }
};
const TENANT_USEBOOK = {
  owner: {
    name: 2,
    text: '拥有者'
  },
  manager: {
    name: 1,
    text: '是'
  },
  member: {
    name: 0,
    text: '否'
  }
};
const SMS_TYPE = {
  REG: 1,
  LOGIN: 2,
  RESET_PWD: 3,
  WEB_LOGIN_PWD_FORGET: 4,
  CHANGE_PHONE: 5,
  CHANGE_PAID_PASSWORD: 6
};

const CONSIGN_TYPE = {
  consigner: 0,
  consignee: 1,
};

const SHIPMENT_DISPATCH_STATUS = {
  unconfirmed: 0,
  confirmed: 1,
  cancel: 2,
};

const SHIPMENT_POD_TYPE = {
  qrcode: 1,
  paperprint: 2,
};

const __DEFAULT_PASSWORD__ = '123456';
const ADMIN = 'admin';

export {
  __DEFAULT_PASSWORD__,
  SMS_TYPE,
  ADMIN,
  DELEGATE_STATUS,
  TENANT_USEBOOK,
  CONSIGN_TYPE,
  SHIPMENT_DISPATCH_STATUS,
  SHIPMENT_POD_TYPE,
};
