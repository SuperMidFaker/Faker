import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Row, Tooltip, Icon, Col, Layout } from 'antd';
import { MiniArea, MiniBar, MiniProgress, yuan, Field } from 'client/components/Charts';
import moment from 'moment';
import numeral from 'numeral';
import QueueAnim from 'rc-queue-anim';
import ChartCard from 'client/components/ChartCard';
import Trend from 'client/components/Trend';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class BSSDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const topColResponsiveProps = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 6,
      style: { marginBottom: 24 },
    };
    const visitData = [];
    const beginDay = new Date().getTime();
    for (let i = 0; i < 20; i += 1) {
      visitData.push({
        x: moment(new Date(beginDay + (1000 * 60 * 60 * 24 * i))).format('YYYY-MM-DD'),
        y: Math.floor(Math.random() * 100) + 10,
      });
    }
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
        </PageHeader>
        <Content className="page-content" key="main">
          <Row gutter={24}>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title="总销售额"
                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                total={yuan(126560)}
                footer={<Field label="日均销售额" value={`￥${numeral(12423).format('0,0')}`} />}
                contentHeight={46}
              >
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span>
                周同比
                <Trend flag="up" >12%</Trend>
                  </span>
                  <span style={{ marginLeft: 16 }}>
                日环比
                <Trend flag="down" >11%</Trend>
                  </span>
                </div>
              </ChartCard>
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title="访问量"
                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                total={numeral(8846).format('0,0')}
                footer={<Field label="日访问量" value={numeral(1234).format('0,0')} />}
                contentHeight={46} canvas
              >
                <MiniArea
                  color="#975FE4"
                  height={46}
                  data={visitData}
                />
              </ChartCard>
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title="支付笔数"
                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                total={numeral(6560).format('0,0')}
                footer={<Field label="转化率" value="60%" />}
                contentHeight={46} canvas
              >
                <MiniBar
                  height={46}
                  data={visitData}
                />
              </ChartCard>
            </Col>
            <Col {...topColResponsiveProps}>
              <ChartCard
                bordered={false}
                title="运营活动效果"
                action={<Tooltip title="指标说明"><Icon type="info-circle-o" /></Tooltip>}
                total="78%"
                footer={
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <span>
                  周同比
                  <Trend flag="up" >12%</Trend>
                    </span>
                    <span style={{ marginLeft: 16 }}>
                  日环比
                  <Trend flag="down" >11%</Trend>
                    </span>
                  </div>
            }
                contentHeight={46}
              >
                <MiniProgress percent={78} strokeWidth={8} target={80} color="#13C2C2" />
              </ChartCard>
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
