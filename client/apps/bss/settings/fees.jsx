import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Card, List, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderTypeModal, loadOrderTypes, removeOrderType } from 'common/reducers/sofOrderPref';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
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
export default class Fees extends Component {
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
  handleCreate = () => {
    this.props.toggleOrderTypeModal(true, {});
  }
  handleConfig = (type) => {
    this.props.toggleOrderTypeModal(true, type);
  }
  handleTypeDel = (type) => {
    this.props.removeOrderType(type.id).then((result) => {
      if (!result.error) {
        const { orderTypeList } = this.props;
        this.props.loadOrderTypes({
          pageSize: orderTypeList.pageSize,
          current: orderTypeList.current,
        });
      }
    });
  }
  handleModalCancel = () => {
    const { orderTypeList, reload } = this.props;
    if (reload) {
      this.props.loadOrderTypes({
        pageSize: orderTypeList.pageSize,
        current: orderTypeList.current,
      });
    }
    this.props.toggleOrderTypeModal(false, {});
  }
  handlePageLoad = (current, pageSize) => {
    this.props.loadOrderTypes({
      pageSize,
      current,
    });
  }
  render() {
    const { orderTypeList } = this.props;
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
            <SettingMenu currentKey="fees" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('fees')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
          </PageHeader>
          <Content className="page-content">
            <Card extra={<Button type="primary" ghost icon="plus-circle-o" onClick={this.handleCreate}>添加订单类型</Button>} bodyStyle={{ padding: 16 }} >
              <List
                loading={orderTypeList.loading}
                pagination={{
                  pageSize: orderTypeList.pageSize,
                  current: orderTypeList.current,
                  total: orderTypeList.totalCount,
                  onChange: this.handlePageLoad,
                }}
                dataSource={orderTypeList.data}
                renderItem={type => (
                  <List.Item
                    key={type.id}
                    actions={[<RowAction row={type} key="config" onClick={this.handleConfig} icon="setting" label={this.msg('config')} />,
                      <RowAction danger row={type} confirm="确认删除?" key="del" onConfirm={this.handleTypeDel} icon="delete" />,
                    ]}
                  >
                    <List.Item.Meta title={type.name} />
                  </List.Item>
                  )}
              />
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
