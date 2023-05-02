import { Test, TestingModule } from '@nestjs/testing';
import { MessagingGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

describe('MessagesGateway', () => {
  let gateway: MessagingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagingGateway, MessagesService],
    }).compile();

    gateway = module.get<MessagingGateway>(MessagingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
