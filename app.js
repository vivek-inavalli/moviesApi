const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbpath = path.join(__dirname, 'moviesData.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null

const initializing = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (err) {
    console.log(`DB error ${err.message}`)
    process.exit(1)
  }
}

initializing()

const converting1 = each => {
  return {
    movieName: each.movie_name,
  }
}

// app.get('/', (req, res) => {
//   res.send('hiihi')
// })

app.get('/movies/', async (request, response) => {
  const movieQuery = `
    SELECT movie_name FROM movie;
   `
  const getResult = await db.all(movieQuery)
  response.send(getResult.map(each => converting1(each)))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postQuery = `
    INSERT INTO
    movie(director_id ,movie_name, lead_actor)
  VALUES
    ( '${directorId}','${movieName}', '${leadActor}');
  `
  await db.run(postQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const getMovieByID = `
   SELECT 
     movie_id AS movieId, 
     director_id AS directorId, 
     movie_name AS movieName, 
     lead_actor AS leadActor
   FROM movie 
   WHERE movie_id = ${movieId};
  `
  const result = await db.get(getMovieByID)
  res.send(result)
})

app.put('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const {directorId, movieName, leadActor} = req.body
  const putmoviebyId = `
   UPDATE
    movie
  SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};
  `
  await db.run(putmoviebyId)
  res.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (req, res) => {
  const {movieId} = req.params
  const deleteMovie = `
   DELETE FROM movie 
   WHERE movie_id = ${movieId}
  `
  await db.run(deleteMovie)
  res.send('Movie Removed')
})

const convertingdirectors = each => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  }
}

app.get('/directors/', async (req, res) => {
  const getdirectors = `
   SELECT  director_id, director_name FROM director;
  `;
  const directors = await db.all(getdirectors)
  res.send(directors.map(each => convertingdirectors(each)));
});

app.get('/directors/:directorId/movies/', async (req, res) => {
  const {directorId} = req.params
  const finalQuery = `
    SELECT movie.movie_name as movieName 
    FROM 
       director NATURAL JOIN movie
     WHERE director.director_id = '${directorId}';
  `
  const finalres = await db.all(finalQuery)
  res.send(finalres)
})

module.exports = app
