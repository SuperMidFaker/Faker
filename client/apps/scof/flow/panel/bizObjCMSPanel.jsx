import React, { Component, PropTypes } from 'react';
import { Card, Icon, Table, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DelegationPane from './pane/cmsDelegationPane';
import DeclManifestPane from './pane/cmsDeclManifestPane';
import CustomsDeclPane from './pane/cmsCustomsDeclPane';
import { formatMsg } from '../message.i18n';

const TabPane = Tabs.TabPane;

@injectIntl
export default class BizObjCMSPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  expandedRowRender = () => {
    const triggerColumns = [
      { title: 'Condition', dataIndex: 'condition', key: 'condition' },
      { title: 'Action', dataIndex: 'action', key: 'action' },
      {
        dataIndex: 'operation',
        key: 'operation',
        width: 40,
        render: () => (
          <span className={'table-operation'}>
            <a href="#"><Icon type="pause-circle" /></a>
          </span>
        ),
      },
    ];

    const triggerData = [];
    for (let i = 0; i < 2; ++i) {
      triggerData.push({
        key: i,
        condition: 'ALL',
        action: 'This is production name',
      });
    }
    return (
      <Table
        size="small"
        columns={triggerColumns}
        dataSource={triggerData}
        pagination={false}
      />
    );
  };
  msg = formatMsg(this.props.intl);
  render() {
    const { form } = this.props;
    return (
      <div>
        <Card title={this.msg('bizObject')} bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="objDelegation">
            <TabPane tab={this.msg('objDelegation')} key="objDelegation">
              <DelegationPane form={form} />
            </TabPane>
            <TabPane tab={this.msg('objDeclManifest')} key="objDeclManifest" >
              <DeclManifestPane form={form} />
            </TabPane>
            <TabPane tab={this.msg('objCustomsDecl')} key="objCustomsDecl" >
              <CustomsDeclPane form={form} />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    );
  }
}
