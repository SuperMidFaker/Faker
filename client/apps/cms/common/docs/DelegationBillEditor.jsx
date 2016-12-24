import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Menu, Radio, Icon } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addEntry, setTabKey, openMergeSplitModal } from 'common/reducers/cmsDeclare';
import BillForm from './forms/BillForm';
import ExtraDock from './modals/extraDock';
import MergeSplitModal from './modals/mergeSplit';
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
  { addEntry, setTabKey, openMergeSplitModal }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class DelegationBillEditor extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    entries: PropTypes.array.isRequired,
    addEntry: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  state = {
    activeKey: 'bill',
    visible: false,
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.entries && nextProps.entries.length !== 0 &&
      nextProps.entries !== this.props.entries &&
      nextProps.entries[0].head.agent_code
    ) {
      this.setState({
        activeKey: `entry${nextProps.entries.length - 1}`,
      });
    } else {
      this.setState({ activeKey: 'bill' });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEntryMenuClick = (ev) => {
    if (ev.key === 'add') {
      this.props.addEntry();
    } else if (ev.key === 'generate') {
      this.props.openMergeSplitModal();
    }
  }
  handleTabChange = (activeKey) => {
    this.setState({ activeKey });
  }
  handleGenerateEntry = () => {
    this.props.openMergeSplitModal();
  }
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
              报关清单 <Icon type="down" />
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleDelegationFilter}>
            <RadioButton value="all"><Icon type="menu-unfold" /></RadioButton>
            <RadioButton value="accept"><Icon type="menu-fold" /></RadioButton>
          </RadioGroup>
        </header>
        <div className="top-bar-tools">
          <Dropdown overlay={menu}>
            <Button>
              <Icon type="setting" /> <Icon type="down" />
            </Button>
          </Dropdown>
          <span />
          {!this.props.readonly &&
            <Button type="primary" icon="addfile" onClick={this.handleGenerateEntry}>{this.msg('generateEntry')}</Button>
          }
        </div>
        <div className="main-content">
          <div className="page-body tabbed fixed-height">
            <BillForm readonly={readonly} ietype={ietype} />
          </div>
        </div>
        <MergeSplitModal />
        <ExtraDock visible={this.state.visible} />
      </QueueAnim>
    );
  }
}
