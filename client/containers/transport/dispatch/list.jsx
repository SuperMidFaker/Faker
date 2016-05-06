import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message, Select } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'reusable/components/nav-link';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { loadTable } from 'universal/redux/reducers/transportDispatch';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/containers/message.i18n';
import Condition from './condition';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(state.transportDispatch.filters),
    pageSize: state.transportDispatch.shipmentlist.pageSize,
    currentPage: state.transportDispatch.shipmentlist.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'transportDispatch'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.transportDispatch.shipmentlist,
    filters: state.transportDispatch.filters,
    loading: state.transportDispatch.loading,
    filterVisible: false,
    filterView: [],
    panelHeader: []
  }),
  { loadTable })
class DispatchList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }

  componentWillMount() {
    this.handlePanelHeaderChange();
  }

  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: JSON.stringify(this.props.filters)
      };
      return params;
    },
    remotes: this.props.shipmentlist
  })

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('shipNo'),
    dataIndex: 'shipmt_no'
  }, {
    title: this.msg('shipRequirement'),
    dataIndex: 'sr_name'
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 140,
  }, {
    title: this.msg('consignorPlace'),
    render: (o, record) => this.renderConsignLoc(record, 'consigner')
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    width: 120,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 140,
  }, {
    title: this.msg('consigneePlace'),
    render: (o, record) => this.renderConsignLoc(record, 'consignee')
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 120,
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'transport_mode'
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count'
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight'
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume'
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    render: (text, record) => record.acpt_time ?
     moment(record.acpt_time).format('YYYY.MM.DD') : ' '
  }, {
    title: this.msg('shipmtOP'),
    render: (o, record) => {
      const s = this.props.filters.status;
      if (s === 'waiting') {
        return (
          <span>
            <a role="button" onClick={() => this.handleShipmtDispatch(record)}>
            {this.msg('btnTextDispatch')}
            </a>
            <span className="ant-divider" />
            <a role="button" onClick={() => this.handleShipmtDivide(record)}>
            {this.msg('btnTextDivide')}
            </a>
          </span>
        );
      } else if (s === 'dispatching') {
        return (
          <span>
            <a role="button" onClick={() => this.handleShipmtSend(record)}>
            {this.msg('btnTextSend')}
            </a>
            <span className="ant-divider" />
            <a role="button" onClick={() => this.handleShipmtReturn(record)}>
            {this.msg('btnTextReturn')}
            </a>
          </span>
        );
      }
      return (<span></span>);
    },
  }]

  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }

  handleStatusChange = (ev) => {
    const { shipmentlist, tenantId, filters } = this.props;
    const tmp = Object.assign({}, filters);
    tmp.status = ev.target.value;

    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(tmp),
      pageSize: shipmentlist.pageSize,
      currentPage: 1
    }).then(result => {
      this.handlePanelHeaderChange();

      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }

  handleConditionChange(condition) {
    console.log(condition);
  }

  handlePanelHeaderChange() {
    const { status } = this.props.filters;

    const panelHeader = [];
    if (status === 'waiting') {
      panelHeader.push((<Condition msg={s => this.msg(s)} onConditionChange={(cd) => this.handleConditionChange(cd)}/>),
      (<span className="ant-divider" style={{width: '0px'}}/>),
      (<NavLink to="/transport/acceptance/shipment/new">
              <Button>
                <span>{this.msg('btnTextOriginShipments')}</span><Icon type="rollback" />
              </Button>
            </NavLink>));
    } else if (status === 'dispatched') {
      panelHeader.push((<Select defaultValue="0" style={{ width: 90 }} onChange={(value) => this.handleDayChange(value)}>
        <Option value="0">最近七天</Option>
        <Option value="1">最近一月</Option>
      </Select>),
      (<span className="ant-divider" style={{width: '0px'}}/>),
      (<NavLink to="/transport/acceptance/shipment/new">
              <Button>
                <span>{this.msg('btnTextExport')}</span><Icon type="arrow-down" />
              </Button>
            </NavLink>));
    }

    this.setState({panelHeader});
  }

  handleShipmtDispatch(shipmt) {
    console.log(shipmt);
  }

  handleShipmtDivide(shipmt) {
    console.log(shipmt);
  }

  handleShipmtSend(shipmt) {
    console.log(shipmt);
  }

  handleShipmtReturn(shipmt) {
    console.log(shipmt);
  }

  handleDayChange() {

  }

  renderConsignLoc(shipmt, field) {
    const province = `${field}_province`;
    const city = `${field}_city`;
    const county = `${field}_district`;
    const names = [];
    if (shipmt[city] && (shipmt[city] === '市辖区' || shipmt[city] === '县')) {
      if (shipmt[province]) {
        names.push(shipmt[province]);
      }
      if (shipmt[county]) {
        names.push(shipmt[county]);
      }
      return names.join('-');
    } else if (shipmt[county] && (shipmt[county] === '市辖区' || shipmt[county] === '县')) {
      return shipmt[city] || '';
    } else {
      if (shipmt[city]) {
        names.push(shipmt[city]);
      }
      if (shipmt[county]) {
        names.push(shipmt[county]);
      }
      return names.join('-');
    }
  }

  render() {
    const { shipmentlist, loading, intl } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      }
    };
    const { status } = this.props.filters;

    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup onChange={this.handleStatusChange} value={status}>
            <RadioButton value="waiting">{this.msg('rdTextWaiting')}</RadioButton>
            <RadioButton value="dispatching">{this.msg('rdTextDispatching')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('rdTextDispatched')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header">
            {this.state.panelHeader}
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(intl, 'clearSelection')}
            </Button>
          </div>
        </div>
        <div className="dock-container">
          <div className="dock-content">
            <div className="dock-sp-line"></div>
            <div className="dock-sp">
              <div className="dock-sp-body">
                <div className="dock-sp-toolbar">

                </div>
                <div className="dock-sp-content">

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DispatchList;
