import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Tag } from 'antd';
import { format } from 'client/common/i18n/helpers';
import DataPane from 'client/components/DataPane';
import RowAction from 'client/components/RowAction';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  permitItems: state.cmsCiqDeclare.permitItems,
}), { })
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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  columns = [{
    title: this.msg('序号'),
    dataIndex: 's_no',
    fixed: 'left',
    width: 45,
    align: 'center',
  }, {
    title: this.msg('型号系列'),
    dataIndex: 'permit_model',
    width: 200,
  }, {
    title: this.msg('关联商品货号'),
    dataIndex: 'rel_product_nos',
  }, {
    title: this.msg('opCol'),
    dataIndex: 'OP_COL',
    width: 160,
    fixed: 'right',
    render: (o, record) => {
      if (record.permit_model === '*') {
        return <RowAction onClick={this.handleRowClick} icon="plus-circle-o" label="添加关联货号" row={record} />;
      }
      return (<span>
        <RowAction onClick={this.handleRowClick} icon="rocket" label="自动匹配" row={record} />
        <RowAction onClick={this.handleRowClick} icon="plus-circle-o" tooltip="手动关联货号" row={record} />
      </span>);
    },
  }];
  mockData = [{
    s_no: '1',
    permit_model: '*',
    rel_product_nos: <span><Tag>ABCD</Tag><Tag>XYZ</Tag><Tag>1234</Tag></span>,
  }, {
    s_no: '2',
    permit_model: 'CP5XX-XXX',
    rel_product_nos: <span><Tag>CP501-123</Tag></span>,
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
    return (
      <DataPane
        fullscreen={this.props.fullscreen}
        columns={this.columns}
        bordered
        scrollOffset={312}
        dataSource={this.mockData}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" ghost icon="plus">新增型号系列</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
