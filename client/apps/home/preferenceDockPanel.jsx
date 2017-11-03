import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Icon, Radio, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import InfoItem from 'client/components/InfoItem';
import { format } from 'client/common/i18n/helpers';
import { hidePreferenceDock, changeUserLocale, loadTranslation } from 'common/reducers/preference';
import messages from './message.i18n';

const formatMsg = format(messages);
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    visible: state.preference.dockVisible,
    loginId: state.account.loginId,
    locale: state.preference.locale,
  }),
  { changeUserLocale, hidePreferenceDock, loadTranslation }
)
export default class PreferenceDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    locale: PropTypes.oneOf(['en', 'zh']),
    changeUserLocale: PropTypes.func.isRequired,
    loadTranslation: PropTypes.func.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleLocaleChange = (ev) => {
    this.props.loadTranslation(ev.target.value);
    this.props.changeUserLocale(this.props.loginId, ev.target.value);
    this.props.hidePreferenceDock();
  }
  render() {
    const { visible, locale } = this.props;
    return (
      <DockPanel size="small" visible={visible} onClose={this.props.hidePreferenceDock}
        title={<span>{this.msg('preference')}</span>}
      >
        <Tabs defaultActiveKey="language">
          <TabPane tab={<span><Icon type="global" />{this.msg('preferenceLanguage')}</span>} key="language">
            <InfoItem label={this.msg('labelChooseLanguage')}
              field={<RadioGroup onChange={this.handleLocaleChange} value={locale}>
                <RadioButton value="zh">简体中文</RadioButton>
                <RadioButton value="en">English</RadioButton>
              </RadioGroup>}
            />
          </TabPane>
          <TabPane tab={<span><Icon type="bell" />{this.msg('preferenceNotification')}</span>} key="notification">
            <InfoItem label={this.msg('labelDesktopPush')} field={this.msg('descDesktopPush')}
              action={<Switch defaultChecked={false} onChange={this.onChange} />}
            />
          </TabPane>
        </Tabs>
      </DockPanel>
    );
  }
}
