import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { openAddWarehouseModal } from 'common/reducers/scvInventory';
import SearchBar from 'client/components/search-bar';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import AddWarehouseModal from './addWarehouseModal';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    reload: state.scvInventory.reloadWarehouse,
    inboundlist: state.scvInventory.warehouseList,
  }),
  { openAddWarehouseModal }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMWarehouseList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('warehouseName'),
    dataIndex: 'wh_name',
    width: 200,
  }, {
    title: this.msg('warehouseCode'),
    width: 160,
    dataIndex: 'wh_code',
  }, {
    title: this.msg('warehouseType'),
    dataIndex: 'wh_type',
    width: 160,
  }, {
    title: this.msg('warehouseOperator'),
    dataIndex: 'wh_operator',
    width: 300,
  }, {
    title: this.msg('isBonded'),
    width: 120,
    dataIndex: 'is_bonded',
  }, {
    title: this.msg('warehouseLocation'),
    dataIndex: 'wh_location',
  }, {
    title: this.msg('wmsIntegration'),
    width: 120,
    dataIndex: 'wh_integration',
  }, {
    title: this.msg('opColumn'),
    width: 160,
  }]
  handleAddWarehouse = () => {
    this.props.openAddWarehouseModal();
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('inventoryWarehouse')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="toolbar-right">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <Button type="primary" icon="plus" onClick={this.handleAddWarehouse}>
                {this.msg('addWarehouse')}
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id" scroll={{ x: 1200 }} />
            </div>
          </div>
          <AddWarehouseModal />
        </Content>
      </QueueAnim>
    );
  }
}
