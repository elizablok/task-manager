import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get('/labels', { name: 'labels', preValidation: app.authenticate }, async (req, reply) => {
      const labels = await
      app
        .objection
        .models
        .label
        .query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = await
      new app
        .objection
        .models
        .label();
      reply.render('labels/new', { label });
      return reply;
    })
    .get('/labels/:id/edit', { name: 'editedLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = await app
        .objection
        .models
        .label
        .query()
        .findById(req.params.id);
      reply.render('labels/edit', { label });
      return reply;
    })
    .post('/labels', { name: 'createLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = new app
        .objection
        .models
        .label();

      label.$set(req.body.data);

      try {
        const validLabel = await app
          .objection
          .models
          .label
          .fromJson(req.body.data);
        await app
          .objection
          .models
          .label
          .query()
          .insert(validLabel);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: data });
      }

      return reply;
    })
    .patch('/labels/:id', { name: 'updateLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = await app.objection.models.label
        .query()
        .findById(req.params.id);
      try {
        await label.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.labels.update.success'));
        return reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.update.error'));
        reply.render('labels/edit', { label, errors: data });
      }
      return reply;
    })
    .delete('/labels/:id', { name: 'deleteLabel', preValidation: app.authenticate }, async (req, reply) => {
      const deletedLabelId = req.params.id;
      const existingTasks = await app.objection.models.label.relatedQuery('tasks').for(deletedLabelId);

      if (!_.isEmpty(existingTasks)) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        return reply.redirect(app.reverse('labels'));
      }
      try {
        await app.objection.models.label.query().deleteById(deletedLabelId);
        req.flash('info', i18next.t('flash.labels.delete.success'));
        return reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        return reply.redirect(app.reverse('labels'));
      }
    });
};
