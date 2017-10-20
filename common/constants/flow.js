exports.NODE_TRIGGERS = [{
  key: 'enter',
  text: 'nodeOnEnter',
}, {
  key: 'exit',
  text: 'nodeOnExit',
}];

const CMS_DELEGATION_TRIGGERS = [
  { key: 'created', text: 'onCreated' },
  { key: 'declared', text: 'onDelgDeclared', actionText: 'delgDeclare' },
  { key: 'inspected', text: 'onDelgInspected', actionText: 'delgInspect' },
  { key: 'released', text: 'onDelgReleased', actionText: 'delgRelease' },
];

const CMS_MANIFEST_TRIGGERS = [
  { key: 'created', text: 'onCreated', actionText: 'manifestCreate' },
  { key: 'generated', text: 'onManifestGenerated', actionText: 'manifestGenerate' },
];

const CMS_CUSTOMS_TRIGGERS = [
  { key: 'reviewed', text: 'onCustomsReviewed', actionText: 'customsReview' },
  { key: 'declared', text: 'onDelgDeclared', actionText: 'customsDelcare' },
  { key: 'released', text: 'onDelgReleased', actionText: 'customsRelease' },
];

const cmsBizObjects = [{
  key: 'cmsDelegation',
  text: 'cmsDelegation',
  triggers: CMS_DELEGATION_TRIGGERS,
}, {
  key: 'cmsManifest',
  text: 'cmsDeclManifest',
  triggers: CMS_MANIFEST_TRIGGERS,
}, {
  key: 'cmsCustomsDecl',
  text: 'cmsCustomsDecl',
  triggers: CMS_CUSTOMS_TRIGGERS,
}];

const tmsBizObjects = [{
  key: 'tmsShipment',
  text: 'tmsShipment',
  triggers: [{
    key: 'shipmtCreated',
    text: 'onCreated',
    actionText: 'shipmtCreate',
  }, {
    key: 'shipmtAccepted',
    text: 'onShipmtAccepted',
    actionText: 'shipmtAccept',
  }, {
    key: 'shipmtDispatched',
    text: 'onShipmtDispatched',
    actionText: 'shipmtDispatch',
  }, {
    key: 'shipmtPickedUp',
    text: 'onPickedUp',
    actionText: 'shipmtPickup',
  }, {
    key: 'shipmtDelivered',
    text: 'onDelivered',
    actionText: 'shipmtDeliver',
  }, {
    key: 'shpmtPod',
    text: 'onPod',
    actionText: 'shipmtPod',
  }],
}];

const cwmRecBizObjects = [{
  key: 'cwmReceiving',
  text: 'cwmRecAsn',
  triggers: [{
    key: 'asnCreated',
    text: 'onCreated',
    actionText: 'asnCreate',
  }, {
    key: 'asnReleased',
    text: 'onAsnReleased',
    actionText: 'asnRelease',
  }, {
    key: 'asnInbound',
    text: 'onAsnInbound',
    actionText: 'asnInbound',
  }, {
    key: 'asnFinished',
    text: 'onAsnFinished',
    actionText: 'asnFinish',
  }],
}];

const cwmShippingBizObjects = [{
  key: 'cwmShipping',
  text: 'cwmShippingOrder',
  triggers: [{
    key: 'soCreated',
    text: 'onCreated',
    actionText: 'soCreate',
  }, {
    key: 'soReleased',
    text: 'onSoReleased',
    actionText: 'soRelease',
  }, {
    key: 'soOutbound',
    text: 'onSoOutbound',
    actionText: 'soOutbound',
  }, {
    key: 'soFinished',
    text: 'onSoFinished',
    actionText: 'soFinish',
  }],
}, {
  key: 'cwmSoNormal',
  text: 'cwmShippingOrderNormalReg',
  triggers: [{ key: 'regFinished',
    text: 'onRegFinished',
    actionText: 'regFinish',
  }],
}];

exports.NODE_BIZ_OBJECTS = {
  import: cmsBizObjects,
  export: cmsBizObjects,
  tms: tmsBizObjects,
  cwmrec: cwmRecBizObjects,
  cwmship: cwmShippingBizObjects,
};

exports.NODE_CREATABLE_BIZ_OBJECTS = {
  import: cmsBizObjects.slice(0, cmsBizObjects.length - 1),
  export: cmsBizObjects.slice(0, cmsBizObjects.length - 1),
  tms: tmsBizObjects,
  cwmrec: cwmRecBizObjects,
  cwmship: cwmShippingBizObjects,
};

exports.NODE_BIZ_OBJECTS_EXECUTABLES = {
  import: [{
    key: 'cmsDelegation',
    text: 'cmsDelegation',
    triggers: [{ action: 'declare', actionText: 'delgDeclare' }],
  }, {
    key: 'cmsManifest',
    text: 'cmsDeclManifest',
    triggers: [{ action: 'generate', actionText: 'manifestGenerate' }],
  }, {
    key: 'cmsCustomsDecl',
    text: 'cmsCustomsDecl',
    triggers: [{ action: 'review', actionText: 'customsReview' }, { action: 'declare', actionText: 'customsDeclare' }],
  }],
  export: [{
    key: 'cmsDelegation',
    text: 'cmsDelegation',
    triggers: [{ action: 'declare', actionText: 'delgDeclare' }],
  }, {
    key: 'cmsManifest',
    text: 'cmsDeclManifest',
    triggers: [{ action: 'generate', actionText: 'manifestGenerate' }],
  }, {
    key: 'cmsCustomsDecl',
    text: 'cmsCustomsDecl',
    triggers: [{ action: 'review', actionText: 'customsReview' }, { action: 'declare', actionText: 'customsDeclare' }],
  }],
  tms: [{
    key: 'tmsShipment',
    text: 'tmsShipment',
    triggers: [{ action: 'accept', actionText: 'shipmtAccept' }],
  }],
  cwmrec: [{
    key: 'cwmReceiving',
    text: 'cwmRecAsn',
    triggers: [],
  }],
  cwmship: [{
    key: 'cwmShipping',
    text: 'cwmShippingOrder',
    triggers: [{ action: 'soReleased', actionText: 'soRelease' }, { action: 'autoAlloc', actionText: '订单自动分配' }],
  }],
};

exports.NODE_NOTIFY_CONTENTS = [
  { key: 'shipmt_order_no', text: '业务编号' },
  { key: 'cust_order_no', text: '订单号' },
  { key: 'cust_invoice_no', text: '发票号' },
  { key: 'cust_contract_no', text: '合同号' },
];
