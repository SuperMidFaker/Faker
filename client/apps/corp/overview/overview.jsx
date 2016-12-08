import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Row, Col } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 1,
  moduleName: 'corp',
})
export default class CorpOverview extends React.Component {
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
        <div className="main-content" key="main">
          <div className="page-body card-wrapper">
            <Row gutter={16}>
              <Col span={24}>
                <Card title="帐户使用">
                  <ul className="statistics-columns">
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>开通用户数</h6>
                        <p className="data-num lg">12</p>
                      </div>
                    </li>
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>已设置组织部门</h6>
                        <p className="data-num lg">6</p>
                      </div>
                    </li>
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>连接客户数</h6>
                        <p className="data-num lg">18</p>
                      </div>
                    </li>
                    <li className="col-6">
                      <div className="statistics-cell">
                        <h6>连接服务商数</h6>
                        <p className="data-num lg">23</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
