import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import { format } from 'client/common/i18n/helpers';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { togglePermitItemModal, loadPermitModels, toggleTradeItemModal } from 'common/reducers/cmsPermit';
import PermitItemModal from '../modal/permitItemModal';
import TradeItemsModal from '../modal/tradeItemsModal';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  permitItems: state.cmsPermit.permitItems,
}), { togglePermitItemModal, loadPermitModels, toggleTradeItemModal })
export default class PermitItemsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      pagination: {
        current: 1,
        total: 0,
        pageSize: 8,
        showQuickJumper: false,
        onChange: this.handlePageChange,
      },

    };
  }
  componentDidMount() {
    this.props.loadPermitModels(this.context.router.params.id);
  }
  getColumns() {
    const columns = [{
      title: this.msg('序号'),
      fixed: 'left',
      width: 45,
      align: 'center',
      render: (o, record, index) => index + 1,
    }, {
      title: this.msg('型号系列'),
      dataIndex: 'permit_model',
      width: 200,
    }, {
      title: this.msg('关联商品货号'),
      dataIndex: 'product_no',
    }, {
      dataIndex: 'OP_COL',
      width: 160,
      fixed: 'right',
      render: (o, record, index) => (
        <span>
          <RowAction onClick={this.handleRowClick} icon="sync" label="自动匹配" row={record} index={index} />
          <RowAction onClick={this.handleRowClick} icon="edit" label="手动匹配" row={record} index={index} />
        </span>
      ),
    }];
    return columns;
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleRowClick = () => {
    this.props.toggleTradeItemModal(true);
  }
  handelAdd = () => {
    this.props.togglePermitItemModal(true);
  }
  render() {
    const { permitItems } = this.props;
    const columns = this.getColumns();
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={columns}
        bordered
        scrollOffset={312}
        dataSource={permitItems}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button onClick={this.handelAdd}>添加</Button>
        </DataPane.Toolbar>
        <PermitItemModal permitId={this.context.router.params.id} />
        <TradeItemsModal />
      </DataPane>
    );
  }
}
