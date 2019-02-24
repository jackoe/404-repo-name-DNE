import React from 'react';
import  { Link } from 'react-router-dom';
import { Jumbotron } from 'react-bootstrap';

class NotFound extends React.Component {
    render() {
        return (
            <div className='content'>
                <Jumbotron> 
                    <div className='content-jumbotron'>
                        <h1>
                            404 <small>page not found</small>
                        </h1>
                        <p>
                            The page you're looking for has mysteriously disappeared! 
                            Try navigating from <Link to='/attendance'>the home page</Link> to take another look.
                        </p>
                    </div>
                </Jumbotron>
            </div>
        );
    }
}

export default NotFound;