const _ = require('lodash');
const { ValidationError } = require('objection');
const BaseModel = require('./BaseModel.cjs');
const { getCustomData, getMessage } = require('./errorGetters.cjs');

module.exports = class Task extends BaseModel {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer', minimum: 1 },
        creatorId: { type: 'integer', minimum: 1 },
        executorId: { type: ['integer', 'null'] },
      },
    };
  }

  static createValidationError({ type, data }) {
    const fields = Object.keys(data);
    const message = getMessage(data, fields);
    return new ValidationError({
      type, message, data: getCustomData('tasks', data, fields), modelClass: this,
    });
  }

  $parseJson(json, opt) {
    json = super.$parseJson(json, opt);
    const newJson = {
      id: opt.id ? Number(opt.id) : null,
      name: json.name,
      description: json.description,
      creatorId: Number(opt.creatorId),
      statusId: json.statusId ? Number(json.statusId) : null,
      executorId: json.executorId ? Number(json.executorId) : null,
      labels: opt.labels ?? null,
    };
    return !newJson.id ? _.omit(newJson, ['id']) : newJson;
  }

  static get relationMappings() {
    return {
      status: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'TaskStatus.cjs',
        join: {
          from: 'tasks.statusId',
          to: 'statuses.id',
        },
      },
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'User.cjs',
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },
      executor: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'User.cjs',
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
      labels: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: 'Label.cjs',
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.taskId',
            to: 'tasks_labels.labelId',
          },
          to: 'labels.id',
        },
      },
    };
  }

  static get modifiers() {
    return {
      filterByStatus(query, statusId) {
        query.where({ statusId });
      },

      filterByExecutor(query, executorId) {
        query.where({ executorId });
      },

      filterByLabel(query, labelId) {
        query.where({ labelId });
      },

      filterByCreator(query, creatorId) {
        query.where({ creatorId });
      },
    };
  }
};
