import { defineMessages } from 'react-intl';

const messages = defineMessages({
  openPlatform: {
    id: 'open.platform',
    defaultMessage: '开放平台',
  },
  apiDesc: {
    id: 'open.platform.api.desc',
    defaultMessage: '微骆的OpenAPI是为了给企业提供更强大的第三方自定义扩展，企业用户可以使用微骆平台提供的标准JSON接口进行二次开发，以实现数据交互，系统整合，功能整合，数据调用和数据获取等需求。',
  },
  integrationDesc: {
    id: 'open.platform.integration.desc',
    defaultMessage: '微骆平台提供了与主流关务软件、口岸信息平台的对接能力，企业用户可以通过配置对接参数，快速实现系统整合。',
  },
});

export default messages;
