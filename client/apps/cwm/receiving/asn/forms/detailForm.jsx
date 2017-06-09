/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { showDetailModal } from 'common/reducers/cwmReceive';
import AddDetailModal from '../modal/addDetailModal';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
  }),
  { showDetailModal }
)
export default class DetailForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
  }
  state = {
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
      onChange: this.handlePageChange,
    },
  };
  msg = key => formatMsg(this.props.intl, key);
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  showDetailModal = () => {
    this.props.showDetailModal();
  }
  render() {
    const { editable, temporaryDetails } = this.props;
    const { pagination } = this.state;
    const columns = [{
      title: '序号',
      dataIndex: 'seq_no',
      width: 50,
      render: (col, row, index) => col || pagination.pageSize * (pagination.current - 1) + index + 1,
    }, {
      title: '商品货号',
      dataIndex: 'hscode',
      width: 200,
    }, {
      title: '中文品名',
      dataIndex: 'product_name',
      width: 200,
    }, {
      title: '订单数量',
      width: 100,
      dataIndex: 'qty',
    }, {
      title: '主单位',
      dataIndex: 'first_unit',
    }, {
      title: '单价',
      dataIndex: 'unit_price',
    }];
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <div className="toolbar">
          {editable && <Button type="primary" onClick={this.showDetailModal}>添加明细</Button>}
          {editable && <Button>导入</Button>}
        </div>
        <Table columns={columns} dataSource={temporaryDetails} rowKey="id" pagination={pagination} />
        <AddDetailModal />
      </Card>
    );
  }
}
