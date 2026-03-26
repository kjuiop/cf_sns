import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';

// 모듈에는 클래스를 넣는다. (인스턴스가 아닌), 인스턴스는 DI 시점에 IoC 컨테이너가 생성한다.
@Module({
  imports: [
    // forRoot : typeORM 모듈을 연결할 때 사용
    // forFeature : typeORM 모듈을 사용할 때, 어떤 엔티티를 사용할지 명시할 때 사용
    TypeOrmModule.forFeature([
      PostsModel,
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
