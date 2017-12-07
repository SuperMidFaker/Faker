import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Icon, message, Table } from 'antd';
import NavLink from 'client/components/NavLink';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadConflictItems, deleteItems, setItemStatus, setCompareVisible, setNominatedVisible, setStandardItem } from 'common/reducers/scvClassification';
import { TRADE_ITEM_STATUS } from 'common/constants';
import RowUpdater from 'client/components/rowUpdater';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    listFilter: state.scvClassification.listFilter,
    conflictItemlist: state.scvClassification.conflictItemlist,
    visibleAddItemModal: state.scvClassification.visibleAddItemModal,
    tradeItemsLoading: state.scvClassification.tradeItemsLoading,
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cmsTradeitem.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  { loadConflictItems, deleteItems, setItemStatus, setCompareVisible, setNominatedVisible, setStandardItem }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ConflictList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    conflictItemlist: PropTypes.object.isRequired,
    visibleAddItemModal: PropTypes.bool,
    listFilter: PropTypes.object.isRequired,
    tradeItemsLoading: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      pagination: {
        current: 1,
        total: 0,
        pageSize: 20,
        showSizeChanger: true,
        onChange: this.handlePageChange,
      },
      dataSource: [],
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.conflictItemlist !== this.props.conflictItemlist) {
      this.setState({
        dataSource: nextProps.conflictItemlist.data,
        pagination: { ...this.state.pagination, total: nextProps.conflictItemlist.totalCount },
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('copProductNo'),
    dataIndex: 'cop_product_no',
    fixed: 'left',
    width: 200,
  }, {
    title: this.msg('contributed'),
    dataIndex: 'contribute_tenant_name',
    width: 180,
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 180,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: this.msg('gModel'),
    dataIndex: 'g_model',
    width: 300,
  }, {
    title: this.msg('element'),
    dataIndex: 'element',
    width: 400,
  }, {
    title: this.msg('gUnit1'),
    dataIndex: 'g_unit_1',
    width: 120,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('gUnit2'),
    dataIndex: 'g_unit_2',
    width: 120,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('gUnit3'),
    dataIndex: 'g_unit_3',
    width: 120,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('unit1'),
    dataIndex: 'unit_1',
    width: 130,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('unit2'),
    dataIndex: 'unit_2',
    width: 130,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('fixedQty'),
    dataIndex: 'fixed_qty',
    width: 120,
  }, {
    title: this.msg('fixedUnit'),
    dataIndex: 'fixed_unit',
    width: 130,
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text;
    },
  }, {
    title: this.msg('origCountry'),
    dataIndex: 'origin_country',
    width: 120,
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text;
    },
  }, {
    title: this.msg('unitNetWt'),
    dataIndex: 'unit_net_wt',
    width: 120,
  }, {
    title: this.msg('customsControl'),
    dataIndex: 'customs_control',
    width: 140,
  }, {
    title: this.msg('inspQuarantine'),
    dataIndex: 'inspection_quarantine',
    width: 140,
  }, {
    title: this.msg('unitPrice'),
    dataIndex: 'unit_price',
    width: 120,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 120,
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text;
    },
  }, {
    title: this.msg('preClassifyNo'),
    dataIndex: 'pre_classify_no',
    width: 120,
  }, {
    title: this.msg('preClassifyStartDate'),
    dataIndex: 'pre_classify_start_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_start_date) {
        return moment(record.pre_classify_start_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: this.msg('preClassifyEndDate'),
    dataIndex: 'pre_classify_end_date ',
    width: 180,
    render: (o, record) => {
      if (record.pre_classify_end_date) {
        return moment(record.pre_classify_end_date).format('YYYY-MM-DD');
      } else {
        return '--';
      }
    },
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  handlePageChange = (current, pageSize) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
        pageSize,
      },
    });
    this.handleItemListLoad(current);
  }
  handleItemListLoad = (currentPage, filter, search) => {
    const { tenantId, listFilter, conflictItemlist: { searchText } } = this.props;
    this.props.loadConflictItems({
      tenantId,
      filter: JSON.stringify(filter || listFilter),
      searchText: search !== undefined ? search : searchText,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleItemPass = (row) => {
    this.props.setItemStatus({
      ids: [row.id],
      status: TRADE_ITEM_STATUS.classified,
      tenantId: this.props.tenantId,
      conflicted: true }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.success('归类通过');
          this.handleItemListLoad();
        }
      });
  }
  handleItemRefused = (row) => {
    this.props.setItemStatus({
      ids: [row.id],
      status: TRADE_ITEM_STATUS.unclassified,
      tenantId: this.props.tenantId,
      conflicted: true }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.warning('归类拒绝');
          this.handleItemListLoad();
        }
      });
  }
  handleSetStandard = (row) => {
    this.props.setStandardItem({
      standardId: row.id,
      copProductNo: row.cop_product_no,
      tenantId: this.props.tenantId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleItemListLoad();
      }
    });
  }
  render() {
    const columns = [...this.columns];
    columns.push({
      title: this.msg('opColumn'),
      width: 150,
      fixed: 'right',
      render: (o, record) => {
        if (!record.setStandard && record.contribute_tenant_id === this.props.tenantId) {
          if (record.status === TRADE_ITEM_STATUS.pending) {
            return (
              <span>
                <RowUpdater onClick={this.handleItemPass} label={<span><Icon type="check-circle-o" /> {this.msg('pass')}</span>} row={record} />
                <span className="ant-divider" />
                <RowUpdater onClick={this.handleItemRefused} label={<span><Icon type="close-circle-o" /> {this.msg('refuse')}</span>} row={record} />
                <span className="ant-divider" />
                <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
                  <Icon type="edit" />
                </NavLink>
              </span>
            );
          } else {
            return (
              <span>
                <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
                  <Icon type="edit" /> {this.msg('modify')}
                </NavLink>
              </span>
            );
          }
        } else if (!record.setStandard && record.contribute_tenant_id !== this.props.tenantId && record.status === TRADE_ITEM_STATUS.pending) {
          return (
            <span>
              <RowUpdater onClick={this.handleItemPass} label={<span><Icon type="check-circle-o" /> {this.msg('pass')}</span>} row={record} />
              <span className="ant-divider" />
              <RowUpdater onClick={this.handleItemRefused} label={<span><Icon type="close-circle-o" /> {this.msg('refuse')}</span>} row={record} />
            </span>
          );
        } else if (record.setStandard && record.contribute_tenant_id !== this.props.tenantId) {
          return (
            <RowUpdater onClick={this.handleSetStandard} label={<span><Icon type="star-o" /> {this.msg('setStandard')}</span>} row={record} />
          );
        } else if (record.setStandard && record.contribute_tenant_id === this.props.tenantId) {
          return (
            <span>
              <RowUpdater onClick={this.handleSetStandard} label={<span><Icon type="star-o" /> {this.msg('setStandard')}</span>} row={record} />
              <span className="ant-divider" />
              <NavLink to={`/scv/products/tradeitem/edit/${record.id}`}>
                <Icon type="edit" /> {this.msg('modify')}
              </NavLink>
            </span>
          );
        }
      },
    });
    return (
      <Table rowKey={record => record.id} columns={columns} dataSource={this.state.dataSource} pagination={this.state.pagination} scroll={{ x: 3800 }} />
    );
  }
}
