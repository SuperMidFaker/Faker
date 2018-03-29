import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import DataPane from 'client/components/DataPane';
import { formatMsg } from '../message.i18n';


@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  permitItems: state.cmsCiqDeclare.permitItems,
}), { })
export default class PermitUsagePane extends React.Component {
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
  msg = formatMsg(this.props.intl)
  columns = [{
    key: 'sno',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (o, record, index) => index + 1,
  }, {
    title: this.msg('model'),
    dataIndex: 'permit_model',
    width: 200,
  }, {
    title: this.msg('relProductNos'),
    dataIndex: 'rel_product_nos',
  }, {
    title: this.msg('usageCount'),
    dataIndex: 'usage_count',
  }, {
    title: this.msg('usageDate'),
    dataIndex: 'usage_date',
  }, {
    title: this.msg('usageObject'),
    dataIndex: 'pre_entry_seq_no',
  }];

  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  handleRowClick = (record) => {
    this.props.showGoodsModal(record);
  }
  render() {
    const { permitItems } = this.props;
    return (
      <DataPane

        columns={this.columns}
        scrollOffset={312}
        dataSource={permitItems}
        rowKey="id"
        loading={this.state.loading}
      />
    );
  }
}
