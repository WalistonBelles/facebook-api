import { File } from 'App/Models';
import Factory from '@ioc:Adonis/Lucid/Factory';

export const PostMediaFactory = Factory.define(File, ({ faker }) => {
  return {
    fileCategory: 'post' as const,
    fileName: `${faker.datatype.uuid()}.png`
  }
}).build()
