exports.NODE_TRIGGERS = [{
  key: 'enter',
  text: 'nodeOnEnter',
}, {
  key: 'exit',
  text: 'nodeOnExit',
}];

const CMS_DELEGATION_TRIGGERS = [
  { key: 'created', text: 'onCreated' },
  { key: 'declared', text: 'onDelgDeclared' },
  { key: 'inspected', text: 'onDelgInspected' },
  { key: 'released', text: 'onDelgReleased' },
];

const CMS_MANIFEST_TRIGGERS = [
  { key: 'created', text: 'onCreated' },
  { key: 'generated', text: 'onManifestGenerated' },
];

const CMS_CUSTOMS_TRIGGERS = [
  { key: 'created', text: 'onCreated' },
  { key: 'reviewed', text: 'onCustomsReviewed' },
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
  }, {
    key: 'shipmtPickedUp',
    text: 'onPickedUp',
  }, {
    key: 'shipmtDelivered',
    text: 'onDelivered',
  }, {
    key: 'shpmtPod',
    text: 'onPod',
  }],
}];
const cwmBizObjects = [{
  key: 'cmsDelegation',
  text: 'cmsDelegation',
  triggers: CMS_DELEGATION_TRIGGERS,
}];

exports.NODE_BIZ_OBJECTS = {
  import: cmsBizObjects,
  export: cmsBizObjects,
  tms: tmsBizObjects,
  cwm: cwmBizObjects,
};
