const graphql = require('graphql');
const connectionString = {
    "host": "localhost",
    "port": 5432,
    "database": "book_author",
    "user": "postgres",
    "password":"rewq"
};
const pgp = require('pg-promise')();
const db = {}
db.conn = pgp(connectionString);

const {
    GraphQLObjectType, 
    GraphQLString,
    GraphQLID, 
    GraphQLSchema,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString},
        author: {
            type:AuthorType,
            resolve(parent,args){
                const query = `SELECT * FROM "author" WHERE
                id=${parent.authorid}`;
                return db.conn.one(query)
                    .then(data => {
                        return data;
                    })
                    .catch(err => {
                        return 'The error is', err;
                    });
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    // if the fields property is not in the funation then it will show error when we put the relaction 
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                const query = `SELECT * FROM "book" WHERE 
                id = ${parent.id}`;
                return db.conn.many(query)
                    .then(data => {
                        return data;
                    })
                    .catch(err => {
                        return 'The error is', err;
                    });
            }
        }
    })
})

//Main query of the book application.
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: {id: {type:GraphQLID}},           // argments whever we need to pass need to add here (in args)
            resolve(parent, args){
                //code to get data rom db/other source
                //parent is used for relactions 
                //args for taking data from the user-end
                const query = `SELECT * FROM "book" WHERE 
                id = ${args.id}`;
                return db.conn.one(query)
                .then(data => {
                    return data;
                })
                .catch(err => {
                    return 'The error is', err;
                });
            }
        },
        author: {
            type: AuthorType,
            args: {id: {type:GraphQLID}},
            resolve(parent, args){
                const query = `SELECT * FROM "author" WHERE 
                id = ${args.id}`;
                return db.conn.one(query)
                .then(data => {
                    return data;
                })
                .catch(err => {
                    return 'The error is', err;
                });
            }
        },
        //books query will give all the book list and all auth with books
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){   
                const query = `SELECT * FROM "book"`;
                return db.conn.manyOrNone(query)
                .then(data => {
                    return data;
                })
                .catch(err => {
                    return 'The error is', err;
                });
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                const query = `SELECT * FROM "author"`;
                return db.conn.manyOrNone(query)
                .then(data => {
                    return data;
                })
                .catch(err => {
                    return 'The error is', err;
                });
            }
        }
    } 
})

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addAuthor:{
            type:AuthorType,
            args:{
                name:{type:new GraphQLNonNull(GraphQLString)},
                age:{type:new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parent,args){
                const query = `INSERT INTO public.author(
                    name, age )
                    VALUES ('${args.name}',${args.age}) RETURNING *;`;
                    return db.conn.one(query)
                     .then(data => {
                        return data;
                     })
                     .catch(err => {
                        return 'The error is', err;
                     });
            }
        },
        addBook:{
            type:BookType,
            args:{
                name:{ type: new GraphQLNonNull(GraphQLString) },
                genre:{ type: new GraphQLNonNull(GraphQLString) },
                authorId:{type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent,args){
                const query = `INSERT INTO public.book(
                    name, genre, authorid)
                    VALUES ('${args.name}','${args.genre}','${args.authorId}') RETURNING *;`;
                    return db.conn.one(query)
                     .then(data => {
                        return data;
                     })
                     .catch(err => {
                        return 'The error is', err;
                     });
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation:Mutation
});