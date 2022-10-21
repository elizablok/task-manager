const objectionUnique = require('objection-unique');
const { ValidationError } = require('objection');
const BaseModel = require('./BaseModel.cjs');
const encrypt = require('../lib/secure.cjs');
const { getCustomData, getMessage } = require('./errorGetters.cjs');

const unique = objectionUnique({ fields: ['email'] });

// const getMappingKeyword = (data, fields) => fields.map(
//   (field) => [field, data[field].map(({ keyword }) => keyword)],
// );

// const getMappingMessage = (modal, fields, mappingKeyword) => {
//   const mappingMessageEntries = fields.map((field) => {
//     const keywords = mappingKeyword[field];
//     const localCodes = keywords.map((keyword) => getLocalCode(modal, field, keyword));
//     return [field, localCodes];
//   });
//   return Object.fromEntries(mappingMessageEntries);
// };

// const getCodedMessage = (mappingMessage, field, keyword) => mappingMessage[field][keyword];

module.exports = class User extends unique(BaseModel) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
        password: { type: 'string', minLength: 1 },
      },
    };
  }

  static createValidationError({ type, data }) {
    const fields = Object.keys(data);
    const message = getMessage(data, fields);
    return new ValidationError({
      type, message, data: getCustomData('users', data, fields), modelClass: this,
    });
  }

  static get relationMappings() {
    return {
      createdTasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Task.cjs',
        join: {
          from: 'users.id',
          to: 'tasks.creatorId',
        },
      },
      assignedTasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Task.cjs',
        join: {
          from: 'users.id',
          to: 'tasks.executorId',
        },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
};
