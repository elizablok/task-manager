import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', { name: 'editedUser', preValidation: app.authenticate }, async (req, reply) => {
      const editUserId = req.params.id;
      if (Number(editUserId) !== Number(req.user.id)) {
        req.flash('error', i18next.t('flash.users.edit.failure'));
        return reply.redirect(app.reverse('users'));
      }
      const user = await app.objection.models.user.query().findById(editUserId);
      reply.render('users/edit', { user });
      return reply;
    })
    .post('/users', { name: 'postUser' }, async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);
      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.failure'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .patch('/users/:id', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      if (Number(req.params.id) !== Number(req.user.id)) {
        req.flash('error', i18next.t('flash.users.update.failure'));
        return reply.redirect(app.reverse('users'));
      }
      const user = await app.objection.models.user.query().findById(req.params.id);
      try {
        await user.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.update.success'));
        return reply.redirect(app.reverse('users'));
      } catch ({ data }) {
        user.$set(req.body.data);
        req.flash('error', i18next.t('flash.users.update.failure'));
        reply.render('users/edit', { user, errors: data });
      }
      return reply;
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      const deleteUserId = req.params.id;
      const createdTasks = await app.objection.models.task.query().where('creatorId', deleteUserId);
      const assignedTasks = await app.objection.models.task.query().where('executorId', deleteUserId);

      if (!_.isEmpty(createdTasks) && !_.isEmpty(assignedTasks)) {
        req.flash('error', i18next.t('flash.users.delete.failure'));
        return reply.redirect(app.reverse('users'));
      }

      if (Number(deleteUserId) !== Number(req.user.id)) {
        req.flash('error', i18next.t('flash.users.delete.failure'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      try {
        await app.objection.models.user.query().deleteById(deleteUserId);
        await req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        return reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.delete.failure'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
    });
};
