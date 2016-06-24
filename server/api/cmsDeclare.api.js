// import cobody from 'co-body';
import { Delegation, Dispatch } from '../models/cmsDelegation.db';
import { CMS_BILL_STATUS } from 'common/constants';
import Result from '../util/responseResult';

function *getDelgDeclares() {
  let { filter, pageSize, current, tenantId } = this.request.query;
  pageSize = parseInt(pageSize, 10);
  current = parseInt(current, 10);
  tenantId = parseInt(tenantId, 10);
  filter = JSON.parse(filter);
  let billStatus = CMS_BILL_STATUS.undeclared;
  if (filter.declareType === 'declaring') {
    billStatus = CMS_BILL_STATUS.declaring;
  } else if (filter.declareType === 'declared') {
    billStatus = CMS_BILL_STATUS.declared;
  }
  const result = yield Delegation.findAndCountAll({
    attributes: [
      'delg_no', 'customer_name', 'contract_no', 'invoice_no',
      'bl_wb_no', 'voyage_no', 'pieces', 'weight'
    ],
    offset: (current - 1) * pageSize,
    limit: pageSize,
    raw: true,
    include: [{
      model: Dispatch,
      attributes: [
        'ref_delg_external_no', 'ref_recv_external_no',
        'delg_time', 'acpt_time', 'decl_time', 'clean_time',
        'bill_no', 'entry_id', 'comp_entry_id', 'source',
      ],
      where: {
        recv_tenant_id: tenantId,
        bill_status: billStatus,
      }
    }],
    where: {
     $or: [{
       delg_no: {
         $like: `%${filter.name}%`,
       },
     }, {
       invoice_no: {
         $like: `%${filter.name}%`,
       },
     }, {
       bl_wb_no: {
         $like: `%${filter.name}%`,
       },
     }],
    },
  });
  return Result.ok(this, {
    totalCount: result.count,
    pageSize,
    current,
    data: result.rows,
  });
}
export default [
  [ 'get', '/v1/cms/delegation/declares', getDelgDeclares ],
];
