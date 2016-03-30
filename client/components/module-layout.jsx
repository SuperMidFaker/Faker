import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from '../../reusable/components/nav-link';
import {Row, Col} from 'ant-ui';
import {DEFAULT_MODULES} from '../../universal/constants';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import './module-layout.less';
const formatMsg = format(messages);

@injectIntl
export default class ModuleLayout extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.array.isRequired, // todo get from state.account
    size: PropTypes.oneOf(['', 'large'])
  };

  static defaultProps = {
    enabledmods: [
      DEFAULT_MODULES.import,
      DEFAULT_MODULES.export,
      DEFAULT_MODULES.transport,
      DEFAULT_MODULES.forwarding,
      DEFAULT_MODULES.inventory,
      DEFAULT_MODULES.tracking,
      DEFAULT_MODULES.cost,
      DEFAULT_MODULES.performance
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
                  <span className="module-text">{formatMsg(this.props.intl, mod.text)}</span>
                </div>
              </NavLink>
            </Col>))
        }
      </Row>);
  }
}
