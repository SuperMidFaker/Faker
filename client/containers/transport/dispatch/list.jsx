import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message, Popover, Slider, Row, Col } from 'ant-ui';
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

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(state.transportDispatch.table.filters),
    pageSize: state.transportDispatch.table.shipmentlist.pageSize,
    currentPage: state.transportDispatch.table.shipmentlist.current,
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
    shipmentlist: state.transportDispatch.table.shipmentlist,
    filters: state.transportDispatch.table.filters,
    loading: state.transportDispatch.table.loading,
    filterVisible: false,
    filterConsignorStep: 20,
    filterConsigneeStep: 20,
    filterType: 'subline',
    filterView: []
  }),
  { loadTable })
class DispatchList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }

  componentWillMount() {
    this.handleFilterTypeChange('subline');
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
        filters: this.props.filters
      };
      params.filters = params.filters.filter(
        flt => flt.name in filters && filters[flt.name].length
      );
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          params.filters = this.mergeFilters(params.filters, key, filters[key][0]);
        }
      }
      params.filters = JSON.stringify(params.filters);
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
      return (
        <span>
          <a role="button" onClick={() => this.handleShipmtAccept(record.key)}>
          {this.msg('btnTextDispatch')}
          </a>
          <span className="ant-divider" />
          <a role="button" onClick={() => this.handleShipmtReject(record.key)}>
          {this.msg('btnTextDivide')}
          </a>
        </span>
      );
    },
  }]

  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (searchVal) => {
    const filters = JSON.stringify(
      this.mergeFilters(this.props.filters, 'name', searchVal)
    );
    this.props.loadTable(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.shipmentlist.pageSize,
      currentPage: 1,
      filters
    });
  }
  handleShipmentFilter = (ev) => {
    const { shipmentlist, tenantId, filters } = this.props;
    const filterArray = this.mergeFilters(filters, 'type', ev.target.value);
    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(filterArray),
      pageSize: shipmentlist.pageSize,
      currentPage: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleShipmtAccept(dispId) {
    this.props.loadAcceptDispatchers(
      this.props.tenantId, dispId
    );
  }
  mergeFilters(curFilters, name, value) {
    const merged = curFilters.filter(flt => flt.name !== name);
    if (value !== null && value !== undefined && value !== '') {
      merged.push({
        name,
        value
      });
    }
    return merged;
  }

  handleFilterVisibleChange(visible) {
    this.setState({
      filterVisible: visible
    });
  }

  handleFilterTypeChange(e) {
    let filterType = e;
    if (e.target) {
      filterType = e.target.value;
    }
    const markscor = {
      0: this.msg('filterProvince'),
      20: this.msg('filterCity'),
      40: this.msg('filterDistrict'),
      60: this.msg('filterPlace'),
      80: this.msg('filterConsignor')
    };
    const markscee = {
      0: this.msg('filterProvince'),
      20: this.msg('filterCity'),
      40: this.msg('filterDistrict'),
      60: this.msg('filterAddr'),
      80: this.msg('filterConsignee')
    };

    const filterView = [];
    if (filterType === 'consignor' || filterType === 'subline') {
      filterView.push((<Row type="flex" justify="start"><h3>{this.msg('filterTextConsignor')}：</h3></Row>),
      (<Row><Slider step={null} max="80" marks={markscor} defaultValue={20} onChange={this.handleSliderChange.bind(this, 'consignor')}/></Row>));
    }
    if (filterType === 'consignee' || filterType === 'subline') {
      filterView.push((<Row type="flex" justify="start"><h3>{this.msg('filterTextConsignee')}：</h3></Row>),
      (<Row><Slider step={null} max="80" marks={markscee} defaultValue={20} onChange={this.handleSliderChange.bind(this, 'consignee')}/></Row>));
    }
    this.setState({filterView,
      filterType});
  }

  handleSliderChange(type, val) {
    console.log(type, val);
  }

  hideFilter() {
    this.setState({
      filterVisible: false
    });
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
    let radioValue;
    this.props.filters.forEach(flt => {
      if (flt.name === 'type') {
        radioValue = flt.value;
        return;
      }
    });
    const content = (
      <div className="dispatch-filter">
        <Row type="flex" justify="center">
          <RadioGroup value={this.state.filterType} onChange={this.handleFilterTypeChange.bind(this)}>
            <RadioButton value="subline">{this.msg('filterTitleSubLine')}</RadioButton>
            <RadioButton value="consignor">{this.msg('filterTitleConsignor')}</RadioButton>
            <RadioButton value="consignee">{this.msg('filterTitleConsignee')}</RadioButton>
          </RadioGroup>
        </Row>
        {this.state.filterView}
        <Row type="flex" justify="end" style={{paddingTop: '20px'}}>
          <Col span="4"><Button type="ghost" onClick={this.hideFilter.bind(this)}>{this.msg('btnTextCancel')}</Button></Col>
          <Col span="4"><Button type="primary">{this.msg('btnTextOk')}</Button></Col>
        </Row>
      </div>
    );
    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="waiting">{this.msg('rdTextWaiting')}</RadioButton>
            <RadioButton value="dispatching">{this.msg('rdTextDispatching')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('rdTextDispatched')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <Popover placement="bottomLeft" overlay={content} trigger="click"
              visible={this.state.filterVisible} onVisibleChange={this.handleFilterVisibleChange.bind(this)}>
              <Button>
                <span>{this.msg('filterTitle')}</span><Icon type="down" />
              </Button>
            </Popover>
            <span className="ant-divider" style={{width: '0px'}}/>
            <NavLink to="/transport/acceptance/shipment/new">
              <Button>
                <Icon type="rollback" /><span>{this.msg('btnTextOriginShipments')}</span>
              </Button>
            </NavLink>
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
      </div>
    );
  }
}

export default DispatchList;
