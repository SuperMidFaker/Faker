const MODULE_CUSTOMER = {
  id: 'customer',
  text: 'moduleCustomerCenter',
  defaultText: '客户中心',
  features: [
  ],
};

const MODULE_CLEARANCE = {
  id: 'clearance',
  text: 'moduleClearance',
  defaultText: '清关管理',
  features: [
  ],
};

const MODULE_TRANSPORT = {
  id: 'transport',
  text: 'moduleTransport',
  defaultText: '国内运输',
  features: [
  ],
};

const MODULE_CORPORATION = {
  id: 'corp',
  text: 'moduleCorporation',
  features: [
    {
      id: 'info',
      text: 'featCorpInfo',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'save',
          text: 'featActionSave',
        },
      ],
    },
  ],
};

const appModules = [
  MODULE_CUSTOMER,
  MODULE_CLEARANCE,
  MODULE_TRANSPORT,
];

export const DEFAULT_MODULES = {};
appModules.forEach((mod, index) => {
  DEFAULT_MODULES[mod.id] = {
    id: mod.id,
    cls: mod.id,
    url: `/${mod.id}`,
    text: mod.text,
    defaultText: mod.defaultText,
    index,
  };
});

export const INTRINSIC_MODULE_FEATURES = [
  ...appModules,
  MODULE_CORPORATION,
];

export const MODULE_INDEX = {};
INTRINSIC_MODULE_FEATURES.forEach((im, midx) => {
  MODULE_INDEX[im.id] = midx;
  im.features.forEach((imf, fidx) => {
    MODULE_INDEX[`${im.id}.${imf.id}`] = fidx;
    imf.actions.forEach((imfa, aidx) => {
      MODULE_INDEX[`${im.id}.${imf.id}.${imfa.id}`] = aidx;
    });
  });
});
