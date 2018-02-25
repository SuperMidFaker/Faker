import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderTypeModal, loadOrderTypes, removeOrderType } from 'common/reducers/sofOrderPref';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import SettingMenu from './menu';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    orderTypeList: state.sofOrderPref.orderTypeList,
    visible: state.sofOrderPref.orderTypeModal.visible,
    modalOrderType: state.sofOrderPref.orderTypeModal.orderType,
    reload: state.sofOrderPref.typeListReload,
  }),
  { toggleOrderTypeModal, loadOrderTypes, removeOrderType }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class ExchangeRates extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    const { orderTypeList } = this.props;
    this.props.loadOrderTypes({
      pageSize: orderTypeList.pageSize,
      current: orderTypeList.current,
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  itemsColumns = [{
    title: '币制',
    dataIndex: 'src_currency',
    width: 150,
  }, {
    title: '本币',
    dataIndex: 'base_currency',
    width: 150,
  }, {
    title: '汇率',
    dataIndex: 'exchange_rate',
    width: 150,
  }, {
    title: '日期',
    dataIndex: 'exchange_date',
    width: 100,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} tooltip="删除" row={record} />,
  }]
  handleCreate = () => {
    this.props.toggleOrderTypeModal(true, {});
  }

  handlePageLoad = (current, pageSize) => {
    this.props.loadOrderTypes({
      pageSize,
      current,
    });
  }
  render() {
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="exchangerates" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateFeeItem}>
                {this.msg('添加汇率')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            <DataTable
              columns={this.itemsColumns}
              rowKey="id"
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
