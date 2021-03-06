import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';

import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import { togglePermitItemModal, loadPermitModels, automaticMatch, toggleItemManageModal } from 'common/reducers/cmsPermit';
import PermitItemModal from '../modal/permitItemModal';
import TradeItemsModal from '../modal/tradeItemsModal';
import ItemManageModal from '../modal/itemManageModal';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  permitItems: state.cmsPermit.permitItems,
  currentPermit: state.cmsPermit.currentPermit,
}), {
  togglePermitItemModal, loadPermitModels, automaticMatch, toggleItemManageModal,
})
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
  msg = formatMsg(this.props.intl)
  columns = [{
    dataIndex: 's_no',
    fixed: 'left',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (o, record, index) => index + 1,
  }, {
    title: this.msg('model'),
    dataIndex: 'permit_model',
    width: 200,
  }, {
    title: this.msg('productNo'),
    dataIndex: 'product_no',
  }, {
    title: this.msg('opCol'),
    dataIndex: 'OP_COL',
    width: 160,
    fixed: 'right',
    render: (o, record) => {
      if (record.permit_model === '*') {
        return <RowAction onClick={this.handMatch} icon="tags-o" label={this.msg('manage')} row={record} />;
      }
      return (<span>
        <RowAction onClick={this.automaticMatch} icon="rocket" label={this.msg('automaticMatch')} row={record} />
        <RowAction onClick={this.handMatch} icon="tags-o" tooltip={this.msg('manage')} row={record} />
      </span>);
    },
  }];
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  automaticMatch = (row) => {
    const { currentPermit } = this.props;
    this.props.automaticMatch(
      row.id, row.permit_model,
      currentPermit.owner_partner_id
    ).then((result) => {
      if (!result.error) {
        this.props.loadPermitModels(this.context.router.params.id);
      }
    });
  }
  handMatch = (row) => {
    this.props.toggleItemManageModal(true, row.product_no, row.id);
  }
  handelAdd = () => {
    this.props.togglePermitItemModal(true);
  }
  render() {
    return (
      <DataPane

        columns={this.columns}
        bordered
        scrollOffset={312}
        dataSource={this.props.permitItems}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" ghost icon="plus" onClick={this.handelAdd}>{this.msg('addModel')}</Button>
        </DataPane.Toolbar>
        <PermitItemModal permitId={this.context.router.params.id} />
        <TradeItemsModal permitId={this.context.router.params.id} />
        <ItemManageModal permitId={this.context.router.params.id} />
      </DataPane>
    );
  }
}
