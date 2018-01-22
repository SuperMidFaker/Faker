import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Col, Avatar } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import { DEFAULT_MODULES } from 'common/constants';
import messages from 'client/common/root.i18n';
import NavLink from '../NavLink';
import './style.less';

const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  enabledmods: state.account.modules.map(mod => mod.id),
  homeApps: state.account.apps.home,
}))
export default class ModuleLayout extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.oneOf(['', 'large']),
  };
  handleClick = (url) => {
    const win = window.open(url, '_blank');
    win.focus();
  }
  render() {
    const { enabledmods, homeApps } = this.props;
    const containerCls = `module-container ${this.props.size || ''}`;
    return (
      <QueueAnim type="bottom">
        {
          enabledmods.map((mod) => {
            const emod = DEFAULT_MODULES[mod];
            return (
              <Col span="8" key={mod}>
                <NavLink to={`${emod.url}/`}>
                  <div className={containerCls}>
                    <div className={`module-icon-bg ${emod.cls}`}>
                      <div className="module-icon">
                        <i className={`icon logixon icon-${emod.cls}`} />
                      </div>
                    </div>
                    <span className="module-text">
                      {formatMsg(this.props.intl, emod.text)}
                    </span>
                  </div>
                </NavLink>
              </Col>);
          })
        }
        {
          homeApps && homeApps.map(home => (
            <Col span="8" key={home.app_id}>
              <a >
                <div className={containerCls}>
                  <div className="module-icon-bg">
                    <div className="module-icon">
                      <Avatar shape="square" onClick={() => this.handleClick(home.url)} src={home.app_logo} style={{ width: '100%', height: '100%' }} />
                    </div>
                  </div>
                  <span className="module-text">
                    {formatMsg(this.props.intl, home.app_name)}
                  </span>
                </div>
              </a>
            </Col>))
        }
      </QueueAnim>);
  }
}
