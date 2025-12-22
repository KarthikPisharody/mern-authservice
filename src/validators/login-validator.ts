import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    notEmpty: {
      errorMessage: 'Email is required!',
    },
    trim: true,
    isEmail: {
      errorMessage: 'Email is invalid!',
    },
  },
  password: {
    trim: true,
    notEmpty: {
      errorMessage: 'Password is necessary!',
    },
  },
});
