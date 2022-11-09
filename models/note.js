import mongoose from 'mongoose'
import dotenv  from 'dotenv'

if ( process.env.NODE_ENV !== 'production' ) {
    dotenv.config()
}

const DB_PASSWORD = process.env.DB_PASSWORD
const DB_COLLECTION = process.env.DB_COLLECTION

let DB = process.env.MONGODB_URI.replace( '<COLLECTION>', DB_COLLECTION )
DB = DB.replace( '<PASSWORD>', DB_PASSWORD )

// const url = process.env.MONGODB_URI

console.log('connecting to MongoDB...')

mongoose.connect( DB, { useNewUrlParser: true, useUnifiedTopology: true })
// mongoose.connect(url, { useNewUrlParser: true })
    .then( () => {
        console.log('===========> connected to MongoDB 🚀')
    })

    .catch((error) => {
        console.log('XXXXXXXXXXX> error connection to MongoDB 😵: ', error.message)
    })

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 5,
        unique: true
    },

    date: Date,

    important: Boolean,
})

noteSchema.set( 'toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
  
const Note = mongoose.model( 'Note', noteSchema )
export default Note

// >>>>>>>>>>>>>>>>>>

// import dotenv  from 'dotenv'
// dotenv.config()

// import mongoose from 'mongoose'

// const DB_PASSWORD = process.env.DB_PASSWORD
// const DB_COLLECTION = process.env.DB_COLLECTION

// let DB = process.env.MONGODB_URI.replace( '<COLLECTION>', DB_COLLECTION )
// DB = DB.replace( '<PASSWORD>', DB_PASSWORD )

// // works!
// // const DB = 'mongodb+srv://asterfinde:G.t.A-281295@cluster0-moocfi.kyguul4.mongodb.net/noteApp?retryWrites=true&w=majority'

// console.log('=======> connecting to mongoDB...')

// mongoose.connect(DB)
//   .then(result => {
//     console.log('=======> connected to MongoDB!!')
//   })
//   .catch((error) => {
//     console.log('XXXXXXXXXXX> error connecting to MongoDB:', error.message)
//   })

// const noteSchema = new mongoose.Schema({
//   content: {
//     type: String,
//     minLength: 5,
//     required: true
//   },
  
//   date: { 
//     type: Date,
//     required: true
//   },
  
//   important: Boolean
// })

// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

// const Note = mongoose.model('Note', noteSchema)

// export default Note