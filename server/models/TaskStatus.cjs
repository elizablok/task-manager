const objectionUnique = require('objection-unique');
const { ValidationError } = require('objection');
const BaseModel = require('./BaseModel.cjs');
const { getCustomData, getMessage } = require('./errorGetters.cjs');

const unique = objectionUnique({ fields: ['name'] });

module.exports = class TaskStatus extends unique(BaseModel) {
  static get tableName() {
    return 'statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
      },
    };
  }

  static createValidationError({ type, data }) {
    const fields = Object.keys(data);
    const message = getMessage(data, fields);
    return new ValidationError({
      type, message, data: getCustomData('statuses', data, fields), modelClass: this,
    });
  }

  static get relationMappings() {
    return {
      tasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Task.cjs',
        join: {
          from: 'statuses.id',
          to: 'tasks.statusId',
        },
      },
    };
  }
};
