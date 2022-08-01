import _ from 'lodash';
import fastify from 'fastify';
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

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('postUser'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user
      .query()
      .findOne({ email: params.email });
    expect(user).toMatchObject(expected);
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
  });

  afterEach(async () => {
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});

// describe('test users CRUD with errors', () => {
//   let app;
//   let knex;
//   let models;
//   let cookies;
//   const testData = getTestData();

//   beforeAll(async () => {
//     app = fastify({ logger: { prettyPrint: true } });
//     await init(app);
//     knex = app.objection.knex;
//     models = app.objection.models;
//   });

//   beforeEach(async () => {
//     await knex.migrate.latest();
//     await prepareData(app);
//     cookies = await signIn(app, testData.users.wrongExisting);
//   });

//   it('edited', async () => {
//     const user = await models.user
//       .query()
//       .findOne({ email: testData.users.existing.email });
//     const response = await app.inject({
//       method: 'GET',
//       url: app.reverse('editedUser', { id: user.id }),
//       cookies,
//     });

//     expect(response.statusCode).toBe(422);
//   });

//   it('create', async () => {
//     const params = testData.users.wrongNew;
//     const response = await app.inject({
//       method: 'POST',
//       url: app.reverse('users'),
//       payload: {
//         data: params,
//       },
//     });

//     expect(response.statusCode).toBe(422);
//     const user = await models.user.query().findOne({ email: params.email });
//     expect(user).toBeUndefined();
//   });

//   it('edit', async () => {
//     const user = await models.user
//       .query()
//       .findOne({ email: testData.users.wrongExisting.email });
//     const params = testData.users.wrongNew;

//     const response = await app.inject({
//       method: 'PATCH',
//       url: app.reverse('editUser', { id: user.id }),
//       payload: {
//         data: params,
//       },
//       cookies,
//     });
  
//     expect(response.statusCode).toBe(422);
//     const updatedUser = await models.user
//       .query()
//       .findById(user.id);
//     expect(updatedUser).toBeUndefined();
//   });

//   it('delete', async () => {
//     const user = await models.user
//       .query()
//       .findOne({ email: testData.users.existing.email });
//     const response = await app.inject({
//       method: 'DELETE',
//       url: app.reverse('deleteUser', { id: user.id }),
//       cookies,
//     });
  
//     expect(response.statusCode).toBe(422);
//     const deletedUser = await models.user.query().findById(user.id);
//     expect(deletedUser).toMatchObject(user);
//   });
//   afterEach(async () => {
//     await knex('users').truncate();
//   });

//   afterAll(async () => {
//     await app.close();
//   });
// })
