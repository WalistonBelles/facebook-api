import Route from '@ioc:Adonis/Core/Route'

Route.post('/auth', 'Auth/Main');
Route.delete('/auth', 'Auth/Main.destroy').middleware('auth');