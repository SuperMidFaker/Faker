import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Tabs, Dropdown, Menu } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadDelgList } from 'common/reducers/cmsDeclare';
import { setNavTitle } from 'common/reducers/navbar';
import BillForm from './forms/billForm';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './entryBill.less';
const formatMsg = format(messages);

const TabPane = Tabs.TabPane;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;

function fetchData({ state, dispatch, params }) {
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
  })
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
    goBackFn: null,
  }));
})
export default class EntryBillForm extends React.Component {
  static propTypes = {
    ietype: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    readonly: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  static defaultProps = {
    readonly: false,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)

  PopMenu = (
    <Menu>
      <MenuItem>{this.msg('generateEntry')}</MenuItem>
      <MenuItem>{this.msg('addEntry')}</MenuItem>
    </Menu>
  )
  TabButton = (
    <DropdownButton type="primary" overlay={this.PopMenu}>
    {this.msg('newDeclaration')}
    </DropdownButton>
  )
  render() {
    const { readonly, ietype } = this.props;
    return (
      <div className="main-content">
        <div className="page-body">
          <Tabs tabBarExtraContent={!readonly && this.TabButton}>
            <TabPane tab={this.msg('declareBill')} key="bill">
              <BillForm readonly={readonly} ietype={ietype} />
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}
