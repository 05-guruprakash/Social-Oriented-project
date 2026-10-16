import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class RedeemDto {
  @IsString()
  rewardId: string;
}

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Get('mine')
  myRewards(@Request() req: any) {
    return this.rewardsService.findMine(req.user.userId);
  }

  @Get('catalog')
  catalog() {
    return this.rewardsService.getCatalog();
  }

  @Post('redeem')
  redeem(@Request() req: any, @Body() dto: RedeemDto) {
    return this.rewardsService.redeem(req.user.userId, dto.rewardId);
  }
}