import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import { PostFactory, UserFactory } from 'Database/factories'
import { generateToken, request } from 'Test/utils'
import { Post } from 'App/Models'
import faker from 'faker'

test.group('/posts', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  });

  // index
  test('[index] - should able to list posts with username filter', async (assert) => {
    const user = await UserFactory.with('posts', 3, (post) => post.with('media')).create()
    const { token } = await generateToken();

    const { body } = await request
      .get(`/posts?username=${user.username}`)
      .set('authorization', `bearer ${token}`)
      .expect(200)

    assert.lengthOf(body, user.posts.length)
    body.forEach((post: Post) => {
      assert.exists(post.id)
      assert.exists(post.description)
      assert.exists(post.user.name)
      assert.exists(post.user.username)
      assert.exists(post.comments)
      assert.exists(post.commentsCount)
      assert.exists(post.reactionsCount.like)
      assert.exists(post.reactionsCount.love)
      assert.exists(post.reactionsCount.haha)
      assert.exists(post.reactionsCount.sad)
      assert.exists(post.reactionsCount.angry)
    })
  })

  test('[index] - should able to list your own posts when username filter is missing', async (assert) => {})

  // store
  test('[store] - should able to store a post when authenticated', async (assert) => {
    const { token } = await generateToken();

    const { body } = await request
      .post('/posts')
      .set('authorization', `bearer ${token}`)
      .send({ description: faker.lorem.words()})
      .expect(200)

    assert.exists(body.id)
    assert.exists(body.description)
  })

  test('[store] - should fail to store a post when is not authenticated', async (assert) => {
    await request
      .post('/posts')
      .send({ description: faker.lorem.words()})
      .expect(401)
  })

  // update
  test('[update] - should able to update a post when authenticated', async (assert) => {
    const { token, user } = await generateToken();
    const post = await PostFactory.merge({ userId: user.id }).create();
    const newDescription = faker.lorem.words();

    const { body } = await request
      .put(`/posts/${post.id}`)
      .set('authorization', `bearer ${token}`)
      .send({ description: newDescription })
      .expect(200)

    assert.equal(body.description, newDescription)
  })

  test('[update] - should fail to update a post when is not authenticated', async (assert) => {
    const post = await PostFactory.create();
    await request.put(`/posts/${post.id}`).send({ description: faker.lorem.words() }).expect(401)
  })

  test('[update] - should fail to update a post from another user', async (assert) => {
    const { token } = await generateToken();
    const post = await PostFactory.create();

    await request
      .put(`/posts/${post.id}`)
      .set('authorization', `bearer ${token}`)
      .send({ description: faker.lorem.words() })
      .expect(401)
  })

  // destroy
  test('[destroy] - should able to destroy a post when authenticated', async (assert) => {
    const { token, user } = await generateToken();
    const post = await PostFactory.merge({ userId: user.id }).create();

    await request.delete(`/posts/${post.id}`).set('authorization', `bearer ${token}`).expect(200)

    const postAfterDelete = await Database.from('posts').where({ id: post.id }).first()

    assert.isNull(postAfterDelete)
  })

  test('[destroy] - should fail to destroy a post when is not authenticated', async (assert) => {
    const post = await PostFactory.create();

    await request.delete(`/posts/${post.id}`).expect(401)
  })

  test('[destroy] - should fail to destroy a post from another user', async (assert) => {
    const { token } = await generateToken();
    const post = await PostFactory.create();

    await request.delete(`/posts/${post.id}`).set('authorization', `bearer ${token}`).expect(401)
  })
})

test.group('/posts/:id/media', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  });

  test('[store] - should able to attach an image to a post', async (assert) => {
    const { user, token } = await generateToken();
    const post = await PostFactory.merge({ userId: user.id }).create()

    await request
      .post(`/posts/${post.id}/media`)
      .set('authorization', `bearer ${token}`)
      .attach('file', '../assets/image.jpg')
      .expect(200)

    const postMedia = await Database.from('files')
      .where({ file_category: 'post', owner_id: post.id })
      .first()

    assert.exists(postMedia.id)
  })

  test('[store] - should fail to attach an image to a post from another user', async (assert) => {})
})
