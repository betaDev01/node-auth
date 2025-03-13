import bcrypt from 'bcrypt';
import { SECRET_KEY, BCRYPT_SALT } from '../configs/env.config.js';
import jwt from 'jsonwebtoken';
import { BadRequestError } from 'routing-controllers';
import { ConnectDB } from '../db/index.js';
import { AttemptsProps, GenerateTempProps, LoginProps, SignUpProps, ValidateToken } from '../types/auth.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthorizationService {
  private static instance: AuthorizationService | null = null;

  private client = ConnectDB.getDBInstance();


  public static getInstance() {
    if (!this.instance) {
      this.instance = new AuthorizationService();
    }
    return this.instance;
  }

  // --------------------------------------------------------------------------------------------------------------------------------------------------
  public async generateResponseToken(props: { [key: string]: string | number | null }, expTime?: string) {
    try {
      return jwt.sign(props, `${SECRET_KEY}`, { expiresIn: '1h' })
    } catch (e) {
      console.error('Error Occured - Token generation.', e);
    }
  }

  // --------------------------------------------------------------------------------------------------------------------------------------------------
  public async signUpService(props: SignUpProps) {
    try {

      const query = `select * from "user_details" where (email = '${props.email}' or phone_number = '${props.phoneNumber}') and is_locked = false`;

      const checkUser = await this.client.query(query);

      if (checkUser.rowCount) {
        return { message: `Email / Phone number already taken`, status: 400 };
      } else {
        const encryptedPassword = await bcrypt.hash(props.password, `${BCRYPT_SALT}`);
        const token = await this.generateResponseToken({ email: props.email, phoneNumber: props.phoneNumber })

        const insertQuery = `insert into user_details (email, phone_number, "password", is_admin, user_token) 
        values ('${props.email}', '${props.phoneNumber}', '${encryptedPassword}', ${props.isAdmin || false}, '${token}')
         returning *`;
        const response = await this.client.query(insertQuery);

        return { data: { ...response.rows[0], password: '*******' }, message: 'User Created successfully', status: 201 };
      }
    } catch (e) {
      console.error('Error Occured while Signing Up.', e);
      throw new BadRequestError(e instanceof Error ? e.message : '');
    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------------------------

  public async signInService(props: LoginProps) {
    try {
      const condition = props?.email ? `email = '${props.email}'` : `phone_number = '${props.phoneNumber}'`;

      const getUserDetailsQuery = `SELECT * from user_details where ${condition} and is_locked = false`;

      const getUserDetailsRes = (await this.client.query(getUserDetailsQuery)).rows;

      if (getUserDetailsRes && getUserDetailsRes.length > 0) {
        const isValid = await bcrypt.compare(props.password, getUserDetailsRes[0].password);
        if (isValid) {
          const token = await this.generateResponseToken({ email: getUserDetailsRes[0].email, phoneNumber: getUserDetailsRes[0].phone_number });

          const updateUserTokenQuery = `update user_details set user_token = '${token}' where email = '${getUserDetailsRes[0].email}';`

          this.client.query(updateUserTokenQuery);

          return { message: 'Login Success', data: { token }, status: 200 }
        } else {
          return { message: "Username or password is incorrect", status: 401 }
        }
      } else {
        return { message: "User Details not found", status: 404 }
      }

    } catch (e) {
      console.error('Error Occured while logging In.', e);
      throw new BadRequestError(e instanceof Error ? e.message : '');
    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------------------------
  public async getUserConfiguration() {
    try {

      const query = `select * from "user_configuration" order by created_at desc limit 1;`;

      const response = await this.client.query(query);

      return response?.rows?.length > 0 ? response.rows[0] : {}
    } catch (e) {
      console.error('Error Occured - getUserConfiguration.', e);
    }
  }

  // --------------------------------------------------------------------------------------------------------------------------------------------------

  public async updateUserConfigurations(props: AttemptsProps) {
    try {
      const query = `insert into user_configuration (number_of_attempts, link_duration ) values ('${props.attemptsCount}', '${props.linkValidUpto || null}');`

      await this.client.query(query);
      return { message: 'user configuration updated successfully' }
    } catch (e) {
      console.error('Error Occured while Updating Number of Attempts.', e);
      throw new BadRequestError(e instanceof Error ? e.message : '');
    }
  }

  // --------------------------------------------------------------------------------------------------------------------------------------------------
  public async generateOneTimeLink(props: GenerateTempProps) {
    try {

      const userConfig = await this.getUserConfiguration();


      const condition = props?.email ? `email = '${props.email}'` : `phone_number = '${props.phoneNumber}'`;

      const getUserDetailsQuery = `SELECT * from user_details where ${condition} and is_locked = false`;

      const getUserDetailsRes = (await this.client.query(getUserDetailsQuery)).rows;

      if (getUserDetailsRes && getUserDetailsRes.length > 0) {
        const userId = uuidv4();
        const token = jwt.sign({ userId, userName: props.email || props.phoneNumber }, `${SECRET_KEY}`, { expiresIn: userConfig?.link_duration || '10m' });
        const oneTimeLink = `localhost:4000/auth/validate-link/${token}`;

        const insertUserLinkQuery = `insert into user_interview_link (email, phone_number, link) values ('${props.email || null}', '${props.phoneNumber || null}', '${oneTimeLink}')`

        await this.client.query(insertUserLinkQuery);

        return { message: 'link generated successfully', data: { link: oneTimeLink }, status: 200 }
      } else {
        return { message: 'User Not found', data: {}, status: 404 }
      }
    } catch (e) {
      console.error('Error Occured - Token generation.', e);
      return { message: `Error Occured`, status: 400 }
    }
  }

  // --------------------------------------------------------------------------------------------------------------------------------------------------
  public async validateUserLink(props: ValidateToken) {
    try {

      const query = `select * from "user_interview_link" where link = 'localhost:4000/auth/validate-link/${props.token}' and is_valid = true;`;

      const linkResponse = (await this.client.query(query))?.rows[0];

      if (linkResponse) {
        const condition = linkResponse?.email ? `email = '${linkResponse.email}'` : `phone_number = '${linkResponse?.phone_number}'`;

        const getUserDetailsQuery = `SELECT * from user_details where ${condition} and is_locked = false`;

        const response = await this.client.query(getUserDetailsQuery);

        const updateUserLink = `update user_interview_link set is_valid = false where link = 'localhost:4000/auth/validate-link/${props.token}';`;

        await this.client.query(updateUserLink);

        return { data: response?.rows?.length > 0 ? response.rows[0] : {}, message: "details fetched successfully", status: 200 }
      } else {
        return { status: 404, message: 'Token not found.' }
      }
    } catch (e) {
      console.error('Error Occured - generateUserLink.', e);
      return { status: 400, message: 'Something went wrong validateUserLink' }
    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------------------------

  public async kickOutUser(props: GenerateTempProps) {
    try {
      const condition = props?.email ? `email = '${props.email}'` : `phone_number = '${props?.phoneNumber}'`;
      const updateUserQuery = `update user_details set is_locked = true where ${condition}`;

      await this.client.query(updateUserQuery);
      return { message: 'User got kicked out successfully.', status: 200 }
    } catch (e) {
      console.error('Error Occured - kickOutUser.', e);
      return { message: 'Something went wrong in kickOutUser.', status: 400 }

    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------------------------

}
