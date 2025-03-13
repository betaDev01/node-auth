import { Get, JsonController, Post, Res } from "routing-controllers";
import type { Response } from "express";

@JsonController('')
export class ServerController {
  @Get('/health')
  async checkApplicationHealth(@Res() res: Response) {
    return res.send({ message: "Server Up and Running" })
  }
}