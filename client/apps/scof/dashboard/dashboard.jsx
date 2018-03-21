import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { DatePicker, Row, Col, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { connect } from 'react-redux';
import { loadStatsCard } from 'common/reducers/sofDashboard';
import OrderStatsCard from './card/orderStatsCard';
// import InvoiceStatsCard from './card/invoiceStatsCard';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { RangePicker } = DatePicker;

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@connect(
  () => ({

  }),
  { loadStatsCard }
)
export default class SOFDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
  }
  componentWillMount() {
    const { startDate } = this.state;
    this.props.loadStatsCard(moment(startDate).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD'));
  }
  onDateChange = (data, dataString) => {
    this.props.loadStatsCard(dataString[0], dataString[1]);
    this.setState({
      startDate: dataString[0],
      endDate: dataString[1],
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { startDate, endDate } = this.state;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader title={this.msg('dashboard')}>
          <PageHeader.Actions>
            <RangePicker
              onChange={this.onDateChange}
              defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]}
              ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
              allowClear={false}
            />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <Row gutter={16}>
            <Col sm={24}>
              <OrderStatsCard startDate={startDate} endDate={endDate} />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
