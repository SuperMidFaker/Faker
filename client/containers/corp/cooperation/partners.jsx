import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, message } from 'ant-ui';
import { loadPartners, loadPartnershipTypes, delPersonnel, openClosePartnerModal, setModalViewport } from
'../../../../universal/redux/reducers/partner';
import NavLink from '../../../../reusable/components/nav-link';
import SearchBar from '../../../../reusable/components/search-bar';
import PartnerModal from '../../../components/partner-setup-modal';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { isLoaded } from '../../../../reusable/common/redux-actions';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie }) {
  const promises = [];
  if (!isLoaded(state, 'partner')) {
    promises.push(dispatch(loadPartners(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.partner.partnerlist.pageSize,
      currentPage: state.partner.partnerlist.current
    })));
  }
  if (state.partner.partnershipTypes.length === 0) {
    promises.push(dispatch(loadPartnershipTypes(cookie)));
  }
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@connect(
  state => ({
    partnershipTypes: state.partner.partnershipTypes,
    partnerlist: state.partner.partnerlist,
    tenants: state.partner.tenants,
    loading: state.personnel.loading
  }),
  { delPersonnel, setModalViewport, openClosePartnerModal, loadPartners })
export default class PartnersView extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    partnershipTypes: PropTypes.array.isRequired,
    partnerlist: PropTypes.object.isRequired,
    tenants: PropTypes.array.isRequired,
    loadPartners: PropTypes.func.isRequired,
    setModalViewport: PropTypes.func.isRequired,
    openClosePartnerModal: PropTypes.func.isRequired,
    delPersonnel: PropTypes.func.isRequired
  }
  state = {
    inviteOffline: false,
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: (params) => this.props.loadPartners(null, params),
    resolve: (result) => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        // tenantId: tenant.id,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: []
      };
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          params.filters.push({
            name: key,
            value: filters[key][0]
          });
        }
      }
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.partnerlist
  })
  columns = [{
    title: '合作伙伴',
    dataIndex: 'name'
  }, {
    title: '关系',
    dataIndex: 'types',
    render: (o, record) => record.types.map(t => t.name).join('/')
  }, {
    title: '类型',
    dataIndex: 'tenantType'
  }, {
    title: '业务量',
    dataIndex: 'volume'
  }, {
    title: '营收',
    dataIndex: 'revenue',
    render: (o, record) => (record.revenue || 0.0).toFixed(2)
  }, {
    title: '成本',
    dataIndex: 'cost',
    render: (o, record) => record.cost ? record.cost.toFixed(2) : '0.00'
  }, {
    title: '操作',
    width: 150,
    render: (text, record) => {
      // todo if only offline partner_id is null
      return (
        <span>
        <NavLink to={`/corp/personnel/edit/${record.key}`}>发送邀请</NavLink>
        </span>
      );
    }
  }]
  handleSelectionClear = () => {
    this.setState({selectedRowKeys: []});
  }
  handleTenantSwitch(val) {
    const { partnerlist } = this.props;
    this.props.loadPartners(null, {
      tenantId: val,
      pageSize: partnerlist.pageSize,
      currentPage: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  handleSearch = (searchVal) => {
    // OR name condition
    const filters = [[{
      name: 'name',
      value: searchVal
    }, {
      name: 'email',
      value: searchVal
    }, {
      name: 'phone',
      value: searchVal
    }]];
    this.props.loadPartners(null, {
      // tenantId: this.props.tenant.id,
      pageSize: this.props.partnerlist.pageSize,
      currentPage: 1,
      filters: JSON.stringify(filters)
    });
  }
  handleAddPartner = () => {
    this.props.setModalViewport();
    this.props.openClosePartnerModal();
  }
  handlePartnershipFilter = (ev) => {
  }
  render() {
    const { partnershipTypes, tenants, partnerlist, loading } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="pull-right action-btns">
            <SearchBar placeholder="搜索合作伙伴" onInputSearch={this.handleSearch} />
            <a role="button">高级搜索</a>
          </div>
          <h2>合作伙伴</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <div className="pull-right action-btns">
              <Button type="primary" onClick={this.handleAddPartner}>
                <span>添加合作伙伴</span>
              </Button>
            </div>
            <RadioGroup onChange={this.handlePartnershipFilter} defaultValue="all">
              <RadioButton value="all">全部</RadioButton>
              {
                partnershipTypes.map(
                  pst =>
                    <RadioButton value={pst.key} key={pst.key}>{pst.name}({
                      partnerlist.data.filter(pt =>
                        pt.types.filter(ptt => ptt.key === pst.key).length > 0).length
                    })
                    </RadioButton>
                )
              }
            </RadioGroup>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">清除选择</Button>
          </div>
          <PartnerModal visible={this.state.visibleModal}
            inviteOfflineView={this.state.inviteOffline}
          />
        </div>
      </div>
    );
  }
}
