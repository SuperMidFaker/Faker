import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Dropdown, Menu, Icon } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadBills, loadEntries, loadCmsParams, addEntry, setTabKey } from 'common/reducers/cmsDeclare';
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
    activeKey: state.cmsDeclare.activeTabKey,
  }),
  { addEntry, setTabKey }
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
      <div className="main-content">
        <div className="page-body">
          <Tabs tabBarExtraContent={!readonly && this.renderTabButton()} activeKey={activeKey}
            onChange={this.handleTabChange}
          >
            <TabPane tab={<span><Icon type="book" />{this.msg('declareBill')}</span>} key="bill">
              <BillForm readonly={readonly} ietype={ietype} />
            </TabPane>
            {
              entries.map((entry, idx) => (
                <TabPane tab={<span><Icon type="file-text" />{`${this.msg('declareEntry')}-${idx + 1}`}</span>} key={`entry${idx}`}>
                  <EntryForm readonly={readonly} ietype={ietype} entry={entry} totalCount={entries.length} />
                </TabPane>
              ))
            }
          </Tabs>
        </div>
      </div>
    );
  }
}
