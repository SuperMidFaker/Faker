import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Dropdown, Menu, Icon, Progress } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addEntry, setTabKey, openMergeSplitModal } from 'common/reducers/cmsDeclare';
import BillForm from './forms/billForm';
import EntryForm from './forms/entryForm';
import MergeSplitModal from './modals/mergeSplit';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './entryBill.less';

const formatMsg = format(messages);

const TabPane = Tabs.TabPane;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
    entries: state.cmsDeclare.entries,
    activeKey: state.cmsDeclare.activeTabKey,
  }),
  { addEntry, setTabKey, openMergeSplitModal }
)
@connectNav({
  depth: 3,
  text: '返回',
  moduleName: 'clearance',
  lifecycle: 'componentWillReceiveProps',
  until: true,
})
export default class EntryBillForm extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    aspect: PropTypes.number.isRequired,
    readonly: PropTypes.bool,
    entries: PropTypes.array.isRequired,
    activeKey: PropTypes.string.isRequired,
    addEntry: PropTypes.func.isRequired,
    setTabKey: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  state = {
    activeKey: '',
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
    this.props.setTabKey(activeKey);
  }
  renderTabButton() {
    const PopMenu = (
      <Menu onClick={this.handleEntryMenuClick}>
        <MenuItem key="generate">{this.msg('generateEntry')}</MenuItem>
        <MenuItem key="add">{this.msg('addEntry')}</MenuItem>
      </Menu>
    );
    return (
      <DropdownButton overlay={PopMenu}>
        <Icon type="plus-square" />{this.msg('newDeclaration')}
      </DropdownButton>
    );
  }
  render() {
    const { readonly, ietype, entries, activeKey } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools" style={{ width: '20%' }}><Progress percent={30} /></div>
          <span>清单编号 {this.props.params.billno}</span>
        </header>
        <div className="main-content">
          <div className="page-body tabbed fixed-height">
            <Tabs tabBarExtraContent={!readonly && this.renderTabButton()} activeKey={activeKey}
              onChange={this.handleTabChange}
            >
              <TabPane tab={<span><Icon type="book" />{this.msg('declareBill')}</span>} key="bill">
                <BillForm readonly={readonly} ietype={ietype} />
              </TabPane>
              {
                entries.map((entry, idx) => (
                  <TabPane tab={
                    <span><Icon type="file-text" />{`${this.msg('declareEntry')}-${idx + 1}`}</span>
                    } key={`entry${idx}`}
                  >
                    <EntryForm readonly={readonly} ietype={ietype} entry={entry}
                      totalCount={entries.length} index={idx}
                    />
                  </TabPane>
                ))
              }
            </Tabs>
          </div>
          <MergeSplitModal />
        </div>
      </QueueAnim>
    );
  }
}
