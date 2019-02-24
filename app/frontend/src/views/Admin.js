import React from 'react';
import { Redirect } from 'react-router-dom';
import AdminTabs from '../components/AdminTabs';

class Admin extends React.Component {

    render() {
        let permissions = window.localStorage.getItem('permissions').split(',')
        if (permissions.indexOf('view_user') >= 0 || permissions.indexOf('view_group') >= 0) {
            return (
                <div className='content'>
                    <AdminTabs />
                </div>
            );
        } else {
            return (<Redirect to='/attendance'/>);
        }
    }
}

export default Admin;