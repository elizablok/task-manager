// @ts-check

export default {
  translation: {
    appName: 'Task manager',
    flash: {
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        update: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
          failure: 'Вы не можете редактировать или удалять другого пользователя',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
          failure: 'Вы не можете редактировать или удалять другого пользователя',
        },
      },
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        update: {
          success: 'Статус успешно изменён',
          error: 'Не удалось изменить статус',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Не удалось удалить статус',
        },
      },
      tasks: {
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
        },
        update: {
          success: 'Задача успешно изменена',
          error: 'Не удалось изменить задачу',
        },
        delete: {
          success: 'Задача успешно удалена',
          error: 'Не удалось удалить задачу',
          failure: 'Задачу может удалить только её автор',
        },
      },
      labels: {
        create: {
          success: 'Метка успешно создана',
          error: 'Не удалось создать метку',
        },
        update: {
          success: 'Метка успешно изменена',
          error: 'Не удалось изменить метку',
        },
        delete: {
          success: 'Метка успешно удалена',
          error: 'Не удалось удалить метку',
        },
      },
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
        tasks: 'Задачи',
        labels: 'Метки',
      },
    },
    views: {
      fields: {
        id: 'ID',
        name: 'Имя',
        itemName: 'Наименование',
        createdAt: 'Дата создания',
        actions: 'Действия',
      },
      submit: {
        create: 'Создать',
        save: 'Сохранить',
        edit: 'Изменить',
        delete: 'Удалить',
      },
      session: {
        new: {
          title: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        fullName: 'Полное имя',
        lastName: 'Фамилия',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        email: 'Email',
        new: {
          title: 'Регистрация',
        },
        edit: {
          title: 'Изменение пользователя',
        },
        errors: {
          firstName: {
            minLength: 'Должно содержать минимум 1 символ',
          },
          lastName: {
            minLength: 'Должно содержать минимум 1 символ',
          },
          email: {
            pattern: 'Должно быть формата email',
          },
          password: {
            minLength: 'Должно содержать минимум 1 символ',
          },
        },
      },
      statuses: {
        index: {
          create: 'Создать статус',
        },
        edit: {
          title: 'Изменение статуса',
        },
        new: {
          title: 'Создание статуса',
        },
        errors: {
          name: {
            minLength: 'Должно содержать минимум 1 символ',
          },
        },
      },
      tasks: {
        status: 'Статус',
        labels: 'Метки',
        description: 'Описание',
        executor: 'Исполнитель',
        creator: 'Автор',
        options: 'Опции',
        filter: {
          isCreatorUser: 'Только мои задачи',
          submit: 'Показать',
        },
        index: {
          create: 'Создать задачу',
        },
        new: {
          title: 'Создание задачи',
        },
        edit: {
          title: 'Изменение задачи',
        },
        errors: {
          name: {
            minLength: 'Должно содержать минимум 1 символ',
          },
          statusId: {
            minimum: 'Обязательно',
          },
        },
      },
      labels: {
        index: {
          create: 'Создать метку',
        },
        new: {
          title: 'Создание метки',
        },
        edit: {
          title: 'Изменение метки',
        },
        errors: {
          name: {
            minLength: 'Должно содержать минимум 1 символ',
          },
        },
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
