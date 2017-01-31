import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio, Button, Progress, Upload, Modal, message, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadOutboundShipment, loadOutboundPartners, openModal, openCreateModal } from 'common/reducers/scvOutboundShipments';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
// import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import RowUpdater from './rowUpdater';
import OutboundExpander from './expander';
import SendModal from './senderModal';
import CreateModal from './createModal';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadOutboundShipment({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.scvOutboundShipments.list.pageSize,
    current: state.scvOutboundShipments.list.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    reload: state.scvOutboundShipments.reload,
    outboundList: state.scvOutboundShipments.list,
    listFilter: state.scvOutboundShipments.listFilter,
  }),
  { loadOutboundShipment, loadOutboundPartners, openModal, openCreateModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class OutboundShipmentsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    reload: PropTypes.bool.isRequired,
    outboundList: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadOutboundShipment: PropTypes.func.isRequired,
    loadOutboundPartners: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
  }
  state = {
    expandedKeys: [],
    uploadChangeCount: 0,
    inUpload: false,
    uploadPercent: 10,
    uploadStatus: 'active',
  }
  componentDidMount() {
    this.outboundPoll = setInterval(() => {
      const { tenantId, listFilter, outboundList: { pageSize, current } } = this.props;
      this.props.loadOutboundShipment({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current,
      });
    }, 20 * 1000);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      const { tenantId, listFilter, outboundList: { pageSize } } = nextProps;
      nextProps.loadOutboundShipment({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current: 1,
      });
    }
  }
  componentWillUnmount() {
    if (this.outboundPoll) {
      clearInterval(this.outboundPoll);
    }
  }
  outboundPoll = undefined
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
    title: this.msg('status'),
    width: 200,
    dataIndex: 'status',
    render: (o, record) => {
      if (record.status === 1) {
        return (
          <div>
            {this.msg('atorigin')}
            <Progress percent={10} strokeWidth={5} showInfo={false} />
          </div>
        );
      } else if (record.status === 2) {
        return (
          <div>
            {this.msg('intransit')}
            <Progress percent={30} strokeWidth={5} showInfo={false} />
          </div>
        );
      } else if (record.status === 3) {
        return (
          <div>
            {this.msg('atdest')}
            <Progress percent={60} strokeWidth={5} showInfo={false} />
          </div>
        );
      } else if (record.status === 4) {
        let subMsg;
        if (record.sub_status === 'unaccepted') {
          subMsg = 'Unaccepted';
        } else if (record.sub_status === 'accepted') {
          subMsg = 'Accepted';
        } else if (record.sub_status === 'declaring') {
          subMsg = 'Declaring';
        } else if (record.sub_status === 'declared') {
          subMsg = 'Declared';
        } else if (record.sub_status === 'cleared') {
          subMsg = 'Cleared';
        }
        return (
          <div>
            {this.msg('atclearance')}
            {subMsg && <span style={{ float: 'right', color: '#87D068' }}>{subMsg}</span>}
            <Progress percent={70} strokeWidth={5} showInfo={false} />
          </div>
        );
      } else if (record.status === 5) {
        return (
          <div>
            {this.msg('atdelivering')}
            <Progress percent={80} strokeWidth={5} showInfo={false} />
          </div>
        );
      } else if (record.status === 6) {
        return (
          <div>
            {this.msg('atreceived')}
            <Progress percent={100} strokeWidth={5} showInfo={false} />
          </div>
        );
      } else {
        return <span />;
      }
    },
  }, {
    title: this.msg('originCountry'),
    width: 100,
    dataIndex: 'origin_country',
  }, {
    title: this.msg('originPort'),
    width: 80,
    dataIndex: 'origin_port_code',
    render: (o, row) => [row.origin_port_code || '', row.origin_port_city || ''].filter(orig => orig).join(','),
  }, {
    title: this.msg('destPort'),
    width: 80,
    dataIndex: 'dest_port_code',
    render: (o, row) => [row.dest_port_code || '', row.dest_port_city || ''].filter(orig => orig).join(','),
  }, {
    title: this.msg('mode'),
    width: 80,
    dataIndex: 'trans_mode',
    render: (o) => {
      if (o === 'AIR') {
        return <i className="zmdi zmdi-airplane zmdi-hc-2x" />;
      } else {
        return <i className="zmdi zmdi-boat zmdi-hc-2x" />;
      }
    },
  }, {
    title: this.msg('etd'),
    width: 100,
    dataIndex: 'etd_time',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('atd'),
    width: 100,
    dataIndex: 'atd_time',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('eta'),
    width: 100,
    dataIndex: 'eta_time',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('ata'),
    width: 100,
    dataIndex: 'ata_time',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('customsCleared'),
    width: 100,
    dataIndex: 'decl_finished_time',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('etaDelivery'),
    width: 100,
    dataIndex: 'delivery_eta',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('ataDelivery'),
    width: 100,
    dataIndex: 'delivery_ata',
    render: o => o ? moment(o).format('YYYY/MM/DD') : '',
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: (o, record) => {
      if (record.status <= 3) {
        return (
          <span>
            <RowUpdater onHit={this.handleSendAtDest} label={this.msg('sendAtDest')} row={record} />
            <span className="ant-divider" />
          </span>
        );
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadOutboundShipment(params),
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
    remotes: this.props.outboundList,
  })
  handleImport = (info) => {
    if (this.state.uploadChangeCount === 0) {
      this.state.uploadChangeCount++;
      this.setState({ inUpload: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.state.uploadChangeCount++;
      this.setState({ uploadPercent: info.event.percent });
    } else if (info.file.status === 'done') {
      this.setState({ inUpload: false, uploadStatus: 'success' });
      this.state.uploadChangeCount = 0;
      const { tenantId, pageSize } = this.props;
      this.props.loadOutboundShipment({
        tenantId,
        pageSize,
        current: 1,
      });
    } else if (info.file.status === 'error') {
      this.setState({ inUpload: false, uploadStatus: 'exception' });
      this.state.uploadChangeCount = 0;
    }
  }
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  handleSendAtDest = (row) => {
    this.props.loadOutboundPartners(this.props.tenantId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.openModal(row);
        }
      });
  }
  handleShipmentLoad = () => {
    const { tenantId, listFilter, outboundList: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadOutboundShipment({
      tenantId,
      filter: JSON.stringify(listFilter),
      pageSize,
      current,
    });
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    const { tenantId, outboundList: { pageSize } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadOutboundShipment({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleExpandDetail = row => <OutboundExpander row={row} />
  handleShipmentCreate = () => {
    this.props.openCreateModal();
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, shipment_no: value };
    const { tenantId, outboundList: { pageSize } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadOutboundShipment({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { outboundList, listFilter } = this.props;
    this.dataSource.remotes = outboundList;
    const { inUpload, uploadPercent, uploadStatus } = this.state;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <span>{this.msg('outboundShipments')}</span>
          <RadioGroup value={listFilter.status} onChange={this.handleRadioChange} size="large">
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="atorigin">{this.msg('atorigin')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransit')}</RadioButton>
            <RadioButton value="atdest">{this.msg('atdest')}</RadioButton>
            <RadioButton value="clearance">{this.msg('atclearance')}</RadioButton>
            <RadioButton value="delivering">{this.msg('atdelivering')}</RadioButton>
            <RadioButton value="received">{this.msg('atreceived')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} size="large" />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <Upload accept=".xls,.xlsx" action={`${API_ROOTS.scv}v1/scv/outbound/import/shipments`}
                data={{ tenantId: this.props.tenantId }} onChange={this.handleImport}
                showUploadList={false} withCredentials
              >
                <Button type="primary" icon="plus-circle-o">
                  {this.msg('importShipments')}
                </Button>
              </Upload>
              <Button type="primary" icon="plus-circle-o" onClick={this.handleShipmentCreate}>
                {this.msg('newShipment')}
              </Button>
            </div>
            <div className="panel-body table-panel expandable">
              <Table columns={this.columns} dataSource={this.dataSource} loading={outboundList.loading}
                expandedRowKeys={this.state.expandedKeys} rowKey="id"
                expandedRowRender={this.handleExpandDetail}
                scroll={{ x: 1420 }} onExpandedRowsChange={this.handleExpandedChange}
              />
            </div>
          </div>
          <SendModal reload={this.handleShipmentLoad} />
          <CreateModal />
        </Content>
        <Modal closable={false} maskClosable={false} footer={[]} visible={inUpload}>
          <Progress type="circle" percent={uploadPercent} status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </QueueAnim>
    );
  }
}
