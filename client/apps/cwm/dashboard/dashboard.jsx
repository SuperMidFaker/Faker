import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Row, Select, Col, Layout, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import StatsCard from './card/statsCard';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  render() {
    const { whses, defaultWhse } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                {
                  whses.map(warehouse => (<Option key={warehouse.code} value={warehouse.code}>{warehouse.name}</Option>))
                }
              </Select>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('dashboard')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24}>
              <StatsCard />
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
