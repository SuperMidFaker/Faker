import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Breadcrumb, DatePicker, Row, Select, Col, Layout, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import InboundStatsCard from './card/inboundStatsCard';
import OutboundStatsCard from './card/outboundStatsCard';
import BondedStatsCard from './card/bondedStatsCard';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { switchDefaultWhse, loadStatsCard }
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
    startDate: new Date(),
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
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { whses, defaultWhse } = this.props;
    const { startDate, endDate } = this.state;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {
                  whses.map(warehouse =>
                    (<Option key={warehouse.code} value={warehouse.code}>{warehouse.name}</Option>))
                  }
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('dashboard')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <RangePicker
              onChange={this.onDateChange}
              defaultValue={[moment(new Date(), 'YYYY-MM-DD'), moment(new Date(), 'YYYY-MM-DD')]}
              value={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
              ranges={{ Today: [moment(), moment()], 'This Month': [moment().startOf('month'), moment()] }}
              allowClear={false}
            />
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <Row gutter={16}>
            <Col sm={24}>
              <InboundStatsCard />
            </Col>
            <Col sm={24}>
              <OutboundStatsCard />
            </Col>
            <Col sm={24}>
              <BondedStatsCard />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
