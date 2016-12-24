import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Radio, Select, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import withPrivilege from 'client/common/decorators/withPrivilege';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { loadQuoteModel }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class TradeItemList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadQuoteModel: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    qtModelShow: false,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }

  msg = key => formatMsg(this.props.intl, key);
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('tradeItemManagement')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleRadioChange}>
            <RadioButton value="unclassified">{this.msg('filterUnclassified')}</RadioButton>
            <RadioButton value="pending">{this.msg('filterPending')}</RadioButton>
            <RadioButton value="classified">{this.msg('filterClassified')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <div className="toolbar-right">
                <Select
                  showSearch
                  style={{ width: 300 }}
                  placeholder="选择客户"
                  optionFilterProp="children"
                >
                  <Option value="jack">山特维克矿山工程机械贸易(上海)有限公司</Option>
                  <Option value="lucy">永恒力叉车(上海)有限公司</Option>
                  <Option value="tom">阿特拉斯.科普柯(上海)贸易有限公司</Option>
                </Select>
              </div>
              <Button type="primary" icon="plus" onClick={this.handleCreateNew}>
                导入
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={this.dataSource} scroll={{ x: 1400 }} />
            </div>
          </div>
        </div>
      </QueueAnim>
    );
  }
}
