import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, DatePicker, Row, Col, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import OrderStatsCard from './card/orderStatsCard';
import InvoiceStatsCard from './card/invoiceStatsCard';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { RangePicker } = DatePicker;

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class SOFDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('dashboard')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <RangePicker
              onChange={this.onDateChange}
              defaultValue={[moment(new Date(), 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]}
              ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
              allowClear={false}
            />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <Row gutter={16}>
            <Col sm={24}>
              <OrderStatsCard />
            </Col>
            <Col sm={24}>
              <InvoiceStatsCard />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
