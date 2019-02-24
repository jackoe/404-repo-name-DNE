import React from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import ReactCollapsingTable from 'react-collapsing-table';
import AddUserModal from './AddUserModal';
import EditUserButton from './EditUserButton';
import { httpGet } from './Helpers';

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showUserModal: false,
            users: [],
            role_ids: {},
            role_names: {},
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.updateRow = this.updateRow.bind(this);
    }

    async componentDidMount() {
        try {
            const users = await httpGet('http://127.0.0.1:8000/api/users');
            const roles = await httpGet('http://127.0.0.1:8000/api/groups');
            const role_ids = {};
            const role_names = {};
            for (var index in roles) {
                role_ids[roles[index].name] = roles[index].id;
                role_names[roles[index].id] = roles[index].name;
            }
            this.setState({
                users: users,
                role_ids: role_ids, 
                role_names: role_names,
            });
        } catch (e) {
            console.log(e);
        }
    }

    async componentDidUpdate() {
        if (this.props.refreshRoles) {
            const roles = await httpGet('http://127.0.0.1:8000/api/groups');
            const role_ids = {};
            const role_names = {};
            for (var index in roles) {
                role_ids[roles[index].name] = roles[index].id;
                role_names[roles[index].id] = roles[index].name;
            }
            this.setState({
                role_ids: role_ids, 
                role_names: role_names,
            });
            this.props.toggleRefreshRoles(false);
        }
    }

    openModal() {
        this.setState({showUserModal: true});
    }

    closeModal(user=null) {
        const { users } = this.state;
        if (user !== null) {
            users.push({
                'id': user.id, 
                'username': user.username, 
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': user.groups, 
                'last_login': user.last_login,
                'is_active': user.is_active
            });
        }
        this.setState({showUserModal: false, users: users});
    }

    checkmark(boolean) {
        if (boolean) {
            return "&#10003;";
        } else {
            return "";
        }
    }

    getFormattedTime(dateString) {
        if (dateString === null || dateString.length === 0) {
            return '';
        }
        let splitDateTime = dateString.split("T")
        let date = splitDateTime[0]
        let time = splitDateTime[1].split(".")[0]
        let splitTime = time.split(":")
        let hours = parseInt(splitTime[0])
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours
        var formattedTime = date + ' ' + hours + ':' + splitTime[1] + ' ' + ampm
        return formattedTime;
    }

    getUserRoleNames(groups) {
        const group_names = [];
        for (var index in groups) {
            group_names.push(this.state.role_names[groups[index]]);
        }
        return group_names.join(', ');
    }

    updateRow(user, id = null) {
        let { users } = this.state;
        if (id !== null) {
            users = users.filter(item => item.id !== id);
        } else {
            users = users.filter(item => item.id !== user.id);
            users.push({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'groups': user.groups,
                'last_login': user.last_login,
                'is_active': user.is_active
            });
        }
        this.setState({ users: users });
    }

    render() {
        const rows = this.state.users.map(user =>
            (
               {
                   username: user.username,
                   first_name: user.first_name,
                   last_name: user.last_name,
                   name: user.first_name + " " + user.last_name,
                   roles: this.getUserRoleNames(user.groups),
                   groups: user.groups,
                   lastLogin: this.getFormattedTime(user.last_login),
                   isActive: this.checkmark(user.is_active),
                   id: user.id,
                   is_active: user.is_active,
                   role_ids: this.state.role_ids,
               }
           )
        ).sort((a, b) => {
            return a.username.localeCompare(b.username);
        });

        const columns = [
            {
                accessor: 'username',
                label: 'Username',
                priorityLevel: 1,
                position: 1,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'name',
                label: 'Name',
                priorityLevel: 2,
                position: 2,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'lastLogin',
                label: 'Last Login',
                priorityLevel: 3,
                position: 3,
                minWidth: 100,
                sortable: true
            },
            {
                accessor: 'roles',
                label: 'User Roles',
                priorityLevel: 4,
                position: 4,
                sortable: true,
                minWidth: 30
            },
            { 
                accessor: 'isActive',
                label: 'Active',
                priorityLevel: 5,
                position: 5,
                minWidth: 20,
                sortable: true, 
            },
            { 
                accessor: 'edit',
                label: '',
                priorityLevel: 6,
                position: 6,
                CustomComponent: EditUserButton,
                minWidth: 50,
                sortable: false, 
            }
        ];
        const tableCallbacks = { edit: this.updateRow }

        return (
            <div className='content'>
                <h1>User Management</h1>
                <br/>
                <ButtonToolbar style={{ float: 'right'}}>
                    <Button onClick={this.openModal}>New User</Button>
                </ButtonToolbar>
                <AddUserModal role_ids={this.state.role_ids}
                    show={this.state.showUserModal}
                    onSubmit={this.closeModal} />
                <ReactCollapsingTable
                        rows = { rows }
                        columns = { columns }
                        column = {'username'}
                        direction = {'descending'}
                        showPagination={ true }
                        callbacks={ tableCallbacks }
                />
            </div>
        );
    }
}

export default Users;