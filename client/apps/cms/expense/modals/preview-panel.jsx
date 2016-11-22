import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { openAdvanceFeeModal, hidePreviewer } from 'common/reducers/cmsExpense';
import DelgAdvanceExpenseModal from './delgAdvanceExpenseModal';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    visible: state.cmsExpense.previewer.visible,
    previewer: state.cmsExpense.previewer,
  }),
  { hidePreviewer, openAdvanceFeeModal }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    previewer: PropTypes.object.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    openAdvanceFeeModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [{
    title: this.msg('feeName'),
    dataIndex: 'fee_name',
    key: 'fee_name',
    width: '40%',
  }, {
    title: this.msg('收款金额'),
    dataIndex: 'total_fee_bill',
    key: 'sale_fee',
    width: '30%',
  }, {
    title: this.msg('付款金额'),
    dataIndex: 'total_fee_cost',
    key: 'cost_fee',
    width: '30%',
  }];
  certColumns = [{
    title: this.msg('certBroker'),
    dataIndex: 'broker',
    key: 'broker',
    width: '25%',
  }, {
    title: this.msg('feeName'),
    dataIndex: 'fee_name',
    key: 'fee_name',
    width: '25%',
  }, {
    title: this.msg('收款金额'),
    dataIndex: 'total_fee_bill',
    key: 'sale_fee',
    width: '25%',
  }, {
    title: this.msg('付款金额'),
    dataIndex: 'total_fee_cost',
    key: 'cost_fee',
    width: '25%',
  }];
  handleClose = () => {
    this.props.hidePreviewer();
  }
  handleAddAdvanceFee = () => {
    this.props.openAdvanceFeeModal(this.props.previewer.delgNo);
  }
  render() {
    const { visible, previewer } = this.props;
    const closer = (
      <button
        onClick={this.handleClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    return (
      <div className={`dock-panel preview-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">{previewer.delg_no}</span>
            <div className="pull-right">
              <div className="toolbar">
                <Button type="ghost" onClick={this.handleAddAdvanceFee}>
                  添加代垫费用
                </Button>
              </div>
              {closer}
            </div>
          </div>
          <div className="body">
            <Card title={`报关 供应商: ${previewer.customs.provider}`} bodyStyle={{ padding: 0 }}>
              <Table size="small" columns={this.columns} dataSource={previewer.customs.data} rowKey="id" pagination={false} />
            </Card>
            <Card title={`报检 供应商: ${previewer.ciq.provider}`} bodyStyle={{ padding: 0 }}>
              <Table size="small" columns={this.columns} dataSource={previewer.ciq.data} rowKey="id" pagination={false} />
            </Card>
            <Card title={'鉴定办证'} bodyStyle={{ padding: 0 }}>
              <Table size="small" columns={this.certColumns} dataSource={previewer.cert.data} rowKey="id" pagination={false} />
            </Card>
          </div>
        </div>
        <DelgAdvanceExpenseModal delgNo={previewer.delg_no} />
      </div>
    );
  }
}
