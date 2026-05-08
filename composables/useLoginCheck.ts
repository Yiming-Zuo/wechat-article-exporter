import { request } from '#shared/utils/request';
import LoginModal from '~/components/modal/Login.vue';
import type { GetAuthKeyResult } from '~/types/types';

export default () => {
  const modal = useModal();
  const loginAccount = useLoginAccount();
  const validating = useState<Promise<boolean> | null>('login-validating', () => null);

  async function validateLogin(showLoginModal = false) {
    if (loginAccount.value === null) {
      if (showLoginModal) {
        modal.open(LoginModal);
      }
      return false;
    }

    if (!validating.value) {
      validating.value = request<GetAuthKeyResult>('/api/public/v1/authkey')
        .then(resp => resp.code === 0)
        .catch(() => false)
        .finally(() => {
          validating.value = null;
        });
    }

    const isValid = await validating.value;
    if (!isValid) {
      loginAccount.value = null;
      if (showLoginModal) {
        modal.open(LoginModal);
      }
    }
    return isValid;
  }

  // 检查是否有登录信息
  async function checkLogin() {
    return await validateLogin(true);
  }

  return {
    checkLogin,
    validateLogin,
  };
};
