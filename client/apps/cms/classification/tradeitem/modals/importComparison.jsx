import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Popconfirm, Icon, Tooltip, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import RowUpdater from 'client/components/rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import { createRepo, setCompareVisible, loadOwners } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { TRADE_ITEM_STATUS } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    visibleCompareModal: state.cmsTradeitem.visibleCompareModal,
  }),
  { createRepo, setCompareVisible, loadOwners }
)

export default class ImportComparisonModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    visibleCompareModal: PropTypes.bool.isRequired,
    data: PropTypes.array.isRequired,
  }
  handleCancel = () => {
    this.props.setCompareVisible(false);
  }
  handleOk = () => {

  }
  handleRowDel = () => {

  }
  handleNewHscode = () => {

  }
  handleNewGmodel = () => {

  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    width: 210,
    render: (o, record) => {
      if (record.feedback === 'repeat') {
        return (
          <Tooltip title="已存在该条记录，请勿重复添加">
            <Tag color="orange">{o}</Tag>
          </Tooltip>);
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 180,
    render: (o, record) => {
      if (record.feedback === 'wrongHscode') {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="red">{o}</Tag>
          </Tooltip>
        );
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('preHscode'),
    dataIndex: 'item_hscode',
    width: 180,
    render: (o, record) => {
      if (record.feedback === 'wrongpreHscode') {
        return (
          <Tooltip title="错误的商品编码">
            <Tag color="orange">{o}</Tag>
          </Tooltip>
        );
      } else {
        return <span>{o}</span>;
      }
    },
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 300,
  }, {
    title: this.msg('preGModel'),
    dataIndex: 'item_g_model',
    width: 300,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 400,
    render: o => <TrimSpan text={o} maxLen={20} />,
  }, {
    title: this.msg('status'),
    dataIndex: 'status',
    width: 120,
    render: (o) => {
      const status = TRADE_ITEM_STATUS.filter(sts => sts.value === o)[0];
      if (status) {
        return (<span>{status.text}</span>);
      } else {
        return (<span>{o}</span>);
      }
    },
  }]
  render() {
    const { visibleCompareModal, data } = this.props;
    const columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 120,
      fixed: 'right',
      render: (o, record) => {
        if (record.feedback === 'chooseHscode') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
                <a role="button"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleNewHscode} label="使用新编码" row={record} />
            </span>
          );
        } else if (record.feedback === 'chooseGmdel') {
          return (
            <span>
              <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
                <a role="button"><Icon type="delete" /></a>
              </Popconfirm>
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleNewGmodel} label="使用新规格型号" row={record} />
            </span>
          );
        } else {
          return (
            <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleRowDel(record.id)}>
              <a role="button"><Icon type="delete" /></a>
            </Popconfirm>);
        }
      },
    });
    return (
      <Modal title={this.msg('对比结果确认')} visible={visibleCompareModal}
        onOk={this.handleOk} onCancel={this.handleCancel} width={1000}
      >
        <Table rowKey={record => record.id} columns={columns} dataSource={data} scroll={{ x: 1500 }} />
      </Modal>
    );
  }
}

