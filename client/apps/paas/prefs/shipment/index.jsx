import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Collapse, List, Layout, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderTypeModal, loadOrderTypes, removeOrderType } from 'common/reducers/sofOrderPref';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import HubSiderMenu from '../../menu';
import TypeForm from './forms/typeForm';
import FieldsForm from './forms/fieldsForm';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Panel } = Collapse;
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
  moduleName: 'scof',
})
export default class OrderParams extends Component {
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
    const { visible, modalOrderType, orderTypeList } = this.props;
    const menus = [
      {
        key: 'orderTypes',
        menu: this.msg('shipmentTypes'),
      },
      {
        key: 'exceptionCode',
        menu: this.msg('exceptionCode'),
      },
    ];
    return (
      <Layout>
        <HubSiderMenu currentKey="shipmentParams" openKey="paramPrefs" />
        <Layout>
          <PageHeader menus={menus} onTabChange={this.handleTabChange} />
          <Content className="page-content layout-fixed-width">
            <Card extra={<Button type="primary" icon="plus-circle-o" onClick={this.handleCreate}>{this.gmsg('add')}</Button>} bodyStyle={{ padding: 0 }} >
              <List
                loading={orderTypeList.loading}
                pagination={{
                  pageSize: orderTypeList.pageSize,
                  current: orderTypeList.current,
                  total: orderTypeList.totalCount,
                  onChange: this.handlePageLoad,
                  size: 'small',
                  hideOnSinglePage: true,
                }}
                dataSource={orderTypeList.data}
                renderItem={type => (
                  <List.Item
                    key={type.id}
                    actions={[<RowAction row={type} key="config" onClick={this.handleConfig} icon="setting" tooltip={this.gmsg('config')} />,
                      <RowAction danger row={type} confirm={this.gmsg('deleteConfirm')} key="del" onConfirm={this.handleTypeDel} icon="delete" />,
                    ]}
                  >
                    <List.Item.Meta title={type.name} />
                  </List.Item>
                  )}
              />
            </Card>
          </Content>
          <Modal
            maskClosable={false}
            title={this.msg('orderConfig')}
            width="100%"
            visible={visible}
            onCancel={this.handleModalCancel}
            footer={null}
            wrapClassName="fullscreen-modal"
            destroyOnClose
          >
            <Content className="layout-fixed-width">
              <Card bodyStyle={{ padding: 0 }}>
                <Collapse accordion bordered={false} defaultActiveKey={['type']}>
                  <Panel header="货运类型" key="type">
                    <TypeForm />
                  </Panel>
                  <Panel header="扩展字段" key="fields" disabled={!modalOrderType.id}>
                    <FieldsForm />
                  </Panel>
                </Collapse>
              </Card>
            </Content>
          </Modal>
        </Layout>
      </Layout>
    );
  }
}
