import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { hidePreviewer, setPreviewStatus } from 'common/reducers/cmsDelegation';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.previewer.visible,
    previewer: state.cmsDelegation.previewer,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
  }),
  { hidePreviewer, setPreviewStatus }
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    previewer: PropTypes.object.isRequired,
    delegateListFilter: PropTypes.object.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: this.props.previewer.tabKey || 'basic',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tabKey !== this.state.tabKey) {
      this.setState({ tabKey: nextProps.tabKey || 'basic' });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  columns = [{
    title: this.msg('feeName'),
    dataIndex: 'fee_name',
    key: 'fee_name',
    width: '40%',
  }, {
    title: this.msg('收款金额'),
    dataIndex: 'bill',
    key: 'total_fee',
    width: '30%',
  }, {
    title: this.msg('付款金额'),
    dataIndex: 'cost',
    key: 'total_fee',
    width: '30%',
  }];
  handleClose = () => {
    this.props.hidePreviewer();
  }
  render() {
    const { visible, previewer } = this.props;
    const { delegation } = previewer;
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
            <span className="title">{delegation.delg_no}</span>
            <div className="pull-right">
              {closer}
            </div>
          </div>
          <div className="body">
            <Card title={this.msg('进出口代理 供应商：')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={this.columns} rowKey="id" pagination={false} />
            </Card>
            <Card title={this.msg('报关 供应商：')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={this.columns} rowKey="id" pagination={false} />
            </Card>
            <Card title={this.msg('报检 供应商：')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={this.columns} rowKey="id" pagination={false} />
            </Card>
            <Card title={this.msg('鉴定办证 供应商：')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={this.columns} rowKey="id" pagination={false} />
            </Card>
            <Card title={this.msg('其他 供应商：')} bodyStyle={{ padding: 8 }}>
              <Table size="small" columns={this.columns} rowKey="id" pagination={false} />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
