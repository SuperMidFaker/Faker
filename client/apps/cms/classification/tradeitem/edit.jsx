import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Button, Row, Col, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import SiderForm from './forms/siderForm';
import { loadTradeItem, itemEditedSave } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ dispatch, params }) {
  const promises = [];
  const itemId = parseInt(params.id, 10);
  promises.push(dispatch(loadTradeItem(itemId)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    itemData: state.cmsTradeitem.itemData,
    tenantId: state.account.tenantId,
  }),
  { itemEditedSave }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class EditTradeItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    itemData: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const value = this.props.form.getFieldsValue();
        const specialMark = value.specialMark.join('/');
        const item = { ...this.props.itemData, ...value, special_mark: specialMark };
        this.props.itemEditedSave({ item }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.context.router.push('/clearance/classification/tradeitem');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('classification')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('tradeItemMaster')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('editItem')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <BasicForm action="edit" form={form} />
              </Col>
              <Col sm={24} md={8}>
                <SiderForm form={form} />
              </Col>
            </Row>
          </Form>
        </Content>
      </QueueAnim>
    );
  }
}
