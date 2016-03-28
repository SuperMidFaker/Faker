import db from '../db-util/mysql';

/*
/a   auto increment
/v_54   varchar(54)
/i_11   int(11)
/f_10   float(10)
/d_10   double(10)
/e_9_5   decimal(9,5)
/dtt datetime
/dt  date

/nn  not null  -> /v_4/nn
/def_... default value -> /v_4/nn/def_hell
 */

const cols = ['del_id/a', 'external_no/v', 'creater_login_id/i/def_0', 'customer_id/i/nn', 'templat_no/v', 'year/i', 'month/i', 'week/i', 'dec_mode/v', 'tenant_id/i/nn', 'create_tenant_id/i/nn', 'del_no/v', 'delegate_type/i', 'pre_entry_id/v', 'category/v', 'declare_way_no/v', 'seq_no/v', 'input_date/dtt', 'customer_name/v', 's_bus_no/v', 'invoice_no/v', 'master_customs/v', 'entry_id/v', 'i_e_port/v', 'ems_no/v', 'i_e_date/dt', 'd_date/dt', 'trade_co/v', 'trade_name/v', 'traf_mode/v', 'traf_name/v', 'bill_no/v', 'owner_code/v', 'owner_name/v', 'trade_mode/v', 'cut_mode/v', 'pay_mode/v', 'license_no/v', 'trade_country/v', 'distinate_port/v', 'district_code/v', 'appr_no/v', 'trans_mode/v', 'fee_curr/v', 'fee_rate/e', 'fee_mark/v', 'insur_curr/v', 'insur_rate/e', 'insur_mark/v', 'other_curr/v', 'other_rate/e', 'other_mark/v', 'contr_no/v', 'pack_no/e', 'wrap_type/v', 'gross_wt/e', 'net_wt/e', 'jzxsl/v', 'cert_mark/v', 'use_to/v', 'note/v', 'voyage_no/v', 'agent_code/v', 'agent_name/v', 'library_no/v', 'prdtid/v', 'storeno/v', 'ramanualno/v', 'radeclno/v', 'trade_term/v', 'forwarder/v', 'cont_40/e', 'cont_20/e', 'cont_lcl/e', 'partner_id/v', 'jzx_type/v', 'order_date/dtt', 'mawb_no/v', 'hawb_no/v'];
/*
col = {
  type,
  minLen,
  maxLen,
  def,
  nullable,
  val
}
 */
class OrmObject {
  constructor(cols) {
    this.cols = cols;
    this.mapping = {};
  }

  parse(s) {
    const ss = s.split('_');
    let type;
    let maxLen = 0;
    let minLen = 0;
    let def;
    switch (ss[0]) {
    case 'a':
      type = 'auto_increment';
      break;
    case 'v':
      type = 'varchar';
      def = function (s) {
        s = s || '';
        return String(s);
      };
      break;
    case 'i':
      type = 'int';
      def = function (i) {
        if (isNaN(i)) {
          return 0;
        }
        return parseInt(i, 10);
      };
      break;
    case 'f':
      type = 'float';
      def = function (i) {
        if (isNaN(i)) {
          return 0;
        }
        return parseFloat(i);
      };
      break;
    case 'd':
      type = 'double';
      def = function (i) {
        if (isNaN(i)) {
          return 0;
        }
        return parseFloat(i);
      };
      break;
    case 'e':
      type = 'decimal';
      def = function (i) {
        if (isNaN(i)) {
          return 0;
        }
        return parseFloat(i);
      };
      break;
    case 'dt':
      type = 'date';
      def = function (d) {
        if (!d) {
          return null;
        }
        return new Date(d);
      };
      break;
    case 'dtt':
      type = 'datetime';
      def = function (d) {
        if (!d) {
          return null;
        }
        return new Date(d);
      };
      break;
    default:
      type = 'varchar';
      def = function (s) {
        s = s || '';
        return String(s);
      };
      break;
    }
    if (ss.length > 1) {
      maxLen = parseInt(ss[1], 10);
      if (ss.length === 3) {
        minLen = parseInt(ss[2], 10);
      }
    }

    return {type, maxLen, minLen, nullable: true, def, val: def()};
  }

  build() {
    const _this = this;
    _this.cols.forEach(c => {
      const ss = c.split('/');
      const o = _this.parse(ss[1]);
      if (ss.length > 1) {
        for (let i = ss.length - 1; i > 0; i--) {
          const s = ss[i];
          if (s.substr(0, 2) === 'nn') {
            o.nullable = false;
          } else {
            o.val = o.def(ss[2].split(1));
          }
        }
      }

      _this.mapping[ss[0]] = o;
    });


  }

  insert(obj) {

  }
}

// const colsList =
/*

del_no
ems_no
list_g_no
em_g_no
cop_g_no
code_t
code_s
g_name
g_model
country_code
element
qty
unit
factor_1
unit_1
factor_2
unit_2
dec_total
dec_price
curr
gross_wt
wet_wt
use_type
duty_mode
control_ma
bom_version
invoice_no
order_no
note
ent_seq_no
ent_g_no
org_seq_no
org_g_no

id
del_id
tenant_id
create_tenant_id
 */

export default {
  insertHead(head) {

  },
  insertList(lists) {

  }
};
