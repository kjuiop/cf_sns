import { 
  NotFoundException
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';

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
            }
        });
    }

    async getPostById(id: number) {
        const post = await this.postRepository.findOne({
            where: {
                id,
            }
        });
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }
        return post;
    }

    async createPost(author: string, title: string, content: string) {
        // 1) create -> 저장할 객체를 생성한다.
        // 2) save -> 객체를 저장한다.

        const post = this.postRepository.create({
            title,
            content,
            likeCount: 0,
            commentCount: 0,
        });

        const newPost = await this.postRepository.save(post);
        return newPost;
    }

    async updatePost(id: number, author?: string, title?: string, content?: string) {
        
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

        if (title) {
            post.title = title;
        }
        if (content) {
            post.content = content;
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
}
