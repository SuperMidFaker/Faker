import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Radio, Button, Popconfirm, message, Layout, Breadcrumb } from 'antd';
import QueueAnim from 'rc-queue-anim';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'client/components/NavLink';
import TrimSpan from 'client/components/trimSpan';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadTable, delTariffById, updateTariffValid, loadFormParams,
  showCreateTariffModal, delTariffByQuoteNo, createTariffByNextVersion } from 'common/reducers/transportTariff';
import { TARIFF_KINDS, TARIFF_METER_METHODS, GOODS_TYPES, TARIFF_PARTNER_PERMISSION } from 'common/constants';
import CreateTariffModal from './modals/createTariffModal';
import SearchBar from 'client/components/SearchBar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';

const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const { Header, Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, location }) {
  const { kind, status } = location.query;
  let filters = state.transportTariff.filters;
  if (kind || status) {
    filters = { ...state.transportTariff.filters, kind: [kind], status: [status] };
  } else {
    filters = { ...state.transportTariff.filters, kind: ['all'], status: ['current'] };
  }
  dispatch(loadFormParams(state.account.tenantId));
  return dispatch(loadTable({
    tenantId: state.account.tenantId,
    filters: JSON.stringify(filters),
    pageSize: state.transportTariff.tarifflist.pageSize,
    currentPage: state.transportTariff.tarifflist.current,
    sortField: state.transportTariff.sortField,
    sortOrder: state.transportTariff.sortOrder,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tarifflist: state.transportTariff.tarifflist,
    filters: state.transportTariff.filters,
    loading: state.transportTariff.loading,
    formParams: state.transportTariff.formParams,
  }),
  {
    loadTable, delTariffById, updateTariffValid, showCreateTariffModal, delTariffByQuoteNo, createTariffByNextVersion,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'tariff' })
export default class TariffList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    tarifflist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired,
    delTariffById: PropTypes.func.isRequired,
    updateTariffValid: PropTypes.func.isRequired,
    showCreateTariffModal: PropTypes.func.isRequired,
    delTariffByQuoteNo: PropTypes.func.isRequired,
    createTariffByNextVersion: PropTypes.func.isRequired,
    formParams: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    kind: 'all',
    status: 'current',
  }
  componentWillMount() {
    this.loadTableByQuery(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location.query !== nextProps.location.query) {
      this.loadTableByQuery(nextProps);
    }
  }
  loadTableByQuery = (props) => {
    const { kind, status } = props.location.query;
    if (kind || status) {
      this.setState({ kind, status });
      const filters = { ...this.props.filters, kind: [kind], status: [status] };
      this.handleTableLoad(filters, 1);
    }
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadTable(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        filters: this.props.filters,
      };
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.tarifflist,
  })

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleTableLoad = (filters, current, sortField, sortOrder) => {
    this.props.loadTable({
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.tarifflist.pageSize,
      currentPage: current || this.props.tarifflist.current,
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleShowCreateTariffModal = () => {
    this.props.showCreateTariffModal(true);
  }
  handleDelByQuoteNo = (quoteNo) => {
    this.props.delTariffByQuoteNo(quoteNo, this.props.tenantId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleDel = (row) => {
    this.props.delTariffById(row._id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
  handleChangeValid = (tariffId, valid) => {
    this.props.updateTariffValid(tariffId, valid).then(() => {
      this.handleTableLoad();
    });
  }
  handleEdit = (quoteNo, version) => {
    this.props.createTariffByNextVersion({
      quoteNo,
      version,
      tenantId: this.props.tenantId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.context.router.push({
          pathname: `/transport/billing/tariff/edit/${quoteNo}/${version}`,
        });
      }
    });
  }
  handleSearch = (searchVal) => {
    let filters;
    if (searchVal) {
      filters = { ...this.props.filters, name: [searchVal] };
    } else {
      filters = { ...this.props.filters, name: [] };
    }
    this.handleTableLoad(filters, 1);
  }
  handleKindChange = (e) => {
    const value = e.target.value;
    const location = this.props.location;
    this.context.router.push({
      pathname: location.pathname,
      query: { ...location.query, status: 'current', kind: value },
    });
  }
  handleStatusChange = (e) => {
    const value = e.target.value;
    const location = this.props.location;
    this.context.router.push({
      pathname: location.pathname,
      query: { ...location.query, kind: '', status: value },
    });
  }
  handleShipmtDraftDel(shipmtNo, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.delDraft(shipmtNo).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad(undefined, 1);
      }
    });
  }
  render() {
    const { tarifflist, loading, formParams } = this.props;
    this.dataSource.remotes = tarifflist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let columns = [{
      title: this.msg('quoteNo'),
      dataIndex: 'quoteNo',
      width: 140,
      render: col => <a>{col}</a>,
    }, {
      title: this.msg('partnerName'),
      width: 180,
      render: (o, record) => {
        let partnerName = '';
        if (record.sendTenantId === this.props.tenantId) {
          partnerName = record.recvName || '';
        } else if (record.recvTenantId === this.props.tenantId) {
          partnerName = record.sendName || '';
        }
        return <TrimSpan text={partnerName} />;
      },
    }, {
      title: this.msg('tariffType'),
      width: 90,
      render: (o, record) => {
        let kindIdx = null;
        if (record.sendTenantId === this.props.tenantId) {
          if (record.recvName) {
            kindIdx = 1;
          } else {
            kindIdx = 3;
          }
        } else if (record.recvTenantId === this.props.tenantId) {
          if (record.sendName) {
            kindIdx = 0;
          } else {
            kindIdx = 2;
          }
        }
        if (kindIdx !== null) {
          return TARIFF_KINDS[kindIdx].text;
        } else {
          return '';
        }
      },
    }, {
      title: this.msg('transModeMeterGoodsType'),
      dataIndex: 'transModeCode',
      width: 220,
      render: (col, row) => {
        let text = '';
        const tms = formParams.transModes.find(tm => tm.mode_code === row.transModeCode);
        const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
        const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
        if (tms) text = tms.mode_name;
        if (meter) text = `${text}/${meter.text}`;
        if (goodType) text = `${text}/${goodType.text}`;
        return text;
      },
    }, {
      title: this.msg('tariffStatus'),
      dataIndex: 'valid',
      width: 100,
      render: (col) => {
        if (col) {
          return (
            <span className="mdc-text-green">有效</span>
          );
        } else {
          return (
            <span className="mdc-text-red">无效</span>
          );
        }
      },
    }, {
      title: this.msg('effectiveDate'),
      dataIndex: 'effectiveDate',
      width: 100,
      render: o => moment(o).format('YYYY.MM.DD'),
    }, {
      title: this.msg('version'),
      dataIndex: 'version',
      width: 100,
      render: col => `v.${col}`,
    }, {
      title: this.msg('publisher'),
      dataIndex: 'publisher',
      width: 100,
    }, {
      title: this.msg('publishDate'),
      dataIndex: 'publishDate',
      width: 100,
      render: o => o ? moment(o).format('YYYY.MM.DD') : '',
    }, {
      title: formatContainerMsg(this.props.intl, 'opColumn'),
      width: 160,
      dataIndex: 'OPS_COL',
      render: (o, record) => {
        if (record.createdTenantId === this.props.tenantId || record.createdTenantId !== this.props.tenantId && record.partnerPermission === TARIFF_PARTNER_PERMISSION.editable) {
          if (record.valid) {
            return (
              <span>
                <PrivilegeCover module="transport" feature="tariff" action="edit">
                  <div>
                    <NavLink to={`/transport/billing/tariff/view/${record.quoteNo}/${record.version}`}>
                      查看
                    </NavLink>
                    <span className="ant-divider" />
                    <a onClick={() => this.handleEdit(record.quoteNo, record.version + 1)}>
                      {this.msg('revise')}
                    </a>
                    <span className="ant-divider" />
                    <a onClick={() => this.handleChangeValid(record._id, false)}>{this.msg('disable')}</a>
                  </div>
                </PrivilegeCover>
              </span>
            );
          } else {
            return (
              <span>
                <PrivilegeCover module="transport" feature="tariff" action="edit">
                  <a onClick={() => this.handleChangeValid(record._id, true)}>{this.msg('enable')}</a>
                </PrivilegeCover>
                <span className="ant-divider" />
                <PrivilegeCover module="transport" feature="tariff" action="delete">
                  <Popconfirm title="确认删除?" onConfirm={() => this.handleDelByQuoteNo(record.quoteNo)} >
                    <a >删除</a>
                  </Popconfirm>
                </PrivilegeCover>
                <span className="ant-divider" />
                <NavLink to={`/transport/billing/tariff/view/${record.quoteNo}/${record.version}`}>
                  查看
                </NavLink>
              </span>
            );
          }
        } else {
          return (
            <PrivilegeCover module="transport" feature="tariff" action="view">
              <NavLink to={`/transport/billing/tariff/view/${record.quoteNo}/${record.version}`}>
                查看
              </NavLink>
            </PrivilegeCover>
          );
        }
      },
    }];
    if (this.state.status === 'draft') {
      columns = [{
        title: this.msg('quoteNo'),
        dataIndex: 'quoteNo',
        width: 140,
        render: col => <a>{col}</a>,
      }, {
        title: this.msg('partnerName'),
        width: 180,
        render: (o, record) => {
          let partnerName = '';
          if (record.sendTenantId === this.props.tenantId) {
            partnerName = record.recvName || '';
          } else if (record.recvTenantId === this.props.tenantId) {
            partnerName = record.sendName || '';
          }
          return <TrimSpan text={partnerName} />;
        },
      }, {
        title: this.msg('tariffType'),
        width: 90,
        render: (o, record) => {
          let kindIdx = null;
          if (record.sendTenantId === this.props.tenantId) {
            if (record.recvName) {
              kindIdx = 1;
            } else {
              kindIdx = 3;
            }
          } else if (record.recvTenantId === this.props.tenantId) {
            if (record.sendName) {
              kindIdx = 0;
            } else {
              kindIdx = 2;
            }
          }
          if (kindIdx !== null) {
            return TARIFF_KINDS[kindIdx].text;
          } else {
            return '';
          }
        },
      }, {
        title: this.msg('transModeMeterGoodsType'),
        dataIndex: 'transModeCode',
        width: 220,
        render: (col, row) => {
          let text = '';
          const tms = formParams.transModes.find(tm => tm.mode_code === row.transModeCode);
          const meter = TARIFF_METER_METHODS.find(m => m.value === row.meter);
          const goodType = GOODS_TYPES.find(m => m.value === row.goodsType);
          if (tms) text = tms.mode_name;
          if (meter) text = `${text}/${meter.text}`;
          if (goodType) text = `${text}/${goodType.text}`;
          return text;
        },
      }, {
        title: this.msg('version'),
        dataIndex: 'version',
        width: 80,
        render: col => `v.${col}`,
      }, {
        title: this.msg('reviser'),
        dataIndex: 'reviser',
        width: 100,
      }, {
        title: this.msg('publishDate'),
        dataIndex: 'publishDate',
        width: 100,
        render: o => o ? moment(o).format('YYYY.MM.DD') : '',
      }, {
        title: formatContainerMsg(this.props.intl, 'opColumn'),
        width: 140,
        dataIndex: 'OPS_COL',
        render: (o, record) => {
          if (record.createdTenantId === this.props.tenantId || record.createdTenantId !== this.props.tenantId && record.partnerPermission === TARIFF_PARTNER_PERMISSION.editable) {
            return (
              <span>
                <PrivilegeCover module="transport" feature="tariff" action="edit">
                  <div>
                    <NavLink to={`/transport/billing/tariff/edit/${record.quoteNo}/${record.version}`}>
                        继续修订
                    </NavLink>
                    <span className="ant-divider" />
                    <PrivilegeCover module="transport" feature="tariff" action="delete">
                      <a onClick={() => this.handleDel(record)}>删除</a>
                    </PrivilegeCover>
                  </div>
                </PrivilegeCover>
              </span>
            );
          }
          return '';
        },
      }];
    }
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
    </span>);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('billingCenter')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('transportTariff')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleKindChange} value={this.state.kind} >
            <RadioButton value="all">全部</RadioButton>
            <RadioButton value="sale">销售价</RadioButton>
            <RadioButton value="cost">成本价</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleStatusChange} value={this.state.status} >
            <RadioButton value="draft">草稿箱</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <PrivilegeCover module="transport" feature="tariff" action="create">
              <Button type="primary" icon="plus-circle-o" onClick={this.handleShowCreateTariffModal}>
                {this.msg('tariffCreate')}
              </Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <DataTable toolbarActions={toolbarActions} rowSelection={rowSelection} columns={columns} loading={loading}
            dataSource={this.dataSource}
          />
          <CreateTariffModal />
        </Content>
      </QueueAnim>
    );
  }
}
