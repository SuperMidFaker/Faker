import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { loadPartners, showPartnerModal } from
'../../../../universal/redux/reducers/partner';
import PartnerModal from '../../../components/partner-setup-modal';
import SearchBar from '../../../../reusable/components/search-bar';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { isLoaded } from '../../../../reusable/common/redux-actions';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie }) {
  if (!isLoaded(state, 'partner')) {
    return dispatch(loadPartners(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.partner.partnerlist.pageSize,
      currentPage: state.partner.partnerlist.current
    }));
  }
}
@connectFetch()(fetchData)
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    text: '合作伙伴',
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnershipTypes: state.partner.partnershipTypes,
    partnerlist: state.partner.partnerlist,
    loading: state.personnel.loading
  }),
  { showPartnerModal, loadPartners })
export default class PartnersView extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    partnershipTypes: PropTypes.array.isRequired,
    partnerlist: PropTypes.object.isRequired,
    loadPartners: PropTypes.func.isRequired,
    showPartnerModal: PropTypes.func.isRequired
  }
  state = {
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
        tenantId: this.props.tenantId,
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
    render: (o, record) => record.types.map(t => t.name).join('/') || '客户'
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
      // todo if only offline uninvited
      if (record.partnerTenantId === -1) {
        return (
          <span>
            <a role="button">发送邀请</a>
          </span>
        );
      } else {
        return <span />;
      }
    }
  }]
  handleSelectionClear = () => {
    this.setState({selectedRowKeys: []});
  }
  handleSearch = (searchVal) => {
    let filters = undefined;
    if (searchVal) {
      filters = JSON.stringify([{
        name: 'name',
        value: searchVal
      }]);
    }
    this.props.loadPartners(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.partnerlist.pageSize,
      currentPage: 1,
      filters
    });
  }
  handleAddPartner = () => {
    this.props.showPartnerModal();
  }
  handlePartnershipFilter = (ev) => {
    // searchbar value clear todo
    const { partnerlist, tenantId } = this.props;
    const partnerType = ev.target.value;
    let filters = undefined;
    if (partnerType !== 'all') {
      const filterArray = [{
        name: 'partnerType',
        value: parseInt(partnerType, 10)
      }];
      filters = JSON.stringify(filterArray);
    }
    this.props.loadPartners(null, {
      tenantId,
      filters,
      pageSize: partnerlist.pageSize,
      currentPage: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const { partnershipTypes, partnerlist, loading } = this.props;
    this.dataSource.remotes = partnerlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <SearchBar placeholder="搜索合作伙伴" onInputSearch={this.handleSearch} />
            <a className="hidden-xs" role="button">高级搜索</a>
          </div>
          <RadioGroup onChange={this.handlePartnershipFilter} defaultValue="all">
            <RadioButton value="all">全部</RadioButton>
            {
              partnershipTypes.map(
                pst =>
                  <RadioButton value={pst.key} key={pst.key}>
                  {pst.name}({pst.count})
                  </RadioButton>
              )
            }
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <Button type="primary" onClick={this.handleAddPartner}>
              <Icon type="plus-circle-o" /><span>添加合作伙伴</span>
            </Button>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">清除选择</Button>
          </div>
          <PartnerModal />
        </div>
      </div>
    );
  }
}
