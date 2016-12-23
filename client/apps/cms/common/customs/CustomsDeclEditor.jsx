import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Menu, Radio, Icon } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import DeclForm from '../docs/forms/DeclForm';
import ExtraDock from '../docs/modals/extraDock';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    entries: state.cmsDeclare.entries,
  }),
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class CustomsDeclEditor extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  state = {
    visible: false,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleDock = () => {
    this.setState({ visible: true });
  }
  render() {
    const { readonly, ietype } = this.props;
    const menu = (
      <Menu>
        <Menu.Item key="lock"><Icon type="lock" /> 锁定</Menu.Item>
        <Menu.Item key="delete"><Icon type="delete" /> 删除(不可恢复)</Menu.Item>
      </Menu>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              制单
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              报关清单
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              报关单 <Icon type="down" />
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleDelegationFilter}>
            <RadioButton value="all"><Icon type="right-square-o" /></RadioButton>
            <RadioButton value="accept"><Icon type="left-square" /></RadioButton>
          </RadioGroup>
        </header>
        <div className="top-bar-tools">
          <Dropdown overlay={menu}>
            <Button type="ghost">
              <Icon type="setting" /> <Icon type="down" />
            </Button>
          </Dropdown>
        </div>
        <div className="main-content">
          <div className="page-body tabbed fixed-height">
            <DeclForm readonly={readonly} ietype={ietype} />
          </div>
        </div>
        <ExtraDock visible={this.state.visible} />
      </QueueAnim>
    );
  }
}
