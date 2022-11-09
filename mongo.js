/**
------
Notes
------
• Document databases like Mongo are 'schemaless', meaning that the database itself does not care about the structure of the data that is stored in the database. It is possible to store documents with completely different fields in the same collection

• The Schema tells Mongoose how the 'note' objects are to be stored in the database

• Name model in singular

• Models are so-called constructor functions that create new JavaScript objects based on the provided parameters

• The name of the collection will be the lowercased plural notes, because the Mongoose convention is to
automatically name collections as the plural (e.g. notes) when the schema refers to them in the singular 
(e.g. Note)

• The idea behind Mongoose is that the data stored in the database is given a schema at the level of the application that defines the shape of the documents stored in any given collection

*/

//~
import mongoose from 'mongoose'

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

// URI with database name (noteApp)
const url = `mongodb+srv://asterfinde:${password}@cluster0-moocfi.kyguul4.mongodb.net/noteApp?retryWrites=true&w=majority`

// URI without database name
// const url = `mongodb+srv://notes-app-full:${password}@cluster1.lvvbt.mongodb.net/?retryWrites=true&w=majority`

// Schema definition
const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

// Model definition: Note (model) -> notes (collection)
const Note = mongoose.model('Note', noteSchema)

// noteSchema.set('toJSON', {
  // transform: (document, returnedObject) => {
    // returnedObject.id = returnedObject._id.toString()
    // delete returnedObject._id
    // delete returnedObject.__v
  // }
// })

// using Mongoose 
mongoose
  .connect(url)
  .then( () => {
    // console.log('connected')
	
	// Model fetch objects (data): remove _id and __v before sending to the front end 
	Note.find({}, {_id :0, __v:0}).then(result => {
      result.forEach(n => {
		console.log( `${n.content} ${n.important}` )
    })
		// mongoose.connection.close()
	})

	// // Model creates a new note object based on the provided parameters
    // const note = new Note({
      // content: 'Callback functions sucks!',
      // date: new Date(),
      // important: true,
    // })

    // return note.save()
  })
  .then(() => {
	console.log('notes:')
    return mongoose.connection.close()  
 
    // console.log('note saved!')
    // return mongoose.connection.close()
  })
  .catch((err) => console.log(err))