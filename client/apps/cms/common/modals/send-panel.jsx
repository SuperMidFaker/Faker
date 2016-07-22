import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Collapse, message, Select } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { toggleSendDelegateModal, sendDelegate, loadDelegateTable } from 'common/reducers/cmsDelegation';
const Panel = Collapse.Panel;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.sendPanel.visible,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantName: state.account.tenantName,
    sendPanel: state.cmsDelegation.sendPanel,
    formRequire: state.cmsDelegation.formRequire,
    delegationlist: state.cmsDelegation.delegationlist,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { toggleSendDelegateModal, sendDelegate, loadDelegateTable }
)
export default class SendPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    sendPanel: PropTypes.object.isRequired,
    sendDelegate: PropTypes.func.isRequired,
    delegationlist: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    receiver: null,
  }
  handleClose = () => {
    this.props.toggleSendDelegateModal(false);
  }

  handleTrackingDetailOk = () => {

  }
  handleTrackingDetailCancel = () => {
    this.setState({ });
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }

  handleSend = () => {
    const { sendPanel, tenantId, loginId, loginName, tenantName, ietype, delegationlist } = this.props;
    if (this.state.receiver === null) {
      message.error('请选择报关行', 5);
    } else {
      this.props.sendDelegate({ delegations: sendPanel.delegations, receiver: this.state.receiver, tenantId, loginId, loginName, tenantName }).then(
        result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('发送成功', 3);
          const filter = JSON.stringify(this.props.delegateListFilter);
          this.props.loadDelegateTable(null, {
            ietype,
            tenantId,
            filter,
            pageSize: delegationlist.pageSize,
            currentPage: delegationlist.current,
          });
        }
      });
    }
  }
  handleCollapseChange = () => {

  }
  handleCCBChange = (e) => {
    const { formRequire } = this.props;
    formRequire.clients.forEach((item) => {
      if (item.tid === e) {
        this.setState({ receiver: item });
      }
    });
  }
  render() {
    const { visible, sendPanel, formRequire } = this.props;
    const { delegations } = sendPanel;
    const columns = [{
      title: '序号',
      render: (o, record, index) => index + 1,
    }, {
      title: '报关委托号',
      dataIndex: 'delg_no',
    }, {
      title: '提运单号',
      dataIndex: 'bl_wb_no',
    }, {
      title: '发票号',
      dataIndex: 'invoice_no',
    }, {
      title: '创建时间',
      dataIndex: 'created_date',
      render: (o, record) => moment(record.created_date).format('YYYY.MM.DD'),
    }];
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title"></span>
            <div className="pull-right">
              <Button type="ghost" shape="circle-outline" onClick={this.handleClose}>
                <Icon type="cross" />
              </Button>
            </div>
          </div>
          <div className="body" style={{ padding: '10px' }}>
             <Collapse defaultActiveKey={['1']} onChange={this.handleCollapseChange}>
                <Panel header="选择报关行" key="1">
                  <Select size="large" defaultValue="" style={{ width: '100%' }} onChange={this.handleCCBChange}>
                  {formRequire.clients.map((item) => <Option value={item.tid}>{item.name}</Option>)}
                  </Select>
                  <Table columns={columns} dataSource={delegations} rowKey={record => record.delg_no} pagination="false" style={{ marginTop: '10px' }} />
                  <div>
                    <Button type="primary" size="large" onClick={this.handleSend}>发送</Button>
                    <Button type="default" size="large" style={{ marginLeft: '50px' }} onClick={this.handleClose}>取消</Button>
                  </div>
                </Panel>
              </Collapse>
          </div>
        </div>
      </div>
    );
  }
}
