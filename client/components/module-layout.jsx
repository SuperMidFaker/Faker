import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { Row, Col } from 'antd';
import { DEFAULT_MODULES } from '../../common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './module-layout.less';
const formatMsg = format(messages);

@injectIntl
export default class ModuleLayout extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.array.isRequired, // todo get from state.account
    size: PropTypes.oneOf(['', 'large']),
  };

  static defaultProps = {
    enabledmods: Object.keys(DEFAULT_MODULES).map(mod => DEFAULT_MODULES[mod]),
  };

  render() {
    const containerCls = `module-container ${this.props.size || ''}`;
    return (
      <Row>
        {
          this.props.enabledmods.map((mod, idx) => (
            <Col span="6" key={`mod-${idx}`}>
              <NavLink to={mod.url}>
                <div className={containerCls}>
                  <div className={`module-icon-bg ${mod.cls} ${mod.status}`}>
                    <div className="module-icon">
                      <i className={`zmdi zmdi-${mod.cls}`}></i>
                    </div>
                  </div>
                  <span className="module-text">{formatMsg(this.props.intl, mod.text)}</span>
                </div>
              </NavLink>
            </Col>))
        }
      </Row>);
  }
}
