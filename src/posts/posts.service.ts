import { 
  NotFoundException
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { HOST, PROTOCOL } from 'src/common/const/env.const';

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
        const where : FindOptionsWhere<PostsModel> = {};

        if (dto.where__id_less_than) {
            where.id = LessThan(dto.where__id_less_than);
        } else if (dto.where__id_more_than) {
            where.id = MoreThan(dto.where__id_more_than);
        }

        const posts = await this.postRepository.find({
            where,

            order: {
                createdAt: dto.order__createdAt,
            },
            take: dto.take,
        });

        // 해당되는 포스트가 0개 이상이면
        // 마지막 포스트를 가져오고
        // 아니면 null 을 반환한다.
        const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;

        const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);
        if (nextUrl) {
            /**
             * dto의 키값들을 루핑하면서
             * 키값에 해당되는 밸류가 존재하면
             * param 에 그대로 붙여넣는다.
             * 
             * 단, where__id_more_than 값만 lastItem의 마지막 값으로 넣어준다.
             */
            for (const key of Object.keys(dto)) {
                if (dto[key]) {
                    if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
                        // url 에 쿼리파라미터 추가할 때에는 무조건 toString() 메서드를 이용해서 문자열로 변환해주는 것을 권장한다.
                        nextUrl.searchParams.append(key, dto[key].toString());
                    }
                }
            }

            let key: string;
            if (dto.order__createdAt === 'ASC') {
                key = 'where__id_more_than';
            } else {
                key = 'where__id_less_than';
            }

            nextUrl.searchParams.append(key, lastItem.id.toString());
        }

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
            cursor: {
                after: lastItem?.id ?? null,
            },
            count: posts.length,
            next: nextUrl?.toString() ?? null,
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
