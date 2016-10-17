import React, { Component, PropTypes } from 'react';
import { Menu } from 'antd';
import { connect } from 'react-redux';
import AgreementForm from './forms/agreement';
import RatesForm from './forms/rates';
import SurchargeForm from './forms/surcharge';
import { setMenuItemKey } from 'common/reducers/transportTariff';

const MenuItem = Menu.Item;

const styles = {
  show: {
    display: 'block',
  },
  hidden: {
    display: 'none',
  },
};
@connect(state => ({
  selectedKey: state.transportTariff.selectedMenuItemKey,
  tariffId: state.transportTariff.tariffId,
}), { setMenuItemKey })
export default class Main extends Component {
  static propTyps = {
    selectedKey: PropTypes.string.isRequired,  // 选中的menuItem keys
    setMenuItemKey: PropTypes.func.isRequired,        // itemItem点击后执行的回调函数,
    type: PropTypes.oneOf(['create', 'edit']),
    tariffId: PropTypes.string,
  }
  handleMenuItemClick = (e) => {
    this.props.setMenuItemKey(e.key);
  }

  render() {
    const { selectedKey, type, tariffId } = this.props;
    let slk = selectedKey;
    let contents = [<AgreementForm />, <RatesForm />, <SurchargeForm />];
    let menu = (
      <Menu mode="horizontal" selectedKeys={[selectedKey]} onClick={this.handleMenuItemClick}>
        <MenuItem key="0">协议概况</MenuItem>
        <MenuItem key="1">基础费率</MenuItem>
        <MenuItem key="2">附加费用</MenuItem>
      </Menu>
    );
    if (type === 'create') {
      if (!tariffId) {
        slk = '0';
        menu = (
          <Menu mode="horizontal" selectedKeys={[slk]} onClick={this.handleMenuItemClick}>
            <MenuItem key="0">协议概况</MenuItem>
          </Menu>
        );
      }
    } else if (type === 'edit') {
      contents = [<AgreementForm readonly />, <RatesForm />, <SurchargeForm />];
    }
    const content = contents.map((container, index) => <div style={parseInt(slk, 10) === index ? styles.show : styles.hidden} key={index}>{container}</div>);
    return (
      <div>
        <header className="top-bar">
          {menu}
        </header>
        {content}
      </div>
    );
  }
}
