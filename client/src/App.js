import React from 'react';
// import logo from './logo.svg';
// import './App.css';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
//components
import BookList from './components/BookList';
import AddBook from './components/AddBook';

//apollo client setup
const client = new ApolloClient({
  // uri:'http://localhost:4000/graphql'
  uri:'http://localhost:4000/api'

})
function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Sankar</h1>
        <BookList/>
        <AddBook/>
      </div>
    </ApolloProvider>
  );
}

export default App;
