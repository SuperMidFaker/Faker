import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Card, Col, Layout, Row, Select, Tooltip } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CMSDashboard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);

  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <div className="toolbar-right" />
          <span>{this.msg('dashboardTitle')}</span>
          <div className="top-bar-tools">
            <Select defaultValue="today"
              style={{ width: 160 }}
              showSearch={false}
              size="large"
            >
              <OptGroup label="常用视图">
                <Option value="today">今天</Option>
                <Option value="yesterday">昨天</Option>
              </OptGroup>
            </Select>
            <Tooltip title="看板设置">
              <Button icon="setting" size="large" />
            </Tooltip>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <Row gutter={16}>
            <Col sm={24} lg={24}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={24} lg={12}>
              <Card>
                hello
              </Card>
            </Col>
            <Col sm={24} lg={12}>
              <Card>
                hello
              </Card>
            </Col>
          </Row>
        </Content>
      </QueueAnim>
    );
  }
}
