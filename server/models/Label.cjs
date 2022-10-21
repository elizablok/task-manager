const objectionUnique = require('objection-unique');
const { ValidationError } = require('objection');
const { getCustomData, getMessage } = require('./errorGetters.cjs');
const BaseModel = require('./BaseModel.cjs');

const unique = objectionUnique({ fields: ['name'] });

module.exports = class Label extends unique(BaseModel) {
  static get tableName() {
    return 'labels';
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
      type, message, data: getCustomData('labels', data, fields), modelClass: this,
    });
  }

  static get relationMappings() {
    return {
      tasks: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: 'Task.cjs',
        join: {
          from: 'labels.id',
          through: {
            from: 'tasks_labels.labelId',
            to: 'tasks_labels.taskId',
          },
          to: 'tasks.id',
        },
      },
    };
  }
};
