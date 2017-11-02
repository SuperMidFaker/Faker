import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { loadAsnInbounds } from 'common/reducers/cwmReceive';
import InboundCard from '../card/inboundCard';
// import InfoItem from 'client/components/InfoItem';
// import { MdIcon } from 'client/components/FontIcon';


@injectIntl
@connect(
  state => ({
    order: state.crmOrders.dock.order,
  }),
  { loadAsnInbounds }
)
export default class InboundPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    asnNo: PropTypes.string.isRequired,
  }
  state = {
    tabKey: '',
    inbounds: [],
  }
  componentWillMount() {
    this.props.loadAsnInbounds(this.props.asnNo).then((result) => {
      if (!result.error) {
        this.setState({
          inbounds: result.data,
        });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.asnNo !== this.props.asnNo) {
      this.props.loadAsnInbounds(nextProps.asnNo).then((result) => {
        if (!result.error) {
          this.setState({
            inbounds: result.data,
          });
        }
      });
    }
  }

  render() {
    const { inbounds } = this.state;
    return (
      <div className="pane-content tab-pane">
        {
          inbounds.map(item => (
            <InboundCard key={item.inbound_no} inboundNo={item.inbound_no} />
          ))
        }
      </div>
    );
  }
}
