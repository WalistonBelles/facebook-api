import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Post, Reaction } from 'App/Models';
import { UpdateValidator } from 'App/Validators/Reactions'

export default class ReactionsController {
  public async update({ request, auth }: HttpContextContract) {
    const { type, postId } = await request.validate(UpdateValidator);

    const post = await Post.findOrFail(postId);

    const searchPayload = {
      postId,
      userId: auth.user!.id
    }
    const savePayload = { type }

    const reaction = await post.related('reactions').updateOrCreate(searchPayload, savePayload);

    return reaction.related;
  }

  public async destroy({ params }: HttpContextContract) {
    const reaction = await Reaction.findOrFail(params.id);

    await reaction.delete();
  }
}
