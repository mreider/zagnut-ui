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
  vue.$router.push({ name: 'account', params: {action: 'login'} });
}

export function doLogin(vue, token, user) {
  vue.$loading(true);

  if (token) {
    if (isCookieEnabled()) setCookie('token', token, {expires: '7D'});

    if (user.organization) vue.$store.commit({type: 'organization', name: user.organization.name, id: user.organization.id});
    vue.$store.commit({type: 'token', token});
    vue.$store.commit({type: 'user', user});

    vue.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    vue.$router.push({ name: 'home' });
  } else {
    doLogout(vue);
  }
  vue.$loading(false);
}

export async function forgotPassword(vue, email) {
  vue.$loading(true);

  const response = await axios.post('/api/account/forgotpassword', { email });
  const success = _get(response, 'data.success');
  const message = _get(response, 'data.message');

  if (!success) throw (new Error(message));
  if (success) throw (new Error(message));
  vue.$loading(false);

  window.location.reload();
}

export async function deleteAllCommentsConnections(ownerTable, id, strCon) {
  let response = await axios.delete('/api/comments/deleteAll/' + ownerTable + '/' + id);
  let success = _get(response, 'data.success');

  if (!success) return false;

  response = await axios.post('/api/connections/' + strCon + '/' + id, { items: [], initiatives: [], backlogs: [], bugs: [], delete: true });
  success = _get(response, 'data.success');

  return success;
}

export function username(user) {
  if (!user) return '';
  const {firstName, lastName, email} = user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  else if (firstName) return firstName;
  else if (lastName) return lastName;

  return email;
}
