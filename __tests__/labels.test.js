import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test labels CRUD', () => {
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
      url: app.reverse('labels'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edited', async () => {
    const label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editedLabel', { id: label.id }),
      cookies,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.labels.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createLabel'),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const label = await models.label
      .query()
      .findOne({ name: params.name });
    expect(label).toMatchObject(params);
  });

  it('patch', async () => {
    const label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const params = testData.labels.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateLabel', { id: label.id }),
      payload: {
        data: params,
      },
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const updatedLabel = await models.label
      .query()
      .findById(label.id);
    expect(updatedLabel).toMatchObject(params);
  });

  it('delete', async () => {
    const label = await models.label
      .query()
      .findOne({ name: testData.labels.existing.name });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: label.id }),
      cookies,
    });

    expect(response.statusCode).toBe(302);
    const deletedLabel = await models.label
      .query()
      .findById(label.id);
    expect(deletedLabel).toBeUndefined();
  });

  afterEach(async () => {
    await knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
