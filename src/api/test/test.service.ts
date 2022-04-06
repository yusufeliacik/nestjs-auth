import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  async test() {
    return 'test';
  }
}
