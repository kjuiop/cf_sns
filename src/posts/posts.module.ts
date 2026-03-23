import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

// 모듈에는 클래스를 넣는다. (인스턴스가 아닌), 인스턴스는 DI 시점에 IoC 컨테이너가 생성한다.
@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
