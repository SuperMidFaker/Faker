import React from 'react';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/nav-link';
import RowUpdater from './rowUpdater';
import { TENANT_ASPECT, DELG_SOURCE } from 'common/constants';
export default function makeColumn(type, aspect, ietype, handlers, msg, tenantId) {
  let totalWidth = 180;
  const columns = [{
    title: msg('delgNo'),
    dataIndex: 'delg_no',
    width: 180,
    fixed: 'left',
    render: (o, record) => {
      return (
        <RowUpdater onHit={() => handlers.onPreview({
          delgNo: o,
          tenantId,
        }, type)} label={o} row={record}
          style={record.status < 0 ? { color: '#999' } : {}}
        />
      );
    },
  }];
  if (type !== 'undeclared') {
    columns.push({
      title: msg('billNo'),
      dataIndex: 'bill_no',
      width: 170,
      render: o => <TrimSpan text={o} />,
    }, {
      title: msg('compEntryId'),
      dataIndex: 'comp_entry_id',
      width: 170,
      render: o => <TrimSpan text={o} />,
    });
    totalWidth += 340;
    if (type === 'declared') {
      columns.push({
        title: msg('entryId'),
        dataIndex: 'entry_id',
        width: 160,
        render: o => <TrimSpan text={o} />,
      });
      totalWidth += 160;
    }
  }
  columns.push({
    title: msg('delgClient'),
    dataIndex: 'customer_name',
    width: 240,
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: msg('contractNo'),
    dataIndex: 'contract_no',
    width: 200,
    render: o => <TrimSpan text={o} />,
  }, {
    title: msg('deliveryNo'),
    dataIndex: 'bl_wb_no',
    width: 200,
    render: o => <TrimSpan text={o} />,
  }, {
    title: msg('invoiceNo'),
    dataIndex: 'invoice_no',
    width: 200,
    render: o => <TrimSpan text={o} />,
  }, {
    title: msg('voyageNo'),
    width: 200,
    dataIndex: 'voyage_no',
    render: o => <TrimSpan text={o} />,
  }, {
    title: msg('delgInternalNo'),
    width: 200,
    render: (o, record) =>
      <TrimSpan text={
        aspect === TENANT_ASPECT.BO ?
          record.ref_delg_external_no : record.ref_recv_external_no
      } />,
  }, {
    title: msg('packageNum'),
    dataIndex: 'pieces',
    width: 90,
  }, {
    title: msg('delgWeight'),
    dataIndex: 'weight',
    width: 100,
  }, {
    title: msg('delgSource'),
    dataIndex: 'source',
    width: 80,
    render: (o, record) => {
      return (
        <span>{
          record.source === DELG_SOURCE.consigned ? msg('consginSource')
          : msg('subcontractSource')
        }</span>
      );
    },
  });
  totalWidth += 240 + 200 * 5 + 90 + 100 + 80;
  if (type === 'undeclared') {
    columns.push({
      title: msg('opColumn'),
      width: 120,
      fixed: 'right',
      render: (o, record) => {
        return (
          <span>
            <RowUpdater onHit={handlers.onDelgDownload} label={msg('downloadCert')}
              disabled={record.files.length === 0} row={record}
            />
            <span className="ant-divider" />
            <NavLink to={`/${ietype}/docs/make/${record.delg_no}`}>
              {msg('declareMake')}
            </NavLink>
          </span>
        );
      },
    });
    totalWidth += 120;
  } else if (type === 'declaring') {
    columns.push({
      title: msg('opColumn'),
      width: 150,
      fixed: 'right',
      render: (o, record) => {
        return (
          <span>
            <NavLink to={`/${ietype}/docs/make/${record.delg_no}`}>
              {msg('declareMake')}
            </NavLink>
            <span className="ant-divider" />
            <RowUpdater onHit={handlers.onWriteEntryId} label={msg('writeEntryId')}
              row={record}
            />
          </span>
        );
      },
    });
    totalWidth += 150;
  } else {
    columns.push({
      title: msg('opColumn'),
      width: 80,
      fixed: 'right',
      render: (o, record) => {
        return (
          <span>
            <NavLink to={`/${ietype}/docs/view/${record.delg_no}`}>
              {msg('declareView')}
            </NavLink>
          </span>
        );
      },
    });
    totalWidth += 80;
  }
  return { columns, totalWidth };
}
