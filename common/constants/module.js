const MODULE_SCOF = {
  id: 'scof',
  text: 'moduleSCOF',
  defaultText: '客户订单流',
  features: [
  ],
};

const MODULE_CLEARANCE = {
  id: 'clearance',
  text: 'moduleClearance',
  defaultText: '清关管理',
  status: null,
  features: [
    {
      id: 'import',
      text: 'featClearanceImport',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'export',
      text: 'featClearanceExport',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'quote',
      text: 'featClearanceQuote',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'expense',
      text: 'featClearanceExpense',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'billing',
      text: 'featClearanceBilling',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'settings',
      text: 'featClearanceSettings',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
  ],
};

const MODULE_TRANSPORT = {
  id: 'transport',
  text: 'moduleTransport',
  defaultText: '国内运输',
  status: null,
  features: [
    {
      id: 'dashboard',
      text: 'featTransportDashboard',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        },
      ],
    },
    {
      id: 'shipment',
      text: 'featTransportShipment',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'dispatch',
      text: 'featTransportDispatch',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'tracking',
      text: 'featTransportTracking',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        },
      ],
    },
    {
      id: 'resources',
      text: 'featTransportResources',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'tariff',
      text: 'featTransportTariff',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
  ],
};

const MODULE_CWM = {
  id: 'cwm',
  text: 'moduleCWM',
  defaultText: '仓储协同',
  status: 'alpha',
  features: [
  ],
};

const MODULE_SCV = {
  id: 'scv',
  text: 'moduleSCV',
  defaultText: 'SCV',
  status: 'beta',
  features: [],
};

const MODULE_CORPORATION = {
  id: 'corp',
  text: 'moduleCorporation',
  status: null,
  features: [
    {
      id: 'overview',
      text: 'featCorpOverview',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        },
      ],
    },
    {
      id: 'info',
      text: 'featCorpInfo',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        },
      ],
    },
    {
      id: 'personnel',
      text: 'featCorpPersonnel',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'organization',
      text: 'featCorpOrganization',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'role',
      text: 'featCorpRole',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
    {
      id: 'partners',
      text: 'featCorpPartners',
      actions: [
        {
          id: 'view',
          text: 'featActionView',
        }, {
          id: 'edit',
          text: 'featActionEdit',
        }, {
          id: 'create',
          text: 'featActionCreate',
        }, {
          id: 'delete',
          text: 'featActionDelete',
        },
      ],
    },
  ],
};

const appModules = [
  MODULE_SCOF,
  MODULE_CLEARANCE,
  MODULE_TRANSPORT,
  MODULE_CWM,
  MODULE_SCV,
];

export const DEFAULT_MODULES = {};
appModules.forEach((mod, index) => {
  DEFAULT_MODULES[mod.id] = {
    id: mod.id,
    cls: mod.id,
    url: `/${mod.id}`,
    text: mod.text,
    status: mod.status,
    defaultText: mod.defaultText,
    index,
  };
});

export const INTRINSIC_MODULE_FEATURES = [
  ...appModules,
  MODULE_CORPORATION,
];
