/**
 * 退出登录接口
 */

import { appendResponseHeader, getRequestHeader, parseCookies } from 'h3';
import { cookieStore, getCookieFromStore, getTokenFromStore } from '~/server/utils/CookieStore';
import { buildExpiredAuthKeyCookie, proxyMpRequest } from '~/server/utils/proxy-request';

export default defineEventHandler(async event => {
  const authKey = getRequestHeader(event, 'X-Auth-Key') || parseCookies(event)['auth-key'];
  const [token, cookie] = await Promise.all([getTokenFromStore(event), getCookieFromStore(event)]);

  try {
    if (!token || !cookie) {
      return { statusCode: 200, statusText: 'OK' };
    }

    const response: Response = await proxyMpRequest({
      event: event,
      method: 'GET',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/logout',
      query: {
        t: 'wxm-logout',
        token: token,
        lang: 'zh_CN',
      },
      cookie,
    });

    return {
      statusCode: response.status,
      statusText: response.statusText,
    };
  } finally {
    if (authKey) {
      await cookieStore.removeCookie(authKey);
    }
    appendResponseHeader(event, 'set-cookie', buildExpiredAuthKeyCookie(event));
  }
});
