import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Layout, Button } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import { getPurchaseOrder, updatePurchaseOrder } from 'common/reducers/sofPurchaseOrders';
import HeadCard from './card/headCard';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    purchaseOrder: state.sofPurchaseOrders.purchaseOrder,
  }),
  { getPurchaseOrder, updatePurchaseOrder }
)
@connectNav({
  depth: 3,
  moduleName: 'scof',
})
@Form.create()
export default class EditPurchaseOrder extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.getPurchaseOrder(this.props.params.poNo);
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.updatePurchaseOrder(this.props.purchaseOrder.id, values).then((result) => {
          if (!result.error) {
            this.context.router.goBack();
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
      <div>
        <PageHeader breadcrumb={[this.msg('purchaseOrders'), this.props.params.poNo]}>
          <PageHeader.Actions>
            {<Button type="ghost" onClick={this.handleCancel}>
              {this.gmsg('cancel')}
            </Button>}
            {<Button type="primary" icon="save" onClick={this.handleSave}>
              {this.gmsg('save')}
            </Button>}
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Form layout="vertical">
            <HeadCard
              form={form}
            />
          </Form>
        </Content>
      </div>
    );
  }
}
