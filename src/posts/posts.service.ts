import { 
  NotFoundException
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';

/**
 * author: string;
 * title: string;
 * content: string;
 * likeCount: number;
 * commentCount: number;
 */

export interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel)
        private readonly postRepository: Repository<PostsModel>
    ) {
    }

    async getAllPosts() {        
        return await this.postRepository.find({
            order: {
                id: 'DESC',
            },
            relations: {
                author: true,
            }
        });
    }

    // 1) 오름차순으로 정렬하는 페이지네이션만 구현
    async paginatePosts(dto: PaginatePostDto) {
        const posts = await this.postRepository.find({
            where: {
                id: MoreThan(dto.where__id_more_than ?? 0),
            },
            order: {
                createdAt: dto.order__createdAt,
            },
            take: dto.take,
        });

        /**
         * Response
         * 
         * data: Data[],
         * cursor: {
         *   after: 마지막 Data의 ID
         * },
         * count: 응답한 데이터의 갯수
         * next: 다음 요청을 할 때 사용할 URL 
         */
        return {
            data: posts,
        }
    }

    async getPostById(id: number) {
        const post = await this.postRepository.findOne({
            where: {
                id,
            },
            relations: {
                author: true,
            }
        });
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }
        return post;
    }

    async createPost(authorId: number, postDto: CreatePostDto) {
        // 1) create -> 저장할 객체를 생성한다.
        // 2) save -> 객체를 저장한다.

        const post = this.postRepository.create({
            author: {
                id: authorId,
            },
            ...postDto,
            likeCount: 0,
            commentCount: 0,
        });

        const newPost = await this.postRepository.save(post);
        return newPost;
    }

    async updatePost(userId: number, id: number, updatePostDto: UpdatePostDto) {
        
        // save 의 기능
        // 1) 만약에 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성한다.
        // 2) 만약에 데이터가 존재한다면 (같은 id 기준으로) 업데이트한다.
        
        const post = await this.postRepository.findOne({
            where: {
                id,
            }
        });

        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        if (post.author.id !== userId) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        if (updatePostDto.title) {
            post.title = updatePostDto.title;
        }
        if (updatePostDto.content) {
            post.content = updatePostDto.content;
        }

        const newPost = await this.postRepository.save(post);
        return newPost;
    }

    async deletePost(id: number) {
        const post = this.postRepository.findOne({
            where: {
                id,
            },
        });

        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        await this.postRepository.delete(id);
        return id;
    }

    async generatePosts(userId: number) {
        for (let i=0; i<100; i++) {
            await this.createPost(userId, {
                title: `임의로 생성된 게시글 ${i + 1}`,
                content: `임의로 생성된 게시글 내용 ${i + 1}`,
            });
        }
    }
}
