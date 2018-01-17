import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Radio, Button, Popover, Progress, Upload, Modal, message, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadInbounds, loadInboundPartners, openModal, openCreateModal } from 'common/reducers/scvInboundShipments';
import Table from 'client/components/remoteAntTable';
import SearchBox from 'client/components/SearchBox';
// import TrimSpan from 'client/components/trimSpan';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import RowAction from 'client/components/RowAction';
import InboundExpander from './expander';
import SendModal from './senderModal';
import CreateModal from './createModal';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

function fetchData({ state, dispatch }) {
  return dispatch(loadInbounds({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.scvInboundShipments.list.pageSize,
    current: state.scvInboundShipments.list.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    reload: state.scvInboundShipments.reload,
    inboundlist: state.scvInboundShipments.list,
    listFilter: state.scvInboundShipments.listFilter,
  }),
  {
    loadInbounds, loadInboundPartners, openModal, openCreateModal,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class InboundShipmentsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    reload: PropTypes.bool.isRequired,
    inboundlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadInbounds: PropTypes.func.isRequired,
    loadInboundPartners: PropTypes.func.isRequired,
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
    this.inboundPoll = setInterval(() => {
      const { tenantId, listFilter, inboundlist: { pageSize, current } } = this.props;
      this.props.loadInbounds({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current,
      });
    }, 20 * 1000);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      const { tenantId, listFilter, inboundlist: { pageSize } } = nextProps;
      nextProps.loadInbounds({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current: 1,
      });
    }
  }
  componentWillUnmount() {
    if (this.inboundPoll) {
      clearInterval(this.inboundPoll);
    }
  }
  inboundPoll = undefined
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
      }
      return <span />;
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
      }
      return <i className="zmdi zmdi-boat zmdi-hc-2x" />;
    },
  }, {
    title: this.msg('etd'),
    width: 100,
    dataIndex: 'etd_time',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('atd'),
    width: 100,
    dataIndex: 'atd_time',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('eta'),
    width: 100,
    dataIndex: 'eta_time',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('ata'),
    width: 100,
    dataIndex: 'ata_time',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('customsCleared'),
    width: 100,
    dataIndex: 'decl_finished_time',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('etaDelivery'),
    width: 100,
    dataIndex: 'delivery_eta',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('ataDelivery'),
    width: 100,
    dataIndex: 'delivery_ata',
    render: o => (o ? moment(o).format('YYYY/MM/DD') : ''),
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: (o, record) => {
      if (record.status <= 3) {
        return (
          <span>
            <RowAction onClick={this.handleSendAtDest} label={this.msg('sendAtDest')} row={record} />
            <span className="ant-divider" />
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
      showTotal: total => `共 ${total} 条`,
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
      this.props.loadInbounds({
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
    this.props.loadInboundPartners(this.props.tenantId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.openModal(row);
      }
    });
  }
  handleShipmentLoad = () => {
    const { tenantId, listFilter, inboundlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
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
    const { tenantId, inboundlist: { pageSize } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleExpandDetail = row => <InboundExpander row={row} />
  handleShipmentCreate = () => {
    this.props.openCreateModal();
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, shipment_no: value };
    const { tenantId, inboundlist: { pageSize } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const { inboundlist } = this.props;
    this.dataSource.remotes = inboundlist;
    const { inUpload, uploadPercent, uploadStatus } = this.state;
    const content = (
      <div>
        <a href="#" onClick={this.handleShipmentCreate}>Content</a>
        <p>Content</p>
      </div>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentsTracking')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleRadioChange} defaultValue="active">
            <RadioButton value="active">{this.msg('active')}</RadioButton>
            <RadioButton value="delivered">{this.msg('delivered')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleIEChange} defaultValue="any">
            <RadioButton value="import">{this.msg('import')}</RadioButton>
            <RadioButton value="export">{this.msg('export')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleTransChange} defaultValue="anyTrans">
            <RadioButton value="sea"><i className="zmdi zmdi-boat" /></RadioButton>
            <RadioButton value="air"><i className="zmdi zmdi-airplane" /></RadioButton>
            <RadioButton value="inland"><i className="zmdi zmdi-truck" /></RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <Upload
              accept=".xls,.xlsx"
              action={`${API_ROOTS.scv}v1/scv/inbound/import/shipments`}
              data={{ tenantId: this.props.tenantId }}
              onChange={this.handleImport}
              showUploadList={false}
              withCredentials
            >
              <Button >
                {this.msg('importShipments')}
              </Button>
            </Upload>
            <Popover content={content} title="Title" trigger="click" placement="bottomRight">
              <Button type="primary" icon="plus">
                {this.msg('newShipment')}
              </Button>
            </Popover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBox placeholder={this.msg('searchPlaceholder')} onSearch={this.handleSearch} />
            </div>
            <div className="panel-body table-panel table-fixed-layout expandable">
              <Table
                columns={this.columns}
                dataSource={this.dataSource}
                loading={inboundlist.loading}
                expandedRowKeys={this.state.expandedKeys}
                rowKey="id"
                expandedRowRender={this.handleExpandDetail}
                scroll={{ x: 1420 }}
                onExpandedRowsChange={this.handleExpandedChange}
              />
            </div>
          </div>
          <SendModal reload={this.handleShipmentLoad} />
          <CreateModal />
        </Content>
        <Modal maskClosable={false} closable={false} footer={[]} visible={inUpload}>
          <Progress
            type="circle"
            percent={uploadPercent}
            status={uploadStatus}
            style={{ display: 'block', margin: '0 auto', width: '40%' }}
          />
        </Modal>
      </QueueAnim>
    );
  }
}
