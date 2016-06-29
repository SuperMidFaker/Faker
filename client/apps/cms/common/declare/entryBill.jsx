import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Dropdown, Menu } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadBills, loadEntries, loadCmsParams, addEntry } from 'common/reducers/cmsDeclare';
import { setNavTitle } from 'common/reducers/navbar';
import BillForm from './forms/billForm';
import EntryForm from './forms/entryForm';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './entryBill.less';
const formatMsg = format(messages);

const TabPane = Tabs.TabPane;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;

function fetchData({ dispatch, params, cookie }) {
  const promises = [];
  promises.push(dispatch(loadBills(cookie, params.delgNo)));
  promises.push(dispatch(loadEntries(cookie, params.delgNo)));
  promises.push(dispatch(loadCmsParams(cookie)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
    entries: state.cmsDeclare.entries,
  }),
  { addEntry }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: `${formatMsg(props.intl, 'cmsDelegation')}${props.params.delgNo}`,
    moduleName: props.ietype,
    withModuleLayout: false,
    goBackFn: () => router.goBack(),
  }));
})
export default class EntryBillForm extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    aspect: PropTypes.number.isRequired,
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
    activeKey: '',
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEntryMenuClick = (ev) => {
    if (ev.key === 'add') {
      this.props.addEntry();
    }
  }
  handleTabChange = (activeKey) => {
    this.setState({ activeKey });
  }
  renderTabButton() {
    const PopMenu = (
      <Menu onClick={this.handleEntryMenuClick}>
        <MenuItem key="generate">{this.msg('generateEntry')}</MenuItem>
        <MenuItem key="add">{this.msg('addEntry')}</MenuItem>
      </Menu>
    );
    return (
      <DropdownButton type="primary" overlay={PopMenu}>
      {this.msg('newDeclaration')}
      </DropdownButton>
    );
  }
  render() {
    const { readonly, ietype, entries } = this.props;
    const activeKey = this.state.activeKey || (entries.length > 0 ? `entry${entries.length - 1}` : 'bill');
    return (
      <div className="main-content">
        <div className="page-body">
          <Tabs tabBarExtraContent={!readonly && this.renderTabButton()} activeKey={activeKey}
            onChange={this.handleTabChange}
          >
            <TabPane tab={this.msg('declareBill')} key="bill">
              <BillForm readonly={readonly} ietype={ietype} />
            </TabPane>
            {
              entries.map((entry, idx) => (
                <TabPane tab={`${this.msg('declareEntry')}-${idx}`} key={`entry${idx}`}>
                  <EntryForm readonly={readonly} ietype={ietype} entry={entry} index={idx} />
                </TabPane>
              ))
            }
          </Tabs>
        </div>
      </div>
    );
  }
}
