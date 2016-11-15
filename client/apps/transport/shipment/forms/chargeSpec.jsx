import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import ReactDataGrid from '@welogix/react-data-grid';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class ChargeSpecForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    charges: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    checkPickup: true,
    checkDeliver: true,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handlePickupCheck = (ev) => {
    this.setState({ checkPickup: ev.target.checked });
    const { charge, index, onChange } = this.props;
    if (ev.target.checked) {
      onChange({
        ...charge, total_charge: charge.total_charge + charge.pickup_charge,
      }, index);
    } else {
      onChange({
        ...charge, total_charge: charge.total_charge - charge.pickup_charge,
      }, index);
    }
  }
  handleDeliverCheck = (ev) => {
    this.setState({ checkDeliver: ev.target.checked });
    const { charge, index, onChange } = this.props;
    if (ev.target.checked) {
      charge.total_charge += charge.deliver_charge;
    } else {
      charge.total_charge -= charge.deliver_charge;
    }
    onChange(charge, index);
  }
  rowGetter = (rowIdx) => {
    return this.props.charges[rowIdx];
  }
  handleRowUpdated = (e) => {
    const { index, onChange, charges } = this.props;
    Object.assign(charges[e.rowIdx], e.updated);
    const updated = {
      freight_charge: Number(charges[e.rowIdx].freight_charge),
      pickup_charge: Number(charges[e.rowIdx].pickup_charge),
      deliver_charge: Number(charges[e.rowIdx].deliver_charge),
      surcharge: Number(charges[e.rowIdx].surcharge),
    };
    updated.total_charge = updated.freight_charge + updated.pickup_charge +
    updated.deliver_charge + updated.surcharge;
    Object.assign(charges[e.rowIdx], updated);
    onChange(charges, index);
  }
  render() {
    const columns = [{
      name: '运单号',
      key: 'shipmt_no',
      width: 150,
    }, {
      name: '基本运费',
      key: 'freight_charge',
      editable: true,
    }, {
      name: '提货费',
      key: 'pickup_charge',
      editable: true,
    }, {
      name: '配送费',
      key: 'deliver_charge',
      editable: true,
    }, {
      name: '运费调整项',
      key: 'surcharge',
      editable: true,
    }, {
      name: '总运费',
      key: 'total_charge',
      editable: true,
    }];
    return (
      <ReactDataGrid
        enableCellSelect
        columns={columns}
        rowGetter={this.rowGetter}
        rowsCount={this.props.charges.length}
        minHeight={400}
        minWidth={520}
        onRowUpdated={this.handleRowUpdated}
      />
    );
  }
}
