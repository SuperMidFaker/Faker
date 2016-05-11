import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'universal/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
import './preview-panel.less';

@injectIntl
@connect(
  state => ({
    visible: state.shipment.previewer.visible,
  })
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    return (
      <div className={`preview-panel ${visible ? 'inside' : ''}`}>
       <div className="activity-panel">
       </div>
      </div>
    );
  }
}
