import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Col } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import NavLink from './nav-link';
import { DEFAULT_MODULES } from '../../common/constants';
import messages from '../common/root.i18n';
import './module-layout.less';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    enabledmods: state.account.modules.map(mod => mod.id),
  })
)
export default class ModuleLayout extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.oneOf(['', 'large']),
  };

  render() {
    const containerCls = `module-container ${this.props.size || ''}`;
    return (
      <QueueAnim type="bottom">
        {
          this.props.enabledmods.map((mod, idx) => {
            const emod = DEFAULT_MODULES[mod];
            return (
              <Col span="8" key={`mod-${idx}`}>
                <NavLink to={`${emod.url}/`}>
                  <div className={containerCls}>
                    <div className={`module-icon-bg ${emod.cls}`}>
                      <div className="module-icon">
                        <i className={`zmdi zmdi-${emod.cls}`} />
                      </div>
                    </div>
                    <span className="module-text">
                      {formatMsg(this.props.intl, emod.text)}
                      {
                        // emod.status && <sup className={emod.status}>{emod.status}</sup>
                      }
                    </span>
                  </div>
                </NavLink>
              </Col>);
          })
        }
      </QueueAnim>);
  }
}
