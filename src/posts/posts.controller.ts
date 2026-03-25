import { 
  Controller, Get, Param, NotFoundException,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  @Post()
  @UseGuards(AccessTokenGuard)
  postPost(
    @User('id') userId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(userId, title, content);
  }

  // 4) PUT /posts/:id
  @Put(':id')
  @UseGuards(AccessTokenGuard)
  putPost(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }

  // 5) DELETE /posts/:id
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  deletePost(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.postsService.deletePost(id);
  }
}
