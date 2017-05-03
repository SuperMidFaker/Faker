exports.NODE_TRIGGERS = [{
  key: 'enter',
  text: 'nodeOnEnter',
}, {
  key: 'exit',
  text: 'nodeOnExit',
}];

const CMS_DELEGATION_TRIGGERS = [
  { key: 'created', text: 'onCreated', actionText: 'delgCreate' },
  { key: 'declared', text: 'onDelgDeclared', actionText: 'delgDeclare' },
  { key: 'inspected', text: 'onDelgInspected', actionText: 'delgInspect' },
  { key: 'released', text: 'onDelgReleased', actionText: 'delgRelease' },
];

const CMS_MANIFEST_TRIGGERS = [
  { key: 'created', text: 'onCreated' },
  { key: 'generated', text: 'onManifestGenerated', actionText: 'manifestGenerate' },
];

const CMS_CUSTOMS_TRIGGERS = [
  { key: 'reviewed', text: 'onCustomsReviewed', actionText: 'customsReviewed' },
  { key: 'declared', text: 'onDelgDeclared' },
  { key: 'released', text: 'onDelgReleased' },
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

const cwmBizObjects = [{
  key: 'cwmReceiving',
  text: 'cwmReceiving',
  triggers: CMS_DELEGATION_TRIGGERS,
}, {
  key: 'cwmShipping',
  text: 'cwmShipping',
  triggers: CMS_DELEGATION_TRIGGERS,
}];

exports.NODE_BIZ_OBJECTS = {
  import: cmsBizObjects,
  export: cmsBizObjects,
  tms: tmsBizObjects,
  cwm: cwmBizObjects,
};

exports.NODE_CREATABLE_BIZ_OBJECTS = {
  import: cmsBizObjects.slice(0, cmsBizObjects.length - 1),
  export: cmsBizObjects.slice(0, cmsBizObjects.length - 1),
  tms: tmsBizObjects,
  cwm: cwmBizObjects,
};
