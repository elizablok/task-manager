import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses', preValidation: app.authenticate }, async (req, reply) => {
      const taskStatuses = await
      app
        .objection
        .models
        .taskStatus
        .query();
      reply.render('statuses/index', { taskStatuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.authenticate }, async (req, reply) => {
      const taskStatus = await
      new app
        .objection
        .models
        .taskStatus();
      reply.render('statuses/new', { taskStatus });
    })
    .get('/statuses/:id/edit', { name: 'editedStatus', preValidation: app.authenticate }, async (req, reply) => {
      const taskStatus = await app
        .objection
        .models
        .taskStatus
        .query()
        .findById(req.params.id);
      reply.render('statuses/edit', { taskStatus });
      return reply;
    })
    .post('/statuses', { name: 'createStatus', preValidation: app.authenticate }, async (req, reply) => {
      const taskStatus = new app
        .objection
        .models
        .taskStatus();

      taskStatus.$set(req.body.data);

      try {
        const validTaskStatus = await app
          .objection
          .models
          .taskStatus
          .fromJson(req.body.data);
        await app
          .objection
          .models
          .taskStatus
          .query()
          .insert(validTaskStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { taskStatus, errors: data });
      }

      return reply;
    })
    .patch('/statuses/:id', { name: 'updateStatus', preValidation: app.authenticate }, async (req, reply) => {
      const taskStatus = await app.objection.models.taskStatus
        .query()
        .findById(req.params.id);
      try {
        await taskStatus.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        return reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.update.error'));
        reply.render('statuses/edit', { taskStatus, errors: data });
      }
      return reply;
    })
    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: app.authenticate }, async (req, reply) => {
      const deletedTaskStatusId = req.params.id;
      const tasksInStatus = await app.objection.models.task.query().where('statusId', deletedTaskStatusId);

      if (!_.isEmpty(tasksInStatus)) {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        return reply.redirect(app.reverse('statuses'));
      }

      try {
        await app.objection.models.taskStatus.query().deleteById(deletedTaskStatusId);
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        return reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        return reply.redirect(app.reverse('statuses'));
      }
    });
};
