const getLocalCode = (modal, field, keyword) => `views.${modal}.errors.${field}.${keyword}`;

const getCustomData = (modal, data, fields) => {
  const newDataEntries = fields.map(
    (field) => [field, data[field].map(
      (err) => ({ ...err, message: getLocalCode(modal, field, err.keyword) }),
    )],
  );
  return Object.fromEntries(newDataEntries);
};

const getMessage = (data, fields) => fields.map(
  (field) => `${field}: ${data[field].map(({ message }) => message).join(', ')}`,
);

module.exports = { getCustomData, getMessage };
