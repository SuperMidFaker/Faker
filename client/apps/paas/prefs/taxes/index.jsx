import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderTypeModal, loadOrderTypes, removeOrderType } from 'common/reducers/sofOrderPref';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import HubSiderMenu from '../../menu';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;

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
export default class TaxRates extends Component {
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
    title: '税种',
    dataIndex: 'tax_name',
    width: 200,
  }, {
    title: '税率%',
    dataIndex: 'tax_rate',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 90,
    render: (o, record) => <RowAction onClick={this.handleEdit} icon="edit" row={record} />,
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
    const mockData = [{
      tax_name: '增值税(专用发票)',
      tax_rate: '11%',
    }, {
      tax_name: '增值税(普通发票)',
      tax_rate: '6%',
    }];
    return (
      <Layout>
        <HubSiderMenu currentKey="taxes" openKey="paramPrefs" />
        <Layout>
          <PageHeader>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateFeeItem}>
                {this.msg('添加税率')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            <DataTable
              columns={this.itemsColumns}
              dataSource={mockData}
              rowKey="id"
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
