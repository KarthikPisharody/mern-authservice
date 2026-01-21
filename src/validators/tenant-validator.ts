import { checkSchema } from 'express-validator';

export default checkSchema({
  name: {
    notEmpty: {
      errorMessage: 'Tenant name is empty!',
    },
    trim: true,
  },
  address: {
    notEmpty: {
      errorMessage: 'Tenant name is empty!',
    },
    trim: true,
  },
});
