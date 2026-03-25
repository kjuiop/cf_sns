import { 
  Controller, Get, Param, NotFoundException,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  Patch
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';


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
    @Body() req: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, req);
  }

  // 4) PATCH /posts/:id
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  patchPost(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdatePostDto,
  ) {
    return this.postsService.updatePost(userId, id, req);
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
