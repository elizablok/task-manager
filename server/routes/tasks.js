import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const {
        status, label, executor, isCreatorUser,
      } = req.query;

      const tasksQuery = app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor, labels]')
        .orderBy('created_at', 'desc');

      if (status) {
        tasksQuery.modify('filterByStatus', status);
      }
      if (label) {
        tasksQuery.modify('filterByLabel', label);
      }
      if (executor) {
        tasksQuery.modify('filterByExecutor', executor);
      }
      if (isCreatorUser) {
        tasksQuery.modify('filterByCreator', req.user.id);
      }

      const [taskStatuses, labels, users, tasks] = await Promise.all([
        app.objection.models.taskStatus.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
        tasksQuery,
      ]);

      reply.render('tasks/index', {
        taskStatuses, labels, users, tasks, filterOpts: req.query,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const [taskStatuses, labels, users] = await Promise.all([
        app.objection.models.taskStatus.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);

      const task = new app.objection.models.task();

      reply.render('tasks/new', {
        task, taskStatuses, labels, users,
      });

      return reply;
    })
    .get('/tasks/:id', { name: 'task', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task
        .query()
        .findById(req.params.id)
        .withGraphJoined('[status, creator, executor, labels]');

      reply.render('tasks/view', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editedTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = await app.objection.models.task
        .query()
        .findById(req.params.id)
        .withGraphJoined('[status, creator, executor, labels]');

      const [taskStatuses, labels, users] = await Promise.all([
        app.objection.models.taskStatus.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);

      reply.render('tasks/edit', {
        task, taskStatuses, labels, users,
      });
    })
    .post('/tasks', { name: 'createTask', preValidation: app.authenticate }, async (req, reply) => {
      const labelsIds = _.toArray(_.get(req.body.data, 'labels', []));
      const currentLabels = await app.objection.models.label
        .query()
        .findByIds(labelsIds);
      const taskData = {
        name: req.body.data.name,
        description: req.body.data.description,
        creatorId: Number(req.user.id),
        statusId: Number(req.body.data.statusId),
        executorId: !req.body.data.executorId ? null : Number(req.body.data.executorId),
        labels: currentLabels,
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
        const [taskStatuses, labels, users] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);

        req.flash('error', i18next.t('flash.tasks.create.failure'));
        reply.render('tasks/new', {
          task: req.body.data, errors: data, taskStatuses, labels, users,
        });
      }

      return reply;
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      const labelIds = _.toArray(_.get(req.body.data, 'labels', []));
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
        labels: labelIds.map((labelId) => ({ id: labelId })),
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
        const [taskStatuses, labels, users] = await Promise.all([
          app.objection.models.taskStatus.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);

        task.$set(taskData);

        req.flash('error', i18next.t('flash.tasks.update.error'));
        reply.render('tasks/edit', {
          task, errors: data, taskStatuses, labels, users,
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
          await task.$relatedQuery('labels', trx).unrelate();
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
