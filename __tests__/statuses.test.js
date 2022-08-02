import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
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
      url: app.reverse('statuses'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edited', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editedStatus', { id: taskStatus.id }),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.statuses.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createStatus'),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);
  });

  it('patch', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const params = testData.statuses.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateStatus', { id: taskStatus.id }),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const updatedStatus = await models.taskStatus
      .query()
      .findById(taskStatus.id);
    expect(updatedStatus).toMatchObject(params);
  });

  it('delete', async () => {
    const taskStatus = await models.taskStatus
      .query()
      .findOne({ name: testData.statuses.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: taskStatus.id }),
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const deletedStatus = await models.taskStatus
      .query()
      .findById(taskStatus.id);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
