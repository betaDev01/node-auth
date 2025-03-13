import { Body, Get, JsonController, Param, Params, Post, Put, QueryParam, Res } from 'routing-controllers';
import type { Response } from 'express';
import { AuthorizationService } from '../services/authorizationService.js';
import { AttemptsProps, GenerateTempProps, LoginProps, SignUpProps, ValidateToken } from '../types/auth.js';
import { SECRET_KEY } from '../configs/env.config.js';

@JsonController('/auth')
export class AuthorizationController {
  @Post('/signUp')
  async signUpRequest(@Body({ required: true }) bodyParams: SignUpProps, @Res() res: Response) {
    if (bodyParams.password !== bodyParams.confirmPassword) {
      return res.status(406).send({ message: 'Password and Confirm Password are not same.' });
    } else {
      const response = await AuthorizationService.getInstance().signUpService({ ...bodyParams, email: bodyParams.email.toLowerCase() });
      return res.status(response.status).send({ data: response?.data, message: response?.message });
    }
  }

  @Post('/signIn')
  async login(@Body() props: LoginProps, @Res() res: Response) {
    if (props.email || props.phoneNumber) {

      const response = await AuthorizationService.getInstance().signInService({ ...props, email: props?.email?.toLowerCase() });
      return res.status(response.status).send({ data: response?.data, message: response?.message });
    } else {
      return res.status(400).send({ message: 'UserName / Email-Id Missing.' });
    }
  }

  @Put('/update_attempts')
  async updateAttempts(@Body() props: AttemptsProps, @Res() res: Response) {
    if (props.attemptsCount) {
      const response = await AuthorizationService.getInstance().updateUserConfigurations({ attemptsCount: props.attemptsCount, linkValidUpto: props.linkValidUpto });
      return res.status(200).send({ messge: response.message })
    } else {
      return res.status(401).send({ messge: 'AttemptsCount missing in the payload' })

    }
  }

  @Post('/generate_temp_link')
  async generateTemporaryLink(@Body() props: GenerateTempProps, @Res() res: Response) {
    const { email, phoneNumber } = props;

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Email or phone number required' });
    }
    const response = await AuthorizationService.getInstance().generateOneTimeLink(props);

    return res.status(response.status).send({ data: response?.data, message: response.message })
  }


  @Get('/validate-link/:token')
  async validateToken(@Params() props: ValidateToken, @Res() res: Response) {
    console.log("🚀 ~ AuthorizationController ~ validateToken ~ props:", props)

    const response = await AuthorizationService.getInstance().validateUserLink(props);

    console.log("🚀 ~ AuthorizationController ~ validateToken ~ response:", response)

    return res.status(response.status).send({ data: response.data, message: response.message })
  }
}
