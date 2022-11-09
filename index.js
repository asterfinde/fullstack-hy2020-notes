//~
import express from 'express'

import cors from 'cors'

import Note from './models/note.js'

const HOST_NAME = process.env.HOST_NAME || 'localhost'
const PORT = process.env.PORT || 3001

const requestLogger = ( request, response, next ) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('FullUrl: ', request.protocol + '://' + request.get('host') + request.originalUrl)
    console.log('---------')
    next()
}

const app = express() 

app.use( express.static('build') )
app.use( express.json() )
app.use( requestLogger )
app.use( cors() )

app.get( '/api/notes', ( request, response ) => {
    Note.find({}).then(notes => {
        response.json(notes.map(note => note.toJSON()))
    })
})
  
app.get( '/api/notes/:id', ( request, response, next ) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note.toJSON())
            } else {
                response.status(404).end()
            }
        })

        .catch(error => next(error))
})
  
app.post( '/api/notes', ( request, response, next ) => {
    const body = request.body
  
    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })
  
    note.save()
        .then(savedNote => {
            response.json(savedNote.toJSON())
        })
        
        .catch(error => next(error))
})
  
app.delete( '/api/notes/:id', ( request, response, next ) => {
    Note.findByIdAndRemove(request.params.id)
        .then( () => {
            response.status(204).end()
        })

        .catch(error => next(error))
  })

// update: validations are not run by default when findOneAndUpdate is executed
// must be forced with 'runValidators: true'
app.put( '/api/notes/:id', ( request, response, next ) => {
    const { content, important } = request.body

    Note.findByIdAndUpdate(
        request.params.id, 
        { content, important },
        { new: true, runValidators: true, context: 'query' }
    )

    .then( updatedNote => {
        response.json(updatedNote)
    })

    .catch( error => next(error) )
})

const unknownEndpoint = ( request, response ) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use( unknownEndpoint )

const handleDuplicateKeyError = (error, response) => {
    const code = 409

    const field = Object.keys( error.keyValue )
    const dataError = error.keyValue[ field ]

    // console.log('=====>0 ***', field)
    // console.log('=====>1 ***', content)
    // console.log('=====>1 ***', error)

    // console.log('=====>2 ***', Object.keys(error))
    // console.log('=====>3 ***', Object.values(error))

    //objectName.keyName = value

    response.status(code).send({messages: `A Note with text '${dataError}' already exists.`})
 }

const handleValidationError = ( error, response ) => {
    const  code = 400

    let errors = Object.values(error.errors).map(el => el.message)
    let fields = Object.values(error.errors).map(el => el.path)
    
    if ( errors.length > 1 ) {
        const formattedErrors = errors.join(' ')

        response.status(code).send({messages: formattedErrors, fields: fields})

    } else {
        response.status(code).send({messages: errors, fields: fields})
    
    }
}

const errorHandler = ( error, request, response, next ) => {
    console.error(error.message)
  
    if ( error.name === 'CastError' && error.kind == 'ObjectId' ) {
        return response.status(400).send({ error: 'malformatted id' })

    }  else if ( error.name === 'ValidationError' ) {
        return handleValidationError( error, response )
    
    }  else if ( error.code && error.code == 11000 ) {
        return handleDuplicateKeyError( error, response )

    }

    next(error)
}
app.use( errorHandler )
  
app.listen(PORT, HOST_NAME, () => {
        console.log(`Server running on port ${PORT}`)
})

// //~
// import express from 'express'

// import cors from 'cors'

// import Note from './models/note.js'

// const requestLogger = ( request, response, next ) => {
// 	console.log('Method:', request.method)
// 	console.log('Path:  ', request.path)
// 	console.log('Body:  ', request.body)
// 	console.log('FullUrl: ', request.protocol + '://' + request.get('host') + request.originalUrl)
// 	console.log('---------')
	
// 	next()
// }

// const HOST_NAME = process.env.HOST_NAME || 'localhost'
// const PORT = process.env.PORT || 3001

// const app = express()

// // correct order!!
// app.use( express.static('build') )	// to make express show static content

// app.use( express.json() )

// app.use( requestLogger )

// app.use( cors() )

// // create
// app.post('/api/notes', (request, response, next) => {
//   const body = request.body

//   // if (body.content === undefined) {
//     // return response.status(400).json({ error: 'content missing' })
//   // }

//   const note = new Note({
//     content: body.content,
//     important: body.important || false,
//     date: new Date(),
//   })

//   // note.save().then(savedNote => {
//     // response.json(savedNote)
//   // })
  
//   note.save()
//     .then(savedNote => {
//       response.json(savedNote)
//     })
//     .catch(error => next(error))
// })

// // read
// app.get('/api/notes', (request, response) => {
//   Note.find({}).then(notes => {
// 	response.json(notes)
//   })
// })

// app.get('/api/notes/:id', (request, response, next) => {
//   Note.findById(request.params.id)
//     .then(note => {
//       if (note) {
//         response.json(note)
//       } else {
//         response.status(404).end() 
//       }
//     })
// 	.catch(error => next(error))
// })

// // update: validations are not run by default when findOneAndUpdate is executed
// // must be forced
// app.put('/api/notes/:id', (request, response, next) => {
//   const { content, important } = request.body

//   Note.findByIdAndUpdate(
//     request.params.id, 
//     { content, important },
//     { new: true, runValidators: true, context: 'query' }
//   ) 
//     .then(updatedNote => {
//       response.json(updatedNote)
//     })
//     .catch(error => next(error))
// })

// // app.put('/api/notes/:id', (request, response, next) => {
//   // const body = request.body

//   // const note = {
//     // content: body.content,
//     // important: body.important,
//   // }

//   // Note.findByIdAndUpdate(request.params.id, note, { new: true })
//     // .then(updatedNote => {
//       // response.json(updatedNote)
//     // })
//     // .catch(error => next(error))
// // })

// // delete
// app.delete('/api/notes/:id', (request, response, next) => {
//   Note.findByIdAndRemove(request.params.id)
//     .then(result => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })

// const unknownEndpoint = ( request, response ) => {
// 	response.status( 404 ).send({ error: 'unknown endpoint' })
// }

// app.use( unknownEndpoint )

// const errorHandler = (error, request, response, next) => {
//   console.error(error.message)

//   if (error.name === 'CastError') {
//     return response.status(400).send({ error: 'malformatted id' })
//   } else if (error.name === 'ValidationError') {
//     return response.status(400).json({ error: error.message })
//   }

//   next(error)
// }

// // this has to be the last loaded middleware
// app.use( errorHandler )

// app.listen( PORT, HOST_NAME, () => {
// 	console.log( `=======> Server running at 'http://${HOST_NAME}:${PORT}/'` );
// })
