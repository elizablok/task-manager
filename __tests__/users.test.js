// @ts-check

import _ from 'lodash';
import fastify from 'fastify';
import i18next from 'i18next';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  let cookies;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    cookies = await signIn(app, testData.users.existing);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('edited', async () => {
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editedUser', { id: user.id }),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
    expect(response.text.includes(i18next.t('flash.users.create.success'))).toBeTruthy();
  });

  it('edit', async () => {
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const params = testData.users.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('editUser', { id: user.id }),
      payload: {
        data: params,
      },
      cookies,
    });
  
    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const updatedUser = await models.user
      .query()
      .findById(user.id);
    expect(updatedUser).toMatchObject(expected);
    expect(response.text.includes(i18next.t('flash.users.update.success'))).toBeTruthy();
  });

  it('delete', async () => {
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: user.id }),
      cookies,
    });
  
    expect(response.statusCode).toBe(302);
    const deletedUser = await models.user.query().findById(user.id);
    expect(deletedUser).toBeUndefined();
    expect(response.text.includes(i18next.t('flash.users.delete.success'))).toBeTruthy();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('test users CRUD with errors', () => {
  let app;
  let knex;
  let models;
  let cookies;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({ logger: { prettyPrint: true } });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    cookies = await signIn(app, testData.users.wrongExisting);
  });

  it('edited', async () => {
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editedUser', { id: user.id }),
      cookies,
    });

    expect(response.statusCode).toBe(422);
    expect(response.text.includes(i18next.t('flash.users.edit.failure'))).toBeTruthy();
  });

  it('create', async () => {
    const params = testData.users.wrongNew;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(422);
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toBeUndefined();
    expect(response.text.includes(i18next.t('flash.users.create.failure'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.firstName'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.lastName'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.email'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.password'))).toBeTruthy();
  });

  it('edit', async () => {
    const user = await models.user
      .query()
      .findOne({ email: testData.users.wrongExisting.email });
    const params = testData.users.wrongNew;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('editUser', { id: user.id }),
      payload: {
        data: params,
      },
      cookies,
    });
  
    expect(response.statusCode).toBe(422);
    const updatedUser = await models.user
      .query()
      .findById(user.id);
    expect(updatedUser).toBeUndefined();
    expect(response.text.includes(i18next.t('flash.users.update.failure'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.firstName'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.lastName'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.email'))).toBeTruthy();
    expect(response.text.includes(i18next.t('views.users.errors.password'))).toBeTruthy();
  });

  it('delete', async () => {
    const user = await models.user
      .query()
      .findOne({ email: testData.users.existing.email });
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: user.id }),
      cookies,
    });
  
    expect(response.statusCode).toBe(422);
    const deletedUser = await models.user.query().findById(user.id);
    expect(deletedUser).toMatchObject(user);
    expect(response.text.includes(i18next.t('flash.users.delete.failure'))).toBeTruthy();
  });
})
