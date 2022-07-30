// @ts-check

export default {
  translation: {
    appName: 'Task manager',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          failure: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          failure: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          failure: 'Вы не можете редактировать данного пользователя'
        },
        update: {
          success: 'Пользователь успешно обновлен',
          failure: 'Не удалось обновить пользователя',
        },
        delete: {
          success: 'Пользователь успешно удален',
          failure: 'Вы не можете удалить данного пользователя',
        }
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          title: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        firstName: 'Имя',
        lastName: 'Фамилия',
        password: 'Пароль',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: 'Действия',
        new: {
          title: 'Регистрация',
          submit: 'Сохранить',
        },
        index: {
          edit: 'Изменить',
          delete: 'Удалить',
        },
        edit: {
          title: 'Редактирование',
          submit: 'Обновить',
        },
        errors: {
          firstName: "Должно содержать минимум 1 символ",
          lastName: "Должно содержать минимум 1 символ",
          email: "Должно быть формата email",
          password: "Должно содержать минимум 8 символов: минимум 1 заглавная, 1 маленькая буква и 1 специальный символ",
        }
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
