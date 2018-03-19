import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import ListContentLayout from 'client/components/ListContentLayout';
import { format } from 'client/common/i18n/helpers';
import { selectCargoOwner } from 'common/reducers/cwmShFtz';
import WhseSelect from '../../common/whseSelect';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    listFilter: state.cwmShFtz.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { selectCargoOwner }
)
export default class SHFTZWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    owners: this.props.owners.filter(owner => owner.portion_enabled),
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.owners !== this.props.owners) {
      const owners = nextProps.owners.filter(owner => owner.portion_enabled);
      this.setState({ owners });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleWhseChange = () => {
    this.context.router.push('/cwm/supervision/shftz/entry');
  }
  handleRowClick = (row) => {
    this.props.selectCargoOwner(row);
    this.context.router.push('/cwm/supervision/shftz/cargo');
  }
  handleMenuClick = (ev) => {
    if (ev.key === 'bondedEntry') {
      this.context.router.push('/cwm/supervision/shftz/entry');
    } else if (ev.key === 'relNormal') {
      this.context.router.push('/cwm/supervision/shftz/release/normal');
    } else if (ev.key === 'normalDecl') {
      this.context.router.push('/cwm/supervision/shftz/decl/normal');
    } else if (ev.key === 'relPortion') {
      this.context.router.push('/cwm/supervision/shftz/release/portion');
    } else if (ev.key === 'batchDecl') {
      this.context.router.push('/cwm/supervision/shftz/decl/batch');
    } else if (ev.key === 'transferin') {
      this.context.router.push('/cwm/supervision/shftz/transfer/in');
    } else if (ev.key === 'transferout') {
      this.context.router.push('/cwm/supervision/shftz/transfer/out');
    } else if (ev.key === 'transferself') {
      this.context.router.push('/cwm/supervision/shftz/transfer/self');
    } else if (ev.key === 'stock') {
      this.context.router.push('/cwm/supervision/shftz/stock');
    } else if (ev.key === 'nonbonded') {
      this.context.router.push('/cwm/supervision/shftz/stock/nonbonded');
    } else if (ev.key === 'cargo') {
    //  this.context.router.push('/cwm/supervision/shftz/cargo');
    }
  }
  render() {
    // const filterOwners = this.props.owners.filter(item => item.portion_enabled);
    const menuStack = [
      [
        {
          key: 'g_in',
          icon: 'login',
          title: this.msg('进区'),
          type: 'group',
          children: [
            {
              key: 'bondedEntry',
              title: this.msg('ftzBondedEntryReg'),
            },
          ],
        },
        {
          key: 'g_out',
          icon: 'logout',
          title: this.msg('出区'),
          type: 'group',
          children: [
            {
              key: 'relNormal',
              title: this.msg('ftzRelNormalReg'),
            },
            {
              key: 'normalDecl',
              title: this.msg('ftzNormalDecl'),
            },
            {
              key: 'relPortion',
              title: this.msg('ftzRelPortionReg'),
            },
            {
              key: 'batchDecl',
              title: this.msg('ftzBatchDecl'),
            },
          ],
        },
        {
          key: 'g_transfer',
          icon: 'swap',
          title: this.msg('区内移库'),
          type: 'group',
          children: [
            {
              key: 'transferin',
              title: this.msg('ftzTransferIn'),
            },
            {
              key: 'transferout',
              title: this.msg('ftzTransferOut'),
            },
            {
              key: 'transferself',
              title: this.msg('ftzTransferSelf'),
            },
          ],
        },
        {
          key: 'g_stock',
          icon: 'swap',
          title: this.msg('监管库存'),
          type: 'group',
          children: [
            {
              key: 'stock',
              title: this.msg('ftzBondedStock'),
            },
            {
              key: 'nonbonded',
              title: this.msg('ftzNonbondedStock'),
            },
          ],
        },
        {
          key: 'g_cargo',
          icon: 'swap',
          title: this.msg('货物监管'),
          type: 'group',
          children: [
            {
              key: 'cargo',
              title: this.msg('ftzCargoReg'),
              children: [
                {
                  key: 'cargoReg',
                  title: this.msg('ftzBondedEntryReg'),
                  type: 'table',
                  columns: [{
                    dataIndex: 'name',
                    key: 'code',
                    render: (o, record) =>
                      <span><div>{record.customs_code}</div><div>{record.name}</div></span>,
                  }],
                  dataSource: this.state.owners,
                  onRowClick: row => this.handleRowClick(row),
                },
              ],
            },
          ],
        },
      ],
    ];
    return (
      <ListContentLayout
        title={this.msg('shftzSup')}
        extra={<WhseSelect bonded onChange={this.handleWhseChange} disabled />}
        stack={menuStack}
        listWidth={200}
        onMenuClick={this.handleMenuClick}
        defaultSelectedKey="bondedEntry"
      >
        {this.props.children}
      </ListContentLayout>);
  }
}
