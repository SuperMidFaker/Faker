/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-30
 * Time: 17:01
 * Version: 1.0
 * Description:
 */

const stjs = `
  <script>(function(i,s,o,g,r,a,m){i["DaoVoiceObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","//widget.daovoice.io/widget/dcb1ac4c.js","daovoice");
  daovoice('init', {
    app_id: "dcb1ac4c"
  });
  daovoice('update');
  </script>
  <script type='text/javascript'>
    var _vds = _vds || [];
    window._vds = _vds;
    (function(){
      _vds.push(['setAccountId', '8e87f20efd43c754']);
      (function() {
        var vds = document.createElement('script');
        vds.type='text/javascript';
        vds.async = true;
        vds.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'dn-growing.qbox.me/vds.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(vds, s);
      })();
    })();
  </script>`;

export default stjs;
