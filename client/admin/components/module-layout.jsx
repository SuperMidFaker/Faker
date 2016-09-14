import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import { Row, Col } from 'antd';
import './module-layout.less';

@injectIntl
export default class ModuleLayout extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.array.isRequired,
    size: PropTypes.oneOf(['', 'large']),
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
                  <span className="module-text">{mod.text}</span>
                </div>
              </NavLink>
            </Col>))
        }
      </Row>);
  }
}
