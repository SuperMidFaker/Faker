import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadNodeList } from 'common/reducers/transportResources';
import * as Location from 'client/util/location';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}), { loadNodeList })

export default class ConsignInfoPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    customer: PropTypes.object.isRequired,
    loadNodeList: PropTypes.func.isRequired,
  }
  state = {
    data: [],
    filters: { type: ['0'] },
  }
  componentDidMount() {
    this.props.loadNodeList(this.props.tenantId).then((result) => {
      this.setState({ data: result.data });
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  render() {
    const { data, filters } = this.state;
    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '省/城市/县区 & 地址/坐标',
      dataIndex: 'region',
      key: 'region',
      render: (col, row) => {
        let text = Location.renderLoc(row, 'province', 'city', 'district');
        if (row.street) text = `${text}-${row.street}`;
        return `${text} ${row.addr}`;
      },
    }, {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      render: (col, row) => `${col}/${row.mobile}`,
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      filters: [{ text: '发货地', value: '0' }, { text: '收货地', value: '1' }, { text: '中转地', value: '2' }],
      filteredValue: filters.type,
      render: (col) => {
        switch (col) {
          case 0: return '发货地';
          case 1: return '收货地';
          case 2: return '中转地';
          default: return '';
        }
      },
    }];
    const toDisplayNodes = data.filter(node => node.ref_partner_id === this.props.customer.id && filters.type.indexOf(String(node.type)) >= 0);
    return (
      <Table columns={columns} dataSource={toDisplayNodes} onChange={(pagination, flts) => this.setState({ filters: flts })} />
    );
  }
}
