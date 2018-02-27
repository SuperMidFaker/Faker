import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Card, Collapse, List, Radio, Layout, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { switchNavOption } from 'common/reducers/cmsPreferences';
import { CMS_DECL_CHANNEL, CMS_PLUGINS } from 'common/constants';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import PageHeader from 'client/components/PageHeader';
import SettingMenu from '../menu';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;
const { Panel } = Collapse;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
    docuType: state.cmsInvoice.docuType,
  }),
  { switchNavOption }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class Preferences extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    declChannel: '',
  }
  componentWillMount() {
    if (window.localStorage) {
      const declChannel = window.localStorage.getItem('decl-channel');
      this.setState({ declChannel });
    }
  }
  msg = formatMsg(this.props.intl)
  handleDeclChannelChange = (ev) => {
    if (window.localStorage) {
      window.localStorage.setItem('decl-channel', ev.target.value);
      this.setState({ declChannel: ev.target.value });
    }
  }
  render() {
    const customPanelStyle = {
      background: 'transparent',
      border: 0,
    };
    const cusDeclPrefList = [
      {
        key: 'declChannel',
        name: '默认申报通道',
        actions: [<RadioGroup
          value={this.state.declChannel}
          onChange={this.handleDeclChannelChange}
        >
          {Object.keys(CMS_DECL_CHANNEL).map((declChannel) => {
          const channel = CMS_DECL_CHANNEL[declChannel];
          return (<RadioButton
            value={channel.value}
            key={channel.value}
            disabled={channel.disabled}
          >
            {channel.text}
          </RadioButton>);
        })}
        </RadioGroup>,
        ],
      },
    ];
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="preferences" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('preferences')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
          </PageHeader>
          <Content className="page-content layout-fixed-width">
            <Collapse bordered={false} defaultActiveKey={['pluginsPref', 'cusDeclPref']}>
              <Panel header={this.msg('pluginsPref')} key="pluginsPref" style={customPanelStyle}>
                <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }} >
                  <List
                    dataSource={CMS_PLUGINS}
                    renderItem={plugin => (
                      <List.Item
                        key={plugin.key}
                        actions={[<Switch checkedChildren="开启" unCheckedChildren="关闭" />]}
                      >
                        <List.Item.Meta
                          title={plugin.name}
                          description={plugin.desc}
                        />
                      </List.Item>
                      )}
                  />
                </Card>
              </Panel>
              <Panel header={this.msg('cusDeclPref')} key="cusDeclPref" style={customPanelStyle}>
                <Card bodyStyle={{ padding: 0 }} style={{ marginBottom: 0 }} >
                  <List
                    dataSource={cusDeclPrefList}
                    renderItem={pref => (
                      <List.Item
                        key={pref.key}
                        actions={pref.actions}
                      >
                        <List.Item.Meta
                          title={pref.name}
                          description={pref.desc}
                        />
                      </List.Item>
                      )}
                  />
                </Card>
              </Panel>
            </Collapse>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
