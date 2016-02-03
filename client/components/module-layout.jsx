import React, { PropTypes } from 'react';
import NavLink from '../../reusable/components/nav-link';
import {Row, Col} from 'ant-ui';
import {DEFAULT_MODULES} from '../../universal/constants';
import './module-layout.less';

export default class ModuleLayout extends React.Component {
  static propTypes = {
    enabledmods: PropTypes.array.isRequired, // todo get from state.account
    size: PropTypes.oneOf(['', 'large'])
  };

  static defaultProps = {
    enabledmods: [
      DEFAULT_MODULES.import,
      DEFAULT_MODULES.export,
      DEFAULT_MODULES.tms,
      DEFAULT_MODULES.wms,
      DEFAULT_MODULES.payable,
      DEFAULT_MODULES.receivable,
      DEFAULT_MODULES.cost,
      DEFAULT_MODULES.kpi
    ]
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
                  <div className={`module-icon-bg ${mod.cls}`}>
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
