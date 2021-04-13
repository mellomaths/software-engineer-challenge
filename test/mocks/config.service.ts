export const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'auth.jwt.secret':
        return 'NDgzMDE2MDIzNDQwNjIxNjE4.DmNiFQ.C9hWQsCEJoW5Y9mT5oatUjSLKlw';
      case 'auth.jwt.expirationTime':
        return 3600;
    }
  },
};
