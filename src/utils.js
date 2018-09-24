import { isCookieEnabled, removeCookie, setCookie } from 'tiny-cookie';
import axios from 'axios';
import _get from 'lodash/get';

export function doLogout(vue) {
  vue.$loading(true);
  vue.$store.commit({type: 'user', user: null});
  vue.$store.commit({type: 'token', token: null});
  vue.$store.commit({type: 'organization', name: null, id: null});

  if (isCookieEnabled()) removeCookie('token');

  vue.$loading(false);
  vue.$router.push({ name: 'account' });
}

export function doLogin(vue, token, user) {
  vue.$loading(true);

  if (token) {
    if (isCookieEnabled()) setCookie('token', token, {expires: '7D'});

    if (user.organization) vue.$store.commit({type: 'organization', name: user.organization.name, id: user.organization.id});
    vue.$store.commit({type: 'token', token});
    vue.$store.commit({type: 'user', user});
  } else {
    doLogout(vue);
  }

  vue.$loading(false);
}

export async function switchOrganization(vue, orgId) {
  vue.$loading(true);

  const response = await axios.post(`/api/org/switch/${orgId}`);
  const success = _get(response, 'data.success');
  const message = _get(response, 'data.message');
  const token = _get(response, 'data.token');
  const organization = _get(response, 'data.organization');

  if (!success || !token || !organization) throw (new Error(message));

  if (isCookieEnabled()) setCookie('token', token, {expires: '7D'});
  vue.$store.commit({type: 'token', token});
  vue.$store.commit({type: 'organization', name: organization.name, id: organization.id});

  vue.$loading(false);

  window.location.reload();
}