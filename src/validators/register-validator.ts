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
    notEmpty: {
      errorMessage: 'Password is necessary!',
    },
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password length must be atleast 8 characters!',
    },
  },
  name: {
    errorMessage: 'Name is necessary!',
    notEmpty: true,
  },
});

//export default [body("email").notEmpty().withMessage("Email is Required!")];
