import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Table, Tabs, Alert } from 'antd';
import { showAdvImpTempModal } from 'common/reducers/cmsExpense';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const TabPane = Tabs.TabPane;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    advImpTempVisible: state.cmsExpense.advImpTempVisible,
    advImport: state.cmsExpense.advImport,
    advImportParams: state.cmsExpense.advImportParams,
  }),
  { showAdvImpTempModal }
)
export default class AdvExpsImpTempModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    advImpTempVisible: PropTypes.bool.isRequired,
    showAdvImpTempModal: PropTypes.func.isRequired,
    advImport: PropTypes.object.isRequired,
  }
  state = {
    tabkey: this.props.advImportParams.importMode,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
  }, {
    title: this.msg('billSeqNo'),
    dataIndex: 'bill_seq_no',
  }, {
    title: this.msg('entryId'),
    dataIndex: 'pre_entry_seq_no',
  }, {
    title: this.msg('orderNo'),
    dataIndex: 'order_no',
  }];
  handleCancel = () => {
    this.props.showAdvImpTempModal(false);
  }
  handleSave = () => {
    // this.props.saveMarkstate(this.props.data).then((result) => {
    //   if (result.error) {
    //     message.error(result.error.message, 10);
    //   } else {
    //     this.props.showAdvImpTempModal(false);
    //   }
    // });
  }

  render() {
    const { advImpTempVisible, advImport, advImportParams } = this.props;
    const { quoteInv, statistics } = advImport;
    return (
      <Modal visible={advImpTempVisible} title={this.msg('advanceFee')} onCancel={this.handleCancel} onOk={this.handleSave} width={1000}>
        <Tabs activeKey={this.state.tabkey} onChange={this.handleTabChange}>
          <TabPane tab={this.msg('cushCost')} key="pay">
            <Alert message={`收款方：${advImportParams.partner.name} 开票类型：${quoteInv}     共导入${statistics.total}项 正常${statistics.usual}项 异常${statistics.unusual}项`} type="info" showIcon />
            <Table columns={this.columns} pagination={false} scroll={{ y: 200 }} />
          </TabPane>
          <TabPane tab={this.msg('cushBill')} key="recpt">
            <Alert message={`付款方：${advImportParams.partner.name} 开票类型：${quoteInv}     共导入${statistics.total}项 正常${statistics.usual}项 异常${statistics.unusual}项`} type="info" showIcon />
            <Table columns={this.columns} pagination={false} scroll={{ y: 200 }} />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
