import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../configs/env.config.js';

export const generateResponseToken = (props: { [key: string]: string | number | null }) => {
  try {
    return jwt.sign(props, `${SECRET_KEY}`);
  } catch (e) {
    console.error('Error Occured - Token generation.', e);
  }
}
