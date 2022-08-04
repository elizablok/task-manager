import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const {
        status, executor, isCreatorUser,
      } = req.query;

      const tasksQuery = app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor]')
        .orderBy('created_at', 'desc');

      if (status) {
        tasksQuery.modify('filterByStatus', status);
      }
      if (executor) {
        tasksQuery.modify('filterByExecutor', executor);
      }
      if (isCreatorUser) {
        tasksQuery.modify('filterByCreator', req.user.id);
      }

      const [taskStatuses, users, tasks] = await Promise.all([
        app.objection.models.taskStatus.query(),
        app.objection.models.user.query(),
        tasksQuery,
      ]);

      reply.render('tasks/index', {
        taskStatuses, users, tasks, filterOpts: req.query,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const [taskStatuses, users] = await Promise.all([
        app.objection.models.taskStatus.query(),
        app.objection.models.user.query(),
      ]);

      const task = new app.objection.models.task();

      reply.render('tasks/new', {
        task, taskStatuses, users,
      });

      return reply;
    })
    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task
        .query()
        .findById(req.params.id)
        .withGraphJoined('[status, creator, executor]');

      reply.render('tasks/view', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editedTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task
        .query()
        .findById(req.params.id)
        .withGraphJoined('[status, creator, executor]');

      const [taskStatuses, users] = await Promise.all([
        app.objection.models.taskStatus.query(),
        app.objection.models.user.query(),
      ]);

      reply.render('tasks/edit', {
        task, taskStatuses, users,
      });
    })
    .post('/tasks', { name: 'createTask', preValidation: app.authenticate }, async (req, reply) => {
      const taskData = {
        name: req.body.data.name,
        description: req.body.data.description,
        creatorId: Number(req.user.id),
        statusId: Number(req.body.data.statusId),
        executorId: !req.body.data.executorId ? null : Number(req.body.data.executorId),
      };

      try {
        await app.objection.models.task.transaction(async (trx) => {
          await app.objection.models.task
            .query(trx)
            .insertGraph(taskData, { relate: true });
        });

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        const [taskStatuses, users] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
        ]);

        req.flash('error', i18next.t('flash.tasks.create.failure'));
        reply.render('tasks/new', {
          task: req.body.data, errors: data, taskStatuses, users,
        });
      }

      return reply;
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task
        .query()
        .findById(req.params.id);

      const taskData = {
        id: Number(req.params.id),
        name: req.body.data.name,
        description: req.body.data.description,
        creatorId: Number(req.user.id),
        statusId: Number(req.body.data.statusId),
        executorId: !req.body.data.executorId ? null : Number(req.body.data.executorId),
      };

      try {
        await app.objection.models.task.transaction(async (trx) => {
          const updatedTask = await app.objection.models.task
            .query(trx)
            .upsertGraph(taskData, {
              relate: true, unrelate: true, noDelete: true,
            });
          return updatedTask;
        });
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        const [taskStatuses, users] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.user.query(),
        ]);

        task.$set(taskData);

        req.flash('error', i18next.t('flash.tasks.update.error'));
        reply.render('tasks/edit', {
          task, errors: data, taskStatuses, users,
        });
      }
      return reply;
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task
        .query()
        .findById(req.params.id);

      if (task.creatorId !== req.user.id) {
        req.flash('error', i18next.t('flash.tasks.delete.failure'));
        return reply.redirect(app.reverse('tasks'));
      }

      try {
        await app.objection.models.task.transaction(async (trx) => {
          await task.$query(trx).delete();
        });

        req.flash('info', i18next.t('flash.tasks.delete.success'));
        return reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.delete.failure'));
        return reply.redirect(app.reverse('tasks'));
      }
    });
};
