import { Body, Get, JsonController, Post, Res, UseBefore } from "routing-controllers";
import type { Response } from "express";
import { AuthorizationMiddleware } from "../middlewares/authenticationMiddleware.js";
import { GenerateTempProps } from "../types/auth.js";
import { AuthorizationService } from "../services/authorizationService.js";

@UseBefore(AuthorizationMiddleware)
@JsonController()
export class ServiceController {
  @Get('/get-time')
  async getTime(@Res() res: Response) {
    return res.status(200).send({ serverTime: new Date().toISOString() });
  }
}

@JsonController()
export class AdminController {
  @Post('/kickout-user')
  async kickOutUser(@Body() params: GenerateTempProps, @Res() res: Response) {
    const response = await AuthorizationService.getInstance().kickOutUser(params);
    return res.status(response.status).send({ message: response.message });


  }
}