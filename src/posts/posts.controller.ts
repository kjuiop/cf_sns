import { 
  Controller, Get, Param
} from '@nestjs/common';
import { PostsService } from './posts.service';

/**
 * author: string;
 * title: string;
 * content: string;
 * likeCount: number;
 * commentCount: number;
 */

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts : PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 10000000,
    commentCount: 50000,
  },
  {
    id: 2,
    author: 'newjeans_official',
    title: '뉴진스 헤린',
    content: '노래 연습하는 헤린',
    likeCount: 10000000,
    commentCount: 50000,
  },
  {
    id: 3,
    author: 'blankpink_official',
    title: '블랭핑크 로제',
    content: '종합운동장에서 공연중인 로제',
    likeCount: 10000000,
    commentCount: 50000,
  }
]

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  @Get()
  getPosts(): PostModel[] {
    return posts;
  }

  // 2) GET /posts/:id
  @Get(':id')
  getPost(@Param('id') id: string) {
    return posts.find(post => post.id === Number(id));
  }

  // 3) POST /posts
  // 4) PUT /posts/:id
  // 5) DELETE /posts/:id
}
