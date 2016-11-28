import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Tabs, Icon } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { addEntry, setTabKey, openMergeSplitModal } from 'common/reducers/cmsDeclare';
import BillForm from './forms/billForm';
import EntryForm from './forms/entryForm';
import ExtraDock from './modals/extraDock';
import MergeSplitModal from './modals/mergeSplit';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;

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
export default class EntryBillForm extends React.Component {
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
      nextProps.entries[0].head.agent_code !== ''
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
    const { readonly, ietype, entries } = this.props;
    const panes = [
      <TabPane tab={<span><Icon type="book" />{this.msg('declareBill')}</span>} key="bill">
        <div className="main-content">
          <div className="page-body tabbed fixed-height">
            <BillForm readonly={readonly} ietype={ietype} />
          </div>
        </div>
      </TabPane>,
    ].concat(
      entries.map((entry, idx) => (
        <TabPane tab={
          <span><Icon type="file-text" />{`${this.msg('declareEntry')}-${idx + 1}`}</span>
        } key={`entry${idx}`}
        >
          <div className="main-content">
            <div className="page-body tabbed fixed-height">
              <EntryForm readonly={readonly} ietype={ietype} entry={entry}
                totalCount={entries.length} index={idx}
              />
            </div>
          </div>
        </TabPane>
      ))
      );
    const tabButtons = (
      <ButtonGroup style={{ marginRight: 50 }}>
        {!this.props.readonly &&
        <Button type="ghost" icon="plus-square" onClick={this.handleGenerateEntry}>{this.msg('generateEntry')}</Button>
        }
        <Button onClick={this.handleDock} icon="double-left" />
      </ButtonGroup>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Tabs tabBarExtraContent={tabButtons} activeKey={this.state.activeKey}
          onChange={this.handleTabChange} className="top-tabs-bar"
        >
          {panes}
        </Tabs>
        <MergeSplitModal />
        <ExtraDock visible={this.state.visible} />
      </QueueAnim>
    );
  }
}
