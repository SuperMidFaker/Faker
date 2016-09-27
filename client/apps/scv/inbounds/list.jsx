import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio, Button, Progress, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadInbounds } from 'common/reducers/scvinbound';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
// import TrimSpan from 'client/components/trimSpan';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import RowUpdater from './rowUpdater';
import InboundExpander from './expander';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadInbounds({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.scvinbound.list.pageSize,
    current: state.scvinbound.list.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    inboundlist: state.scvinbound.list,
    listFilter: state.scvinbound.listFilter,
  }),
  { loadInbounds }
)
export default class InboundList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    inboundlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadInbounds: PropTypes.func.isRequired,
  }
  state = {
    expandedKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('shipmentNo'),
    dataIndex: 'shipment_no',
    width: 120,
  }, {
    title: this.msg('orderNo'),
    dataIndex: 'order_no',
    width: 120,
  }, {
    title: this.msg('originCountry'),
    width: 120,
    dataIndex: 'origin_country',
  }, {
    title: this.msg('originPort'),
    width: 140,
    dataIndex: 'origin_port_code',
    render: (o, row) => `${row.origin_port_code},${row.origin_port_city}`,
  }, {
    title: this.msg('destPort'),
    width: 140,
    dataIndex: 'dest_port_code',
    render: (o, row) => `${row.dest_port_code},${row.dest_port_city}`,
  }, {
    title: this.msg('mode'),
    width: 80,
    dataIndex: 'trans_mode',
    render: (o) => {
      if (o === 'Air') {
        return <i className="zmdi zmdi-airplane zmdi-hc-2x" />;
      } else {
        return <i className="zmdi zmdi-boat zmdi-hc-2x" />;
      }
    },
  }, {
    title: this.msg('etd'),
    width: 100,
    dataIndex: 'etd_time',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('atd'),
    width: 100,
    dataIndex: 'atd_time',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('eta'),
    width: 100,
    dataIndex: 'eta_time',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('ata'),
    width: 100,
    dataIndex: 'ata_time',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('declarationFinished'),
    width: 100,
    dataIndex: 'declaration_finished_time',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('etaDelivery'),
    width: 130,
    dataIndex: 'delivery_eta',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('ataDelivery'),
    width: 130,
    dataIndex: 'delivery_ata',
    render: (o) => {
      return o ? moment(o).format('YYYY/MM/DD') : '';
    },
  }, {
    title: this.msg('status'),
    width: 160,
    dataIndex: 'status',
    render: (o, record) => {
      if (record.status === 1) {
        return (
          <div>
            {this.msg('atorigin')}
            <Progress percent={16} showInfo={false} />
          </div>
        );
      } else if (record.status === 2) {
        return (
          <div>
            {this.msg('intransit')}
            <Progress percent={32} showInfo={false} />
          </div>
        );
      } else if (record.status === 3) {
        return (
          <div>
            {this.msg('atdest')}
            <Progress percent={48} showInfo={false} />
          </div>
        );
      } else if (record.status === 4) {
        return (
          <div>
            {this.msg('atclearance')}
            <Progress percent={64} showInfo={false} />
          </div>
        );
      } else if (record.status === 5) {
        return (
          <div>
            {this.msg('atdelivering')}
            <Progress percent={80} showInfo={false} />
          </div>
        );
      } else if (record.status === 6) {
        return (
          <div>
            {this.msg('atreceived')}
            <Progress percent={100} showInfo={false} />
          </div>
        );
      } else {
        return <span />;
      }
    },
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: (o, record) => {
      if (record.status === 3) {
        return (
          <span>
            <RowUpdater onHit={this.handleDelegationAccept} label={this.msg('sendAtDest')} row={record} />
            <span className="ant-divider" />
          </span>
        );
      } else if (record.status < 3) {
        return (
          <span>
            <RowUpdater onHit={this.handleDelegationCancel} label={this.msg('viewTrack')} row={record} />
          </span>
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadInbounds(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.inboundlist,
  })
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    const { tenantId, inboundlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleExpandDetail = row => <InboundExpander row={row} />
  render() {
    const { inboundlist, listFilter } = this.props;
    this.dataSource.remotes = inboundlist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <span>{this.msg('inboundShipments')}</span>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange}>
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="atorigin">{this.msg('atorigin')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransit')}</RadioButton>
            <RadioButton value="atdest">{this.msg('atdest')}</RadioButton>
            <RadioButton value="clearance">{this.msg('atclearance')}</RadioButton>
            <RadioButton value="delivering">{this.msg('atdelivering')}</RadioButton>
            <RadioButton value="received">{this.msg('atreceived')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <Button type="primary" icon="plus-circle-o">
              {this.msg('importShipments')}
              </Button>
            </div>
            <div className="panel-body table-panel expandable">
              <Table columns={this.columns} dataSource={this.dataSource} loading={inboundlist.loading}
                expandedRowKeys={this.state.expandedKeys} rowKey="id"
                expandedRowRender={this.handleExpandDetail}
                scroll={{ x: 1380 }} onExpandedRowsChange={this.handleExpandedChange}
              />
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
