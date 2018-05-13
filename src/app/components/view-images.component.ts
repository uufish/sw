import { Component, OnDestroy, OnInit } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';

import { Post } from '../interfaces/post';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-view-images',
  template: `
    <app-header></app-header>

    <nz-content *ngIf='graphQLErrors.length || networkError'>
      <app-card-error-graphql *ngIf='graphQLErrors.length' [errors]='graphQLErrors'>
      </app-card-error-graphql>
      <app-card-error-network *ngIf='networkError' [error]='networkError'>
      </app-card-error-network>
    </nz-content>

    <nz-content *ngIf='!graphQLErrors.length && !networkError'>
      <app-card-image
        *ngFor='let node of posts'
        [createdAt]='node.createdAt'
        [id]='node.id'
        [photoURLs]='node.photoURLs'>
      </app-card-image>
    </nz-content>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
    }

    .ant-layout-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 8px;
      overflow: auto;
    }
  `]
})
export class ViewImagesComponent implements OnInit, OnDestroy {
  public authState$$;

  public posts: Post[] = [];

  // errors
  public graphQLErrors = [];
  public networkError = null;

  constructor (
    private postsService: PostsService,
    private afAuth: AngularFireAuth) {
  }

  private onChangeAuthState () {
    const posts$ = this.postsService.getPostsAsPhoto((ref) => {
      return ref.limit(50).orderBy('createdAt', 'desc');
    });
    const posts$$ = posts$.subscribe((docs) => {
      docs.forEach((node, index) => {
        setTimeout(() => {
          this.posts.push(node);
        }, index * 50);
      });
      posts$$.unsubscribe();
    });
  }

  public ngOnInit () {
    const authState$ = this.afAuth.authState;
    this.authState$$ = authState$.subscribe(() => {
      this.onChangeAuthState();
    });
  }

  public ngOnDestroy () {
    this.authState$$.unsubscribe();
  }
}
