export function ssoRedirectUrl(request, withoutnext=false) {
  const ssoSiteUrl = __PRODUCTIONS_DOMAIN_GROUP__.sso;
  return withoutnext ? `${ssoSiteUrl}` :
    `${ssoSiteUrl}login?next=${request.protocol}://${encodeURIComponent(`${request.host}${request.originalUrl}`)}`;
}
