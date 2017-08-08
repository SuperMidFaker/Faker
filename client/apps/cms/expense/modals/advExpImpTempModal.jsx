import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Table, Tabs, Alert, Popconfirm, Icon, message, Tooltip, Tag } from 'antd';
import { showAdvImpTempModal, saveImptAdvFees } from 'common/reducers/cmsExpense';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { INVOICE_TYPE } from 'common/constants';

const TabPane = Tabs.TabPane;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    advImpTempVisible: state.cmsExpense.advImpTempVisible,
    advImport: state.cmsExpense.advImport,
    advImportParams: state.cmsExpense.advImportParams,
  }),
  { showAdvImpTempModal, saveImptAdvFees }
)
export default class AdvExpsImpTempModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    advImpTempVisible: PropTypes.bool.isRequired,
    showAdvImpTempModal: PropTypes.func.isRequired,
    advImport: PropTypes.object.isRequired,
    onload: PropTypes.func.isRequired,
  }
  state = {
    tabkey: this.props.advImportParams.importMode,
    datas: [],
    ptDatas: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.advImport.advbodies !== this.props.advImport.advbodies) {
      const advbodies = nextProps.advImport.advbodies;
      const datas = [];
      for (let i = 0; i < advbodies.length; i++) {
        const advbody = advbodies[i];
        const data = { ...advbody, total: 0 };
        advbody.fees.forEach((fe) => {
          data[`${fe.fee_code}`] = fe.cal_fee;
          data[`${fe.fee_code}_tax`] = fe.tax_fee;
          data.total += fe.total_fee;
        });
        datas.push(data);
      }
      this.setState({ datas });
    }
    if (nextProps.advImport.ptAdvbodies !== this.props.advImport.ptAdvbodies) {
      const ptAdvbodies = nextProps.advImport.ptAdvbodies;
      const ptDatas = [];
      for (let i = 0; i < ptAdvbodies.length; i++) {
        const advbody = ptAdvbodies[i];
        const data = { ...advbody, total: 0 };
        advbody.fees.forEach((fe) => {
          data[`${fe.fee_code}`] = fe.cal_fee;
          data[`${fe.fee_code}_tax`] = fe.tax_fee;
          data.total += fe.total_fee;
        });
        ptDatas.push(data);
      }
      this.setState({ ptDatas });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [{
    title: this.msg('delgNo'),
    dataIndex: 'delg_no',
    width: 150,
    render: (o, record) => {
      if (record.feedback === 'wrong') {
        return (<Tooltip title="导入错误"><Tag color="red">{o}</Tag></Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('billSeqNo'),
    dataIndex: 'bill_seq_no',
    width: 150,
    render: (o, record) => {
      if (record.feedback === 'wrong') {
        return (<Tag color="red">{o}</Tag>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('entryId'),
    dataIndex: 'pre_entry_seq_no',
    width: 150,
    render: (o, record) => {
      if (record.feedback === 'wrong') {
        return (<Tag color="red">{o}</Tag>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('orderNo'),
    dataIndex: 'order_no',
    width: 150,
    render: (o, record) => {
      if (record.feedback === 'wrong') {
        return (<Tag color="red">{o}</Tag>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('totalValue'),
    dataIndex: 'total',
    width: 120,
  }];
  handleCancel = () => {
    this.props.showAdvImpTempModal(false);
  }
  handleSave = () => {
    const datas = this.state.datas.filter(dt => dt.feedback !== 'wrong');
    this.props.saveImptAdvFees(datas).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.showAdvImpTempModal(false);
        this.props.onload();
      }
    });
  }
  handleRemove = (idx) => {
    const datas = this.state.datas;
    datas.splice(idx, 1);
    this.setState({ datas });
  }
  handleTabChange = (tabkey) => {
    this.setState({ tabkey });
  }
  render() {
    const { advImpTempVisible, advImport, advImportParams } = this.props;
    const { tableTitle, quoteInv, statistics } = advImport;
    const columns = [...this.columns];
    for (let i = 0; i < tableTitle.title.length; i++) {
      columns.push({
        title: tableTitle.title[i],
        dataIndex: tableTitle.dataIndex[i],
        width: 120,
      });
    }
    columns.push({
      title: this.msg('opColumn'),
      width: 60,
      fixed: 'right',
      render: (o, record, idx) => (<Popconfirm title="确认删除?" onConfirm={() => this.handleRemove(idx)}>
        <a role="presentation"><Icon type="delete" /></a>
      </Popconfirm>),
    });
    const invoiceType = INVOICE_TYPE.filter(tp => tp.value === quoteInv)[0];
    const invType = invoiceType ? invoiceType.text : '';
    let tabMsg = '代垫应付';
    let str = `收款方：${advImportParams.partner.name}`;
    let payerStr = `收款方：${this.props.tenantName}`;
    if (advImportParams.importMode === 'recpt') {
      tabMsg = '代垫应收';
      str = `付款方：${advImportParams.partner.name}`;
      payerStr = `收款方：${advImportParams.partner.name}`;
    }
    const alertMessage = `${str} 开票类型：${invType} \xa0\xa0\xa0\xa0\xa0 共导入 ${statistics.total} 项 正常 ${statistics.usual} 项 异常 ${statistics.unusual} 项`;
    const tabs = [
      <TabPane tab={tabMsg} key="pay">
        <Alert message={alertMessage} type="info" showIcon />
        <Table columns={columns} dataSource={this.state.datas} pagination={false} scroll={{ x: '130%', y: 200 }} />
      </TabPane>,
    ];
    if (advImportParams.calculateAll) {
      tabs.push(
        <TabPane tab="付款方应收" key="recpt">
          <Alert message={payerStr} type="info" showIcon />
          <Table columns={columns} dataSource={this.state.ptDatas} pagination={false} scroll={{ x: '130%', y: 200 }} />
        </TabPane>);
    }
    return (
      <Modal visible={advImpTempVisible} title={this.msg('advanceFee')} onCancel={this.handleCancel} onOk={this.handleSave} width={1000} okText="保存">
        <Tabs activeKey={this.state.tabkey} onChange={this.handleTabChange}>
          {tabs}
        </Tabs>
      </Modal>
    );
  }
}
