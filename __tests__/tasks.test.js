import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test tasks CRUD', () => {
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
      url: app.reverse('tasks'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('view', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('task', { id: task.id }),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edited', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editedTask', { id: task.id }),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.tasks.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createTask'),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const taskStatus = await models.task
      .query()
      .findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);
  });

  it('patch', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });

    const params = testData.tasks.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: task.id }),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const updatedTask = await models.task
      .query()
      .findById(task.id);
    expect(updatedTask).toMatchObject(params);
  });

  it('delete', async () => {
    const task = await models.task
      .query()
      .findOne({ name: testData.tasks.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: task.id }),
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const deletedTask = await models.task
      .query()
      .findById(task.id);
    expect(deletedTask).toBeUndefined();
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
