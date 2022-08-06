import fastify from 'fastify';
import _ from 'lodash';

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

  it('filter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      query: {
        status: '1',
        executor: '1',
        label: '1',
        isCreatorUser: 'on',
      },
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
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);

    const task = await models.task.query().findById(4);
    expect(task).toMatchObject(_.omit(params, 'labels'));

    const labels = await task.$relatedQuery('labels');
    const expectedLabels = await models.label.query().findByIds(params.labels);
    expect(labels).toMatchObject(expectedLabels);
  });

  it('update', async () => {
    const oldParams = testData.tasks.existing;
    const newParams = testData.tasks.updated;
    const { id } = await models.task.query().findOne('name', oldParams.name);

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id }),
      payload: {
        data: newParams,
      },
      cookies,
    });
    expect(responseUpdate.statusCode).toBe(302);

    const task = await models.task.query().findById(id);
    expect(task).toMatchObject(_.omit(newParams, 'labels'));

    const labels = await task.$relatedQuery('labels').orderBy('id');
    const expectedLabels = await models.label.query().findByIds(newParams.labels);
    const labelsIds = expectedLabels.map((e) => e.id);
    const updatedLabels = _.uniqBy(labels, 'id').filter((e) => labelsIds.includes(e.id));
    expect(updatedLabels).toMatchObject(expectedLabels);
  });

  it('delete', async () => {
    const params = testData.tasks.existing;
    const { id } = await models.task.query().findOne('name', params.name);

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id }),
      cookies,
    });

    expect(response.statusCode).toBe(302);

    expect(await models.task.query().findById(id)).toBeUndefined();
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
