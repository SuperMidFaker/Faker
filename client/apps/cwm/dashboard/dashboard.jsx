import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { DatePicker, Row, Col, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import WhseSelect from '../common/whseSelect';
import InboundStatsCard from './card/inboundStatsCard';
import OutboundStatsCard from './card/outboundStatsCard';
import BondedStatsCard from './card/bondedStatsCard';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadStatsCard }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
  }
  componentWillMount() {
    const { defaultWhse } = this.props;
    const { startDate, endDate } = this.state;
    this.props.loadStatsCard(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), defaultWhse.code);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      const { defaultWhse } = nextProps;
      const { startDate, endDate } = this.state;
      this.props.loadStatsCard(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'), defaultWhse.code);
    }
  }
  onDateChange = (data, dataString) => {
    const { defaultWhse } = this.props;
    this.setState({
      startDate: dataString[0],
      endDate: dataString[1],
    });
    this.props.loadStatsCard(dataString[0], dataString[1], defaultWhse.code);
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { startDate, endDate } = this.state;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader
          breadcrumb={[
            <WhseSelect />,
            this.msg('dashboard'),
          ]}
        >
          <PageHeader.Actions>
            <RangePicker
              onChange={this.onDateChange}
              defaultValue={[moment(startDate, 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]}
              value={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
              ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
              allowClear={false}
            />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <Row gutter={16}>
            <Col sm={24}>
              <InboundStatsCard startDate={startDate} endDate={endDate} />
            </Col>
            <Col sm={24}>
              <OutboundStatsCard startDate={startDate} endDate={endDate} />
            </Col>
            <Col sm={24}>
              <BondedStatsCard startDate={startDate} endDate={endDate} />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
