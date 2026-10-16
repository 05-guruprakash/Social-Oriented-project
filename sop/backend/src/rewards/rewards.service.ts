import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CATALOG = [
  { id: 'plant', title: 'Eco-Friendly Plant', cost: 100 },
  { id: 'bag', title: 'Eco Shopping Bag', cost: 150 },
  { id: 'gift', title: 'Community Gift', cost: 250 },
];

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async findMine(userId: string) {
    const [history, user] = await Promise.all([
      this.prisma.rewardTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
    ]);
    return { balance: user?.points ?? 0, history };
  }

  getCatalog() {
    return CATALOG;
  }

  async redeem(userId: string, rewardId: string) {
    const reward = CATALOG.find((r) => r.id === rewardId);
    if (!reward) throw new NotFoundException('Reward not found');

    return this.prisma.$transaction(async (tx) => {
      const res = await tx.user.updateMany({
        where: { id: userId, points: { gte: reward.cost } },
        data: { points: { decrement: reward.cost } },
      });
      if (res.count === 0) throw new BadRequestException('Not enough points');

      await tx.rewardTransaction.create({
        data: { userId, points: -reward.cost, reason: `Redeemed: ${reward.title}` },
      });

      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      return { balance: user?.points ?? 0, redeemed: reward.title };
    });
  }
}