import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import { format } from 'client/common/i18n/helpers';
import DataPane from 'client/components/DataPane';
import messages from '../message.i18n';

const formatMsg = format(messages);

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
  getColumns() {
    const columns = [{
      title: this.msg('型号系列'),
      dataIndex: 'permit_model',
      width: 200,
    }, {
      title: this.msg('关联商品货号'),
      dataIndex: 'rel_product_nos',
    }, {
      title: this.msg('使用次数'),
      dataIndex: 'usage_count',
    }, {
      title: this.msg('使用时间'),
      dataIndex: 'usage_date',
    }, {
      title: this.msg('使用对象'),
      dataIndex: 'pre_entry_seq_no',
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
  handleRowClick = (record) => {
    this.props.showGoodsModal(record);
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
        onRow={record => ({
          onDoubleClick: () => { this.handleRowClick(record); },
        })}
      >
        <DataPane.Toolbar>
          <Button>添加</Button>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
