import { Post } from 'App/Models'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { UserFactory, PostMediaFactory } from '.'

export const PostFactory = Factory
  .define(Post, ({ faker }) => {
    return {
      description: faker.lorem.text()
    }
  })
  .relation('user', () => UserFactory)
  .relation('media', () => PostMediaFactory)
  .build()
