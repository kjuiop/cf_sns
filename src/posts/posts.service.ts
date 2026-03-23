import { 
  NotFoundException
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';


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

@Injectable()
export class PostsService {

    getAllPosts(): PostModel[] {
        return posts;
    }

    getPostById(id: number): PostModel {
        const post = posts.find(post => post.id === Number(id));
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }
        return post;
    }

    createPost(author: string, title: string, content: string): PostModel {
        const post = {
            id: posts[posts.length - 1].id + 1,
            author,
            title,
            content,
            likeCount: 0,
            commentCount: 0,
        }
        
        posts = [
            ...posts,
            post,
        ];
        
        return post;
    }

    updatePost(id: number, author?: string, title?: string, content?: string): PostModel {
        const post = posts.find(post => post.id === id);
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        if (author) {
            post.author = author;
        }
        if (title) {
            post.title = title;
        }
        if (content) {
            post.content = content;
        }

        // +id : string -> number
        posts = posts.map(prevPost => prevPost.id === id ? post : prevPost);

        return post;
    }

    deletePost(id: number): number {
        const post = posts.find(post => post.id === id);
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        posts = posts.filter(post => post.id !== id);
        return id;
    }
}
